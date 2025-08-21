import {App} from "./App"


import express from 'express';
import * as process from "node:process";
import {config} from "dotenv";
import {Log} from "@/Log";

const app = express();
const port = 3000;

app.use(express.json());

// Получить список ресурсов
app.get('/', (req, res) => {
    res.sendStatus(200);
});

app.get('/test', (req, res) => {
    App.main([
        'lada'
    ])
    res.sendStatus(200);
})

app.listen(port, () => {
    Log.info(`REST API сервер запущен на порту ${port}`)

    Object.assign(process.env, config().parsed);
});
