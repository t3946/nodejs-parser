import {Page, TimeoutError} from "puppeteer";
import {Capsola} from "@/captcha/Capsola";
import {linkToBase64, sleep} from "@/utils";
import {Log} from "@/Log";

export class CaptchaSolver {
    private static maxAttempts: number = 3;
    private page: Page

    constructor(page: Page) {
        this.page = page;
    }

    private async imgSrcToBase64(selector: string): Promise<string> {
        const imgSrc: string | null = await this.page.$eval(selector, img => img.getAttribute('src'));

        if (!imgSrc) {
            throw new Error('Image not found');
        }

        return linkToBase64(imgSrc);
    }

    private async isCaptchaSolved(): Promise<boolean> {
        return !!(await this.page.$('#search-result'))
    }

    private async isCheckboxCaptcha(): Promise<boolean> {
        return !!(await this.page.$('.CheckboxCaptcha-Anchor'))
    }

    public async solveCaptcha(attempt = 1): Promise<boolean> {
        Log.debug('Solve Captcha')

        //solve checkbox captcha
        if (await this.isCheckboxCaptcha()) {
            Log.debug('Solve checkbox captcha')

            await this.page.waitForSelector('#js-button')
            await this.page.click('#js-button')

            if (await this.isCaptchaSolved()) {
                Log.debug('Check captcha solved');

                return true
            }
        }


        //[start] solve smart captcha
        const taskImgSelector = '.AdvancedCaptcha-ImageWrapper img'

        await this.page.waitForSelector(taskImgSelector)
        Log.debug('Solve smart captcha')

        const questionImgBase64 = await this.imgSrcToBase64(taskImgSelector)
        const taskImgBase64 = await this.imgSrcToBase64('.TaskImage')
        const coords = await Capsola.solve(questionImgBase64, taskImgBase64)

        //solve again
        if (coords === null) {
            Log.debug('no coords')

            if (attempt < CaptchaSolver.maxAttempts) {
                return await this.solveCaptcha(attempt + 1)
            }

            return false
        }


        Log.debug('Coordinates got')

        const rect = await this.page.$eval(taskImgSelector, (element) => {
            const rect = element.getBoundingClientRect();

            return {
                top: rect.top,
                left: rect.left,
            };
        });

        Log.debug('Rect defined')

        for (const {x, y} of coords) {
            Log.debug(`Click by coordinate ${x} ${y}`)
            const aX = rect.left + 10 + x
            const aY = rect.top + y

            await this.page.mouse.click(aX, aY);
            await sleep(100);
        }

        await this.page.click('.CaptchaButton-ProgressWrapper')

        try {
            await Promise.race(
                [
                    this.page.waitForSelector('#search-result'),
                    sleep(3e3)
                ]
            )
        } catch (e) {
            const error: any = e

            if (e!.constructor === TimeoutError) {
                Log.warn(`CaptchaSolver failed to load captcha: ${error.message}`)

                if (
                    !CaptchaSolver.maxAttempts ||
                    attempt < CaptchaSolver.maxAttempts
                ) {
                    return await this.solveCaptcha(attempt + 1)
                }
            } else {
                Log.warn('Unexpected error: ' + error.message)

                return await this.solveCaptcha(attempt)
            }
        }

        if (await this.isCaptchaSolved()) {
            return true
        }
        //[end]


        //solve again
        if (
            !CaptchaSolver.maxAttempts ||
            attempt < CaptchaSolver.maxAttempts
        ) {
            return await this.solveCaptcha(attempt + 1)
        }

        return false
    }
}