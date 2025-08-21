import puppeteer, {Browser as PuppeteerBrowser, Page, PuppeteerLaunchOptions} from "puppeteer";
import useProxy from "@lem0-packages/puppeteer-page-proxy";

export class Browser {
    public browser: PuppeteerBrowser | undefined;
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

    async newPage(proxy?: string): Promise<Page> {
        if (!this.browser) {
            throw new Error("Browser does not ready");
        }

        const page = await this.browser.newPage();

        if (proxy) {
            await useProxy(page, `http://${proxy}`)
        }

        // disable timeout
        await page.setDefaultNavigationTimeout(2000);

        return page
    }
}
