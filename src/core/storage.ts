const urls: string[] = []

export function purge(whitelist: Set<string>) {
    for (let i = urls.length - 1; i >= 0; i--) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = urls[i]!
        if (whitelist.has(url)) continue

        URL.revokeObjectURL(url)
        urls.splice(i, 1)
    }
}

export function load(data: File | Blob) {
    return add(URL.createObjectURL(data))
}

function add(url: string) {
    urls.push(url)
    return url
}
