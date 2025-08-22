import {App} from "./App"


import express from 'express';
import * as process from "node:process";
import {config} from "dotenv";
import {Log, LogLevelEnum} from "@/Log";

const app = express();
const port = 3000;

app.use(express.json());

app.get('/parse', async (req, res) => {
    const keywordsList = [
        'lada'
    ]

    res.sendStatus(200);

    const result = await App.main(keywordsList)

    Log.info('Parsing result: ' + JSON.stringify(result))
})

app.listen(port, () => {
    Log.setLogLevel(LogLevelEnum.DEBUG);
    Log.info(`REST API сервер запущен на порту ${port}`)

    Object.assign(process.env, config().parsed);
});
