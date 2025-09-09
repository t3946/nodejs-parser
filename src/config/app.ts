import {LogLevelEnum} from '@/Log'

export enum ProxySource {
    residential,
    classic,
}

export const appConfig = {
    logLevel: LogLevelEnum.INFO,
    parse: {
        deep: 1,
        processingMax: 1,
        loadPageTimeoutMS: 60 * 1000,
    },
    proxy: {
        useProxy: true,
        maxProxyResponseTimeMS: 3e3,
        source: ProxySource.classic,
        residentialProxyLink: "https://api.proxytraff.com/package/get?c=K5hk"
    },
    proxyBrowser: {
        headless: false,
    },
    browser: {
        headless: false,
    },
}
