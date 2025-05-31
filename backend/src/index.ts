import express, { Request, Response } from "express";
import cors from "cors";
import dayjs from "dayjs";

type Message = {
    "id": number,
    "username": string,
    "text": string,
    "timestamp": string,
    "lifetime": number,
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
        lifetime: 86400,
    };
    
    messages.push(timeMessage);

    const timerInterval = setInterval(() => {
        timeMessage.lifetime--;

        if (timeMessage.lifetime <= 0) {
            const systemMessageIndex = messages.findIndex(message => message.username === "System");
            if (systemMessageIndex !== -1) {
                messages.splice(systemMessageIndex, 1); // Удаляем сообщение по индексу
            }

            clearInterval(timerInterval);
        }
    }, 1000);

}

setInterval(checkMidnight, 1000);

function checkMidnight() {
  const now = dayjs();
  if (now.hour() === 0 && now.minute() === 0 && now.second() === 0) {
    addMidnightMessage();
  }
}

function addMessageWithLifetime(message: Message) {
    messages.push(message);

    setTimeout(() => {
        const messageIndex = messages.findIndex(m => m.id === message.id);
        if (messageIndex !== -1) {
            messages.splice(messageIndex, 1);
        }
    }, message.lifetime * 1000);

    setInterval(() => {
        message.lifetime--;
    }, 1000);
}

server.get("/messages", function (req: Request, res: Response) {
    res.status(200).json([...messages]);
});


server.post("/messages", function (req: Request, res: Response) {
    const { username, text } = req.body;

    if (typeof username !== "string") {
        res.status(400).send({
            message: "Username must be a string",
        });
        return;
    }

    if (username.length < 2) {
        res.status(400).send({
            message: "Username must be at least 2 characters long",
        });
        return;
    }

    if (username.length > 50) {
        res.status(400).send({
            message: "Username must be no more than 50 characters long",
        });
        return;
    }

    if (typeof text !== "string") {
        res.status(400).send({
            message: "Message text must be a string",
        });
        return;
    }

    if (text.length < 1) {
        res.status(400).send({
            message: "Message text must be at least 1 character long",
        });
        return;
    }

    if (text.length > 500) {
        res.status(400).send({
            message: "Message text must be no more than 500 characters long",
        });
        return;
    }

    const newMessage = {
        id: idIterator.next().value as number,
        text,
        timestamp: dayjs(new Date().toISOString()).format("HH:mm"),
        username,
        lifetime: 60,
    };
    
    //messages.push(newMessage);
    addMessageWithLifetime(newMessage);
    res.status(201).send(newMessage);
});

server.patch("/messages/:id", function (req: Request, res: Response) {
    const messageId = parseInt(req.params.id, 10);
    const { text, username } = req.body;

    const messageIndex = messages.findIndex(message => message.id === messageId);
    
    if (messageIndex === -1) {
        res.status(404).send({
            message: "Message not found",
        });
        return;
    }

    if (messages[messageIndex].username.trim().replaceAll(" ", "") !== username.trim().replaceAll(" ", ""))  {
        res.status(403).send({
            message: "You can only edit your own messages",
        });
        return;
    }

    if (typeof text !== "string") {
        res.status(400).send({
            message: "Message text must be a string",
        });
        return;
    }

    if (text.length < 1) {
        res.status(400).send({
            message: "Message text must be at least 1 character long",
        });
        return;
    }

    if (text.length > 500) {
        res.status(400).send({
            message: "Message text must be no more than 500 characters long",
        });
        return;
    }

    messages[messageIndex].text = text;
    res.status(200).send(messages[messageIndex]);
});

server.delete("/messages/:id", function (req: Request, res: Response) {
    const messageId = parseInt(req.params.id, 10);
    const { username } = req.body;

    const messageIndex = messages.findIndex(message => message.id === messageId);

    if (messageIndex === -1) {
        res.status(404).send({
            message: "Message not found",
        });
        return;
    }

    if (messages[messageIndex].username.trim().replaceAll(" ", "") !== username.trim().replaceAll(" ", "")) {
        res.status(403).send({
            message: "You can only delete your own messages",
        });
        return;
    }

    messages.splice(messageIndex, 1);
    res.status(200).send({
        message: "Message deleted successfully",
    });
});


server.listen(PORT, function () {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
