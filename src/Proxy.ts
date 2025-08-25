import puppeteer, {TimeoutError} from 'puppeteer'
import useProxy from '@lem0-packages/puppeteer-page-proxy'
import {Log} from '@/Log'
import {appConfig} from '@/config/app'

export class Proxy {
    private static list: string[]
    private static index: number

    public static async loadProxyList() {
        const resp = await fetch("https://api.proxytraff.com/package/get?c=K5hk");

        Proxy.list = (await resp.text()).split('\n');
        Proxy.index = 0
    }

    //select N fast proxies checking it one by one
    public static async select(needProxiesNumber = 1) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage()
        const proxiesFound = []

        while (proxiesFound.length < needProxiesNumber) {
            const proxy = Proxy.list[Proxy.index]

            await useProxy(page, `http://${proxy}`)

            page.setDefaultNavigationTimeout(appConfig.proxy.maxProxyResponseTimeMS)

            try {
                await page.goto('https://www.example.com')
            } catch (e) {
                if (e!.constructor === TimeoutError) {
                    Log.warn(`Slow proxy ${proxy}`)
                    Proxy.index += 1
                    continue
                }
            }

            proxiesFound.push(proxy)
        }

        await browser.close()

        return proxiesFound.slice(0, needProxiesNumber)
    }
}
