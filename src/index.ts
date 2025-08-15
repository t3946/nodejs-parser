const puppeteer = require('puppeteer');
const useProxy = require('@lem0-packages/puppeteer-page-proxy');

(async () => {
    const resp = await fetch("https://api.proxytraff.com/package/get?c=K5hk");
    const proxies = (await resp.text()).split('\n');
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: false,
    });

    // Ловим событие закрытия окна браузера, чтобы перехватывать
    browser.on('disconnected', () => {
        console.warn('Браузер был закрыт!');
        // Можно реализовать здесь перезапуск браузера, если надо
    });

    for (const proxy of proxies.slice(4, 5)) {
        try {
            const page = await browser.newPage();

            // При аварийном закрытии страницы можно обработать событие
            page.on('close', () => {
                console.warn('Страница закрылась, но мы не закрываем весь браузер');
            });

            await useProxy(page, `http://${proxy}`);

            // Выставим большой таймаут, чтобы страница не закрылась из-за таймаута
            await page.setDefaultNavigationTimeout(0);

            // Оборачиваем навигацию в try/catch с await!
            try {
                page
                    .goto('https://2ip.ru/', { timeout: 0, waitUntil: 'load' })
                    .catch((err) => {
                        console.error('Общая ошибка на итерации с прокси', proxy, err);
                    })
                console.log(`Прокси ${proxy} успешно открыт URL`);
            } catch (navError) {
                console.error(`Ошибка навигации с прокси ${proxy}:`, navError);
                // Навигация не удалась, но окно не закрываем!
            }

            // Не закрываем страницу, чтобы не закрыть браузер случайно

        } catch (err) {
            console.error('Общая ошибка на итерации с прокси', proxy, err);
            // Ошибка есть — логируем, но браузер не закрываем!
        }
    }

    // Можно оставить браузер открытым или корректно закрыть вручную в конце
    // await browser.close();

})();
