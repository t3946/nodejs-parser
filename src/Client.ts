import {Browser} from "@/Browser";

export class Client {
    private browser: Browser;

    constructor(browserName: string) {
        this.browser = new Browser();
    }

    useBrowser() {

    }
}