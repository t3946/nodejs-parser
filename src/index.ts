import {App} from "./App"
import express from 'express';
import * as process from "node:process";
import {config} from "dotenv";
import {Log} from "@/Log";
import {fsReadFile} from 'ts-loader/dist/utils'
import * as fs from 'node:fs'
import {appConfig} from '@/config/app'
import {Proxy} from '@/Proxy'

const app = express();
const port = 3000;

app.use(express.json());

app.get('/test-proxy', async (req, res) => {
    res.sendStatus(200);
    await Proxy.loadProxyList()
    Log.debug('Test proxy')
    const proxy = await Proxy.select(3)
    Log.info('Proxy:', proxy)
})

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

    if (appConfig.proxy.useProxy) {
        await Proxy.loadProxyList()
    }

    const keywordsList = content.split('\n').slice(0, kwNumber)
    const {result, statistic} = await App.main(keywordsList)
    const dir = `dist/${kwNumber} words/${process.env.PROCESSING_MAX} processing`

    fs.mkdir(dir, { recursive: true }, (err) => {
        fs.writeFileSync(`${dir}/result.json`, JSON.stringify(result, null, 4), 'utf8');
        fs.writeFileSync(`${dir}/statistic.json`, JSON.stringify(statistic, null, 4), 'utf8');
    })
})

app.listen(port, () => {
    Log.info(`REST API сервер запущен на порту ${port}`)

    Object.assign(process.env, config().parsed);
    //@ts-ignore
    Log.setLogLevel(appConfig.logLevel);
});
