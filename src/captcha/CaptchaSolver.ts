import {Page} from "puppeteer";
import {Capsola} from "@/captcha/Capsola";
import {linkToBase64, sleep} from "@/utils";

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
        //solve checkbox captcha
        if (await this.isCheckboxCaptcha()) {
            await this.page.waitForSelector('#js-button')
            await this.page.click('#js-button');
            await this.page.waitForSelector('.AdvancedCaptcha-ImageWrapper img')

            if (await this.isCaptchaSolved()) {
                return true
            }
        }


        //[start] solve smart captcha
        const taskImgSelector = '.AdvancedCaptcha-ImageWrapper img'
        const questionImgBase64 = await this.imgSrcToBase64('.AdvancedCaptcha-ImageWrapper img')
        const taskImgBase64 = await this.imgSrcToBase64('.TaskImage')
        const coords = await Capsola.solve(questionImgBase64, taskImgBase64)

        const rect = await this.page.$eval(taskImgSelector, (element) => {
            const rect = element.getBoundingClientRect();

            return {
                top: rect.top,
                left: rect.left,
            };
        });

        for (const {x, y} of coords) {
            const aX = rect.left + 10 + x
            const aY = rect.top + y

            await this.page.mouse.click(aX, aY);
            await sleep(100);
        }

        await Promise.all([
            this.page.waitForNavigation({waitUntil: 'load'}),
            this.page.click('.CaptchaButton-ProgressWrapper')
        ])

        if (await this.isCaptchaSolved()) {
            return true
        }
        //[end]


        //solve again
        if (attempt < CaptchaSolver.maxAttempts) {
            return await this.solveCaptcha(this.page, attempt + 1)
        }

        return false
    }
}