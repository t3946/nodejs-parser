import chalk from 'chalk';
type LogParam = string | number | boolean | object | null | undefined;

export class Log {
    private static logWithColor(colorFn: (text: string) => string, prefix: string, ...params: LogParam[]) {
        console.log(colorFn(prefix), ...params);
    }

    public static info(...params: LogParam[]) {
        this.logWithColor(chalk.blue, '[INFO]', ...params);
    }

    public static warn(...params: LogParam[]) {
        this.logWithColor(chalk.yellow, '[WARN]', ...params);
    }

    public static error(...params: LogParam[]) {
        this.logWithColor(chalk.red, '[ERRO]', ...params);
    }

    public static todo(...params: LogParam[]) {
        this.logWithColor(chalk.greenBright, '[TODO]', ...params);
    }
}