import axios from "axios";

export const sleep = (timeMS: number) => new Promise(resolve => setTimeout(resolve, timeMS));

export async function linkToBase64(url: string): Promise<string> {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');

    return base64;
}

export function getTimeDifference(date1: Date, date2: Date): { h: number; m: number; s: number; f: string } {
    const diffMs = Math.abs(date2.getTime() - date1.getTime()); // разница в миллисекундах

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60
    const s = diffSeconds % 60

    return {
        h: h,
        m: m,
        s: s,
        f: `${h}ч ${m}м ${s}с`,
    };
}