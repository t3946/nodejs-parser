import {LogLevelEnum} from '@/Log'

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
    },
    proxyBrowser: {
        headless: false,
    },
    browser: {
        headless: false,
    },
}
