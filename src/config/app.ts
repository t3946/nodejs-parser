import {LogLevelEnum} from '@/Log'

export const appConfig = {
    logLevel: LogLevelEnum.DEBUG,
    parse: {
        deep: 1,


    },
    proxy: {
        useProxy: true,
        maxProxyResponseTimeMS: 3e3,
    },
    browser: {
        headless: true,
    },
}
