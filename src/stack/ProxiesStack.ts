import {Stack} from '@/stack/Stack'

type Item = {
    proxy: string;
    isUsing: boolean;
}

export class ProxiesStack extends Stack<Item> {
    constructor(keywords: Item[]) {
        super(keywords)
    }

    public setUsing(proxy: string, using: boolean): void {
        this.queue.forEach((item) => {
            if (item.proxy === proxy) {
                item.isUsing = using
            }
        })
    }

    public getNextFree(): Item {
        let item

        const hasFreeProxy = this.queue.filter((item) => {
            return !item.isUsing
        }).length > 0

        if (!hasFreeProxy) {
            throw new Error('Proxy stack has no free proxy')
        }

        do {
            item = this.getNext()
        } while (item.isUsing)

        return item;
    }

    public remove(proxy: string): void {
        for (let i = 0; i < this.queue.length; i++) {
            const item = this.queue[i]

            if (item.proxy === proxy) {
                this.removeByIndex(i)
                return
            }
        }
    }
}
