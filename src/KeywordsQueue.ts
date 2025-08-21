export class KeywordsQueue {
    private queue: string[];

    constructor(keywords: string[]) {
        this.queue = [...keywords];
    }

    take(): string | null {
        return this.queue.shift() || null;
    }

    put(keyword: string): void {
        this.queue.unshift(keyword);
    }
}
