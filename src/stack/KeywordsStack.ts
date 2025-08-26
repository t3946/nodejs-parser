import {Stack} from '@/stack/Stack'

export class KeywordsStack extends Stack<string> {
    constructor(keywords: string[]) {
        super(keywords)
    }
}
