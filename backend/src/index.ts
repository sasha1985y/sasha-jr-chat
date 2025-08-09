import express, { Request, Response } from "express";
import cors from "cors";
import dayjs from "dayjs";

import { Client } from "pg";

const PORT = process.env.APP_PORT || 4000;

type User = {
  "user_id": number,
  "username": string,
};

type Message = {
    "id": number,
    "username": string | null,
    "text": string,
    "timestamp": string,
    "lifetime": number,
};

const pgClient = new Client({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT || "5432", 10),
    database: process.env.PGDATABASE,
});

const server = express();

async function initServer() {
    if (!process.env.PGUSER) {
        throw new Error("Server cannot be started without database credentials provided in .env file");
    }
    
    server.use(cors());
    server.use(express.json());

    async function getUsers() {
        const usersResponse = await pgClient.query("SELECT * FROM users");
        return usersResponse.rows as User[];
    }

    async function getUserById(userId: number) {
        const usersResponse = await pgClient.query(`SELECT * FROM users WHERE user_id = $1::integer`, [userId]);

        if (usersResponse.rows.length > 0) {
        return usersResponse.rows[0] as User;
        }

        return null;
    }

    async function getUserByName(username: string) {
        const usersResponse = await pgClient.query(`SELECT * FROM users WHERE username = $1::text`, [username]);

        if (usersResponse.rows.length > 0) {
        return usersResponse.rows[0] as User;
        }

        return null;
    }
    
    // Функция, которая добавляет системное сообщение
    async function addMidnightMessage() {
        const currentTimeStr = dayjs().format("D MMMM YYYY");
        const timeMessageText = `<div>${currentTimeStr}</div>`;

        try {
            // Вставляем системное сообщение в базу данных
            const insertResponse = await pgClient.query(`INSERT INTO messages(
                text,
                user_id,
                lifetime
            ) VALUES (
                '${timeMessageText}',
                NULL, -- Системное сообщение не привязано к пользователю
                86400
            ) RETURNING *`);

            console.log("Midnight message added:", insertResponse.rows[0]);
        } catch (err) {
            console.error("Failed to add midnight message:", err);
        }
    }
    
    function checkMidnight() {
        const now = dayjs();
        if (now.hour() === 0 && now.minute() === 0 && now.second() === 0) {
            addMidnightMessage();
        }
    }

    // Запускаем проверку каждую секунду
    setInterval(checkMidnight, 1000);
    
    async function addMessageWithLifetime(message: Message) {
        try {
            // Вставляем сообщение в базу данных
            const insertResponse = await pgClient.query(`INSERT INTO messages(
                text,
                user_id,
                lifetime
            ) VALUES (
                '${message.text}',
                (SELECT user_id FROM users WHERE username = '${message.username}'),
                ${message.lifetime}
            ) RETURNING *`);

            console.log("Message added:", insertResponse.rows[0]);

            // Устанавливаем таймер для удаления сообщения через указанное время
            setTimeout(async () => {
                try {
                    await pgClient.query(`DELETE FROM messages WHERE message_id = ${insertResponse.rows[0].id}`);
                    console.log("Message deleted:", insertResponse.rows[0].id);
                } catch (err) {
                    console.error("Failed to delete message:", err);
                }
            }, message.lifetime * 1000);

            // Устанавливаем таймер для уменьшения времени жизни каждую секунду
            const timerInterval = setInterval(async () => {
                try {
                    await pgClient.query(`UPDATE messages SET lifetime = lifetime - 1 WHERE message_id = ${insertResponse.rows[0].id}`);
                } catch (err) {
                    console.error("Failed to update message lifetime:", err);
                    clearInterval(timerInterval);
                }
            }, 1000);

        } catch (err) {
            console.error("Failed to add message with lifetime:", err);
        }
    }
    
    server.get("/messages", async function (req: Request, res: Response) {
        const messagesResponse = await pgClient.query(`SELECT
            messages.message_id AS id,
            users.username AS username,
            messages.text AS text,
            messages.created_at AS timestamp,
            messages.lifetime AS lifetime
            FROM messages
            LEFT JOIN users ON messages.user_id = users.user_id
            ORDER BY messages.created_at ASC`);

        res.status(200).send(messagesResponse.rows as Message[]);
    });

    server.post("/users", async function (req: Request, res: Response) {
        const { username } = req.body;
        const user = await getUserByName(username);

        if (user !== null) {
            res.status(200).send({
                "user_id": user.user_id,
            });
            return;
        }

        const newUserResponse = await pgClient.query(`INSERT INTO users(
        username
        ) VALUES (
            $1::text
        )`, [username]);

        if (newUserResponse.rowCount === 0) {
            res.sendStatus(500);
        }

        const newUser = await getUserByName(username);

        if (newUser === null) {
            res.sendStatus(500);
            return;
        }

        res.status(200).send({
            "user_id": newUser.user_id,
        });
    });

    server.get("/users", async function(req: Request, res: Response) {
        const usersResponse = await getUsers();
        res.status(200).send(usersResponse);
    });
    
    
    server.post("/messages", async function (req: Request, res: Response) {
        const { user_id, text, lifetime } = req.body;

        const user = await getUserById(user_id);

        if (user === null) {
            res.status(401).send({
                message: "Incorrect username",
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

        let newMessageResponse;

        try {
            
            newMessageResponse = await pgClient.query(`INSERT INTO messages(
                text,
                user_id,
                lifetime
            ) VALUES (
                $1::text, $2::integer, $2::integer)`, [text, user_id, lifetime]);

            // Добавляем сообщение с временем жизни
            addMessageWithLifetime(newMessageResponse.rows[0]);

            res.status(201).send(newMessageResponse.rows[0]);
        } catch (err) {
            console.error(err);
            console.dir(newMessageResponse, {
                depth: 10
            });

            res.status(500).send({
                message: "Failed to add message",
            });
        }
    });
    
    server.patch("/messages/:id", async function (req: Request, res: Response) {
        const messageId = parseInt(req.params.id, 10);
        const { text, username } = req.body;

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

        try {
            const updateMessageResponse = await pgClient.query(`UPDATE messages
                SET text = '${text}'
                WHERE message_id = ${messageId}
                AND user_id = (SELECT user_id FROM users WHERE username = '${username}')
                RETURNING *`);

            if (updateMessageResponse.rowCount === 0) {
                res.status(404).send({
                    message: "Message not found or you are not the author",
                });
                return;
            }

            res.status(200).send(updateMessageResponse.rows[0]);
        } catch (err) {
            res.status(500).send({
                message: "Failed to update message",
            });
        }
    });
    
    server.delete("/messages/:id", async function (req: Request, res: Response) {
        const messageId = parseInt(req.params.id, 10);
        const { username } = req.body;

        try {
            const deleteMessageResponse = await pgClient.query(`DELETE FROM messages
                WHERE message_id = ${messageId}
                AND user_id = (SELECT user_id FROM users WHERE username = '${username}')`);

            if (deleteMessageResponse.rowCount === 0) {
                res.status(404).send({
                    message: "Message not found or you are not the author",
                });
                return;
            }

            res.status(200).send({
                message: "Message deleted successfully",
            });
        } catch (err) {
            res.status(500).send({
                message: "Failed to delete message",
            });
        }
    });

    try {
        await pgClient.connect();
        const res = await pgClient.query('SELECT $1::text as message', ['Hello world!']);
        console.log(res.rows[0].message); // Hello world!
    } catch (err) {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    }

    server.listen(PORT, function () {
        console.log(`[server]: Server is running at http://localhost:${PORT}`);
    });
}

process.on("exit", async function () {
  await pgClient.end();
});


initServer();