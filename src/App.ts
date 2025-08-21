import {Browser} from "./Browser";
import {Page} from "puppeteer";
import {CaptchaSolver} from "@/captcha/CaptchaSolver";
import {KeywordsQueue} from "@/KeywordsQueue";
import {Log} from "@/Log";
import {FailureParseError} from "@/exception/FailureParseError";

type TPosition = {
    url: string
    position: number
}

export class App {
    private static maxPage = 1
    private static timeoutS = 2
    private static headless: boolean = false;

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

    private static async parsePage(page: Page, pageNumber: number): Promise<TPosition[]> {
        Log.todo('Here is shall be page parsing')

        return []
    }

    /**
     * @throws Error
     */
    private static async parseKeyword(browser: Browser, keyword: string, proxy?: string): Promise<TPosition[]> {
        Log.info('Parse keyword: ' + keyword);

        const page = await browser.newPage(proxy)
        const allReports: TPosition[] = []

        for (let pageNumber = 1; pageNumber <= App.maxPage; pageNumber++) {
            Log.system('Parse page: ' + pageNumber);

            //[start] load page
            const url = App.getPageUrl(keyword, pageNumber)

            await page
                .goto(url, {
                    timeout: 1000 * App.timeoutS,
                    waitUntil: 'load',
                })
                .catch(async () => {
                    await page.close()
                    throw new FailureParseError('Failure parse')
                })

            const captchaSolver = new CaptchaSolver(page)
            const solved = await captchaSolver.solveCaptcha()

            if (!solved) {
                Log.warn('Captcha not solved')

                throw new FailureParseError('Failure parse')
            }
            //[end]


            //parse loaded results
            const pageReports = await App.parsePage(page, pageNumber)

            allReports.push(...pageReports)
        }

        await page.close()

        return allReports
    }

    public static async main(keywords: string[]) {
        Log.info('Parsing begin:')


        //start browser
        const browser = new Browser({
            headless: App.headless,
        });

        await browser.launch()

        const keywordsQueue = new KeywordsQueue(keywords)
        const processingMax = 3
        const parsed: { word: string, positions: TPosition[] }[] = []
        let processingKeywords = 0


        const interval = setInterval(() => {

            const word = keywordsQueue.take()

            //all parsed
            if (parsed.length === keywords.length) {
                Log.info('Parsing completed!', parsed)
                clearInterval(interval)
                return
            }

            //@ts-ignore
            if (!browser.browser.connected) {
                Log.error('Browser was closed. Parsing abort.')
                clearInterval(interval)
                return
            }

            if (
                !word ||
                processingKeywords === processingMax
            ) {
                return
            }

            processingKeywords++

            App.parseKeyword(browser, word)
                .then((positions) => {
                    parsed.push({word, positions})
                })
                .catch((err) => {
                    if (err instanceof FailureParseError) {
                        keywordsQueue.put(word)
                    } else {
                        clearInterval(interval)
                        Log.error('Parsing completed with error', err)
                    }
                })
                .finally(() => processingKeywords--)
        }, 100)
    }
}