export const fetchProxies = async (): Promise<string[]> => {
    const resp = await fetch("https://api.proxytraff.com/package/get?c=K5hk");

    return (await resp.text()).split('\n');
}