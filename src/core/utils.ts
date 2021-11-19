import { gzip } from 'pako'
import { ResourceType } from 'sonolus-core'

export function srl<T extends ResourceType>(type: T) {
    return {
        type,
        hash: '',
        url: '',
    }
}

export function getImageInfo(image: string) {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
        if (!image) {
            reject()
            return
        }

        const img = new Image()
        img.onload = () =>
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
            })
        img.onerror = reject
        img.src = image
    })
}

export async function packRaw(url: string) {
    if (!url) throw 'Missing file'
    const buffer = await (await fetch(url)).arrayBuffer()

    return {
        hash: await hash(buffer),
        data: new Uint8Array(buffer),
    }
}

export async function packJson<T>(json: T) {
    const data = gzip(JSON.stringify(json), { level: 9 })

    return {
        hash: await hash(data),
        data,
    }
}

async function hash(data: BufferSource) {
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', data)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}
