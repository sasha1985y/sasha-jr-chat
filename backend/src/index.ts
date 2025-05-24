import express, { Request, Response } from "express";
import cors from "cors";
import dayjs from "dayjs";

type Message = {
    "id": number,
    "username": string,
    "text": string,
    "timestamp": string,
};

const server = express();
const PORT = 4000;

const messages: Message[] = [];

function* infiniteSequence() {
    let i = 0;
    while (true) {
        yield ++i;
    }
}

const idIterator = infiniteSequence();

server.use(cors());
server.use(express.json());

// Функция, которая добавляет системное сообщение
function addMidnightMessage() {
    const currentTimeStr = dayjs().format("D MMMM YYYY");
    const timeMessage: Message = {
        id: idIterator.next().value as number,
        username: "System",
        text: `<div>${currentTimeStr}</div>`,
        timestamp: dayjs().toISOString(),
    };
    messages.push(timeMessage);
}

setInterval(checkMidnight, 1000);

function checkMidnight() {
  const now = dayjs();
  if (now.hour() === 0 && now.minute() === 0 && now.second() === 0) {
    addMidnightMessage();
  }
}

// server.get("/", function (req: Request, res: Response) {
//     res.status(200).json("Hello from backend");
// });

server.get("/messages", function (req: Request, res: Response) {
    res.status(200).json([...messages]);
});

server.post("/messages", function (req: Request, res: Response) {
    const { username, text } = req.body;

    // 2 Стратегии валидации
    //   1. Проверяются все ошибки и отправляются скопом
    //   2. Проверка останавливается на первой попавшейся ошибке и отправляется эта ошибка

    // *Некрасивенько, что в одном if проводятся сразу все проверки username
    // потому что сложно сформировать адекватное сообщение об ошибке
    if (typeof username !== "string" || username.length < 2 || username.length > 50) {
        res.status(400).send({
            message: "Incorrect username",
        });

        return;
    }

    if (typeof text !== "string" || text.length < 1 || text.length > 500) {
        res.status(400).send({
            message: "Incorrect message text",
        });

        return;
    }

    const newMessage = {
        id: idIterator.next().value as number,
        text,
        timestamp: dayjs(new Date().toISOString()).format("HH:mm"),
        username,
    };
    
    messages.push(newMessage);
    res.status(201).send(newMessage);
});

server.listen(PORT, function () {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
