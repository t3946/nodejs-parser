import {Stack} from '@/stack/Stack'

type Item = {
    proxy: string;
}

export class ProxiesStack extends Stack<Item> {
    constructor(keywords: Item[]) {
        super(keywords)
    }
}
