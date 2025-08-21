import chalk from 'chalk';

export class Log {
    private static logWithColor(colorFn: (text: string) => string, prefix: string, ...params: any[]) {
        console.log(colorFn(prefix), ...params);
    }

    public static system(...params: any[]) {
        this.logWithColor(chalk.gray, '[SYST]', ...params);
    }

    public static info(...params: any[]) {
        this.logWithColor(chalk.blue, '[INFO]', ...params);
    }

    public static warn(...params: any[]) {
        this.logWithColor(chalk.yellow, '[WARN]', ...params);
    }

    public static error(...params: any[]) {
        this.logWithColor(chalk.red, '[ERRO]', ...params);
    }

    public static todo(...params: any[]) {
        this.logWithColor(chalk.greenBright, '[TODO]', ...params);
    }
}