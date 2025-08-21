import {Browser} from "./Browser";
import {Page} from "puppeteer";
import {CaptchaSolver} from "@/captcha/CaptchaSolver";
import {KeywordsQueue} from "@/KeywordsQueue";
import {Log} from "@/Log";

export class App {
    private static maxPage = 1

    private static getPageUrl(keyword: string, pageNumber: number): string {
        const baseUrl = 'https://yandex.ru/search/';
        const params: Record<any, any> = {
            text: keyword,
            search_source: 'dzen_desktop_safe',
            lr: 46
        };

        if (pageNumber === 1) {
            params.p = pageNumber
        }

        const url = new URL(baseUrl);

        return url.toString();
    }

    private static async parseKeyword(browser: Browser, keyword: string) {
        const {error, page: pageAwait} = await browser.newPage()

        for (let pageNumber = 1; pageNumber <= App.maxPage; pageNumber++) {
            const pageUrl = App.getPageUrl(keyword, pageNumber)

            if (error) {
                Log.error('Can not open page', {error})
                throw error
            }

            const page = pageAwait as Page
            const captchaSolver = new CaptchaSolver(page)

            const solved =captchaSolver.solveCaptcha()

            if (!solved) {
                Log.warn('Captcha not solved')
            }

            Log.todo('Here is shall be page parsing')
        }
        page.close()
    }

    public static async main(keywords: string[]) {
        //[start] start browser
        const browser = new Browser({
            headless: false,
        });

        await browser.launch();
        browser.newPage()
        browser.newPage()
        browser.newPage()
        return
        //[end]


        const keywordsQueue = new KeywordsQueue(keywords)
        const maxTabs = 3
        const parsed = []

        while (parsed.length < keywords.length) {
            App.parseKeyword(browser, )
        }
    }
}