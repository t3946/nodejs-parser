import {Browser} from "./Browser";
import {ElementHandle, Page} from "puppeteer";
import {CaptchaSolver} from "@/captcha/CaptchaSolver";
import {KeywordsQueue} from "@/KeywordsQueue";
import {Log} from "@/Log";
import {FailureParseError} from "@/exception/FailureParseError";
import {getTimeDifference, sleep} from '@/utils'
import * as process from 'node:process'
import {appConfig} from '@/config/app'
import {Proxy} from '@/Proxy'

type TPosition = {
    url: string
    position: number
    title: string
    text: string
}

type TResultItem = { word: string, positions: TPosition[] }

export class App {
    private static parseDeep = appConfig.parse.deep
    private static timeoutS = 30
    private static headless: boolean = appConfig.browser.headless;

    private static getPageUrl(keyword: string, pageNumber: number): string {
        const baseUrl = 'https://yandex.ru/search/';
        const params: Record<any, any> = {
            text: keyword,
            search_source: 'dzen_desktop_safe',
            lr: 46,
        };

        if (pageNumber > 0) {
            params.p = pageNumber
        }

        const url = new URL(baseUrl);

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        return url.toString();
    }

    private static async parsePage(page: Page, pageNumber: number): Promise<TPosition[]> {
        let searchResultItems: ElementHandle<any>[] = await page.$$('li.serp-item:not(:has(.AdvLabel-Text)):not([data-fast-name="images"])');

        if (searchResultItems.length === 0) {
            searchResultItems = await page.$$('#search-result li .Organic');
        }

        const result: TPosition[] = []
        let position = 0

        for (let i = 0; i < searchResultItems.length; i++) {
            const item = searchResultItems[i]
            const aNode = await item.$('a.Link');
            const titleEl = await item.$('.OrganicTitleContentSpan');
            const textEl = await item.$('.OrganicTextContentSpan');

            if (!aNode || !titleEl || !textEl) {
                continue
            }

            const linkUrl: string = (await aNode.getProperty('href')).toString()
            const title: string = (await titleEl.getProperty('textContent')).toString()
            const text: string = (await textEl.getProperty('textContent')).toString()
            position += 1

            result.push({
                url: linkUrl,
                position: pageNumber * 10 + (position),
                title,
                text,
            })
        }

        return result
    }

    /**
     * @throws Error
     */
    private static async parseKeyword(browser: Browser, keyword: string, proxy?: string): Promise<{
        reports: TPosition[],
        statistic: Record<any, any>
    }> {
        Log.info('Parse keyword: ' + keyword);

        const page = await browser.newPage(proxy)
        const allReports: TPosition[] = []
        const statistic = {
            captchaSolved: 0,
        }

        for (let pageNumber = 0; pageNumber < App.parseDeep; pageNumber++) {
            Log.info('Parse page: ' + (pageNumber + 1));

            //[start] load page
            const url = App.getPageUrl(keyword, pageNumber)

            await page
                .goto(url, {
                    timeout: 1000 * App.timeoutS,
                    waitUntil: 'load',
                })
                .catch(async () => {
                    await page.close()
                    throw new FailureParseError(`Can not go to page: ${url}`)
                })

            const captchaSolver = new CaptchaSolver(page)

            let solved = await captchaSolver.isCaptchaSolved()

            try {
                if (!solved) {
                    const result = await captchaSolver.solveCaptcha()

                    solved = result.status
                    statistic.captchaSolved += captchaSolver.smartCaptchaSolved
                }
            } catch (e) {
                solved = await captchaSolver.isCaptchaSolved()
            }

            if (!solved) {
                Log.warn('Captcha not solved')
                await page.close()
                throw new FailureParseError('Failure parse')
            }
            //[end]


            //parse loaded results
            await sleep(1000)

            const pageReports = await App.parsePage(page, pageNumber)

            allReports.push(...pageReports)
        }

        await page.close()

        return {reports: allReports, statistic}
    }

    public static async main(keywords: string[]): Promise<{ result: TResultItem[], statistic: Record<any, any> }> {
        //start browser
        const browser = new Browser({
            headless: App.headless,
        });
        //@ts-ignore
        const processingMax = parseInt(process.env.PROCESSING_MAX)
        const statistic: any = {
            words: keywords.length,
            captchaSolved: 0,
            processingMax: processingMax
        }

        const resultPromise = new Promise<{
            result: TResultItem[],
            statistic: Record<any, any>
        }>(async (resolve, reject) => {
            Log.info('Parsing begin:')
            const beginDate = new Date();

            await browser.launch()

            const keywordsQueue = new KeywordsQueue(keywords)
            const parsed: TResultItem[] = []
            let processingKeywords = 0

            const interval = setInterval(async () => {
                //all parsed
                if (parsed.length === keywords.length) {
                    const endDate = new Date();

                    statistic.timePassed = getTimeDifference(beginDate, endDate).f
                    resolve({result: parsed, statistic})
                    Log.info('Parsing completed!')
                    clearInterval(interval)
                    return parsed
                }

                //@ts-ignore
                if (!browser.browser.connected) {
                    Log.error('Browser was closed. Parsing abort.')
                    clearInterval(interval)
                    return
                }

                if (processingKeywords === processingMax) {
                    return
                }

                const word = keywordsQueue.take()

                if (!word) {
                    return
                }

                processingKeywords++

                let proxy

                if (appConfig.proxy.useProxy) {
                    proxy = await Proxy.select()
                }

                App.parseKeyword(browser, word, proxy)
                    .then(({reports, statistic: stat}) => {
                        statistic.captchaSolved += stat.captchaSolved
                        parsed.push({word, positions: reports})
                        Log.info(`Parsed: ${parsed.length}/${keywords.length}`)
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
        })

        resultPromise.finally(() => browser.browser?.close())

        return resultPromise
    }
}
