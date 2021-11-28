import { gzip, ungzip } from 'pako'
import { ResourceType } from 'sonolus-core'

export function srl<T extends ResourceType>(type: T) {
    return {
        type,
        hash: '',
        url: '',
    }
}

export function clone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data))
}

export function getImageInfo(src: string) {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
        if (!src) {
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
        img.src = src
    })
}

export function getAudioInfo(src: string) {
    return new Promise<{ duration: number }>((resolve, reject) => {
        if (!src) {
            reject()
            return
        }

        const audio = new Audio(src)
        audio.onloadedmetadata = () =>
            resolve({
                duration: audio.duration,
            })
        audio.onerror = reject
        audio.src = src
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

export async function unpackJson<T>(data: Blob): Promise<T> {
    return JSON.parse(
        ungzip(new Uint8Array(await toArrayBuffer(data)), { to: 'string' })
    )
}

async function hash(data: BufferSource) {
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', data)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

async function toArrayBuffer(blob: Blob) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = reject
        reader.readAsArrayBuffer(blob)
    })
}
