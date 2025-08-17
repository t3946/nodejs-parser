import {Browser} from "./Browser";

export class App {
    public static async main() {
        const browser = new Browser({
            headless: false,
        });

        await browser.launch();

        browser.openPage('https://www.google.com/');
    }
}