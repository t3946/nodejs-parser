import axios from "axios";

export const fetchProxies = async (): Promise<string[]> => {
    const resp = await fetch("https://api.proxytraff.com/package/get?c=K5hk");

    return (await resp.text()).split('\n');
}

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
    const diffHours = Math.floor(diffMinutes / 60);

    return {
        h: diffHours,
        m: diffMinutes % 60,
        s: diffSeconds % 60,
        f: `${diffHours}ч ${diffMinutes}м ${diffSeconds}с`,
    };
}