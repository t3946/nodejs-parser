import {App} from "./App"


import express from 'express';
import * as process from "node:process";
import {config} from "dotenv";
import {Log, LogLevelEnum} from "@/Log";
import {fsReadFile} from 'ts-loader/dist/utils'
import * as fs from 'node:fs'

const app = express();
const port = 3000;

app.use(express.json());

app.get('/parse', async (req, res) => {
    //@ts-ignore
    const kwNumber = parseInt(req.query.kw)

    if (!kwNumber) {
        res.sendStatus(400);
        return
    }

    const content = fsReadFile('test/10000.txt')

    if (content === undefined) {
        res.sendStatus(500);
        return
    }

    res.sendStatus(200);

    const keywordsList = content.split('\n').slice(0, kwNumber)
    const result = await App.main(keywordsList)

    fs.writeFileSync(`dist/${kwNumber} words/result.json`, JSON.stringify(result, null, 4), 'utf8');
})

app.listen(port, () => {
    Log.info(`REST API сервер запущен на порту ${port}`)

    Object.assign(process.env, config().parsed);
    Log.setLogLevel(process.env.LOG_LEVEL);
});
