export class Stack<Item> {
    private readonly queue: Item[];
    private index: number;

    constructor(items: Item[]) {
        this.queue = [...items];
        this.index = 0;
    }

    public getNext(): Item {
        const item = this.queue[this.index];

        if (!item) {
            throw new Error(`Cannot find item by index: ${this.index}`);
        }

        this.index = (this.index + 1) % this.queue.length;

        return item;
    }

    public take(): Item | null {
        return this.queue.shift() || null;
    }

    public put(item: Item): void {
        this.queue.unshift(item);
    }
}
