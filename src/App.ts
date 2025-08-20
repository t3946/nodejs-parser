import {Browser} from "./Browser";
import {Page} from "puppeteer";

export class App {
    public static async main() {
        const browser = new Browser({
            headless: false,
        });

        await browser.launch();

        const {error, page: pageAwait} = await browser.openPage('https://yandex.ru/search/?text=lada&search_source=dzen_desktop_safe&lr=46');

        if (error) {
            throw error;
        }

        const page = pageAwait as Page

        await page.waitForSelector('#js-button');

        await page.click('#js-button');

        console.log('done')
    }
}