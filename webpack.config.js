const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src/index.ts'), // входной файл
    output: {
        path: path.resolve(__dirname, 'dist'), // каталог для сборки
        filename: 'index.js', // имя выходного файла
        library: {
            name: 'ParserNodeJS', // имя библиотеки
            type: 'module', // формат ES-модуль
        },
        clean: true, // очищать папку dist перед сборкой (аналог emptyOutDir)
    },
    experiments: {
        outputModule: true, // разрешает output type: 'module'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader', // транспиляция TypeScript
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src'), // alias @ -> src
        },
    },
    optimization: {
        minimize: false, // отключаем минификацию
    },
    watchOptions: {
        poll: 1000, // polling аналог watch.usePolling: true
    },
};
