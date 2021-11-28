const urls: string[] = []

export function purge(whitelist: Set<string>) {
    for (let i = urls.length - 1; i >= 0; i--) {
        if (whitelist.has(urls[i])) continue

        URL.revokeObjectURL(urls[i])
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
