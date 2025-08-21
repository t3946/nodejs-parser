import axios from "axios";

export const fetchProxies = async (): Promise<string[]> => {
    const resp = await fetch("https://api.proxytraff.com/package/get?c=K5hk");

    return (await resp.text()).split('\n');
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function linkToBase64(url: string): Promise<string> {
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');

    return base64;
}
