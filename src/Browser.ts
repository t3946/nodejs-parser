import puppeteer, {Browser as PuppeteerBrowser, Page, PuppeteerLaunchOptions} from "puppeteer";
import useProxy from "@lem0-packages/puppeteer-page-proxy";

export class Browser {
    private browser: PuppeteerBrowser | undefined;
    private options: PuppeteerLaunchOptions;

    constructor(options: PuppeteerLaunchOptions = {}) {
        this.options = {
            ignoreHTTPSErrors: true,
            headless: true,
            ...options,
        }
    }

    async launch() {
        this.browser = await puppeteer.launch(this.options);
    }

    async openPage(url: string, proxy?: string) {
        if (!this.browser) {
            throw new Error("Browser does not ready");
        }

        const page = await this.browser.newPage();

        // handle unexpected page close
        page.on('close', () => {
            console.warn('Страница закрылась, но мы не закрываем весь браузер')
        })

        if (proxy) {
            await useProxy(page, `http://${proxy}`)
        }

        // disable timeout
        await page.setDefaultNavigationTimeout(0);

        try {
            const timeoutS = 30

            page
                .goto(url, { timeout: 1000 * timeoutS, waitUntil: 'load' })
                .catch((err) => {
                    console.error('Общая ошибка на итерации с прокси', proxy, err)
                })
        } catch (navError) {
            console.error(`Ошибка навигации с прокси ${proxy}:`, navError)
        }
    }
}
