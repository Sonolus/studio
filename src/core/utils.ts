import { gzip, ungzip } from 'pako'

export type Point = [number, number]
export type Rect = [Point, Point, Point, Point]

export type ImageInfo = {
    img: HTMLImageElement
    width: number
    height: number
}

export function emptySrl() {
    return {
        hash: '',
        url: '',
    }
}

export function clone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data)) as never
}

export function lerp(a: number, b: number, x: number) {
    return a * (1 - x) + b * x
}

export function lerpPoint(a: Point, b: Point, x: number): Point {
    return [lerp(a[0], b[0], x), lerp(a[1], b[1], x)]
}

export function unlerp(a: number, b: number, x: number) {
    return (x - a) / (b - a)
}

export function getImageInfo(src: string) {
    return new Promise<ImageInfo>((resolve, reject) => {
        if (!src) {
            reject(new Error('No source'))
            return
        }

        const img = new Image()
        img.onload = () => {
            resolve({
                img,
                width: img.naturalWidth,
                height: img.naturalHeight,
            })
        }
        img.onerror = reject
        img.src = src
    })
}

export function getAudioInfo(src: string) {
    return new Promise<{ duration: number }>((resolve, reject) => {
        if (!src) {
            reject(new Error('No source'))
            return
        }

        const audio = new Audio(src)
        audio.onloadedmetadata = () => {
            resolve({
                duration: audio.duration,
            })
        }
        audio.onerror = reject
        audio.src = src
    })
}

export function getImageBuffer({ img, width, height }: ImageInfo, canvas: HTMLCanvasElement) {
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to obtain canvas context')

    ctx.drawImage(img, 0, 0, width, height)

    return {
        buffer: ctx.getImageData(0, 0, width, height).data,
        width,
        height,
    }
}

export function getBlob(canvas: HTMLCanvasElement) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob)
            } else {
                reject(new Error('No blob'))
            }
        }, 'image/png')
    })
}

export async function packRaw(url: string) {
    if (!url) throw new Error('Missing file')
    const buffer = await (await fetch(url)).arrayBuffer()

    return {
        hash: await hash(buffer),
        data: new Uint8Array(buffer),
    }
}

export async function packArrayBuffer(buffer: ArrayBuffer) {
    return {
        hash: await hash(buffer),
        data: new Uint8Array(buffer),
    }
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export async function packJson<T>(json: T) {
    const data = gzip(JSON.stringify(json), { level: 9 })

    return {
        hash: await hash(data),
        data,
    }
}

export async function unpackJson<T>(data: Blob): Promise<T> {
    return JSON.parse(ungzip(new Uint8Array(await toArrayBuffer(data)), { to: 'string' })) as never
}

async function hash(data: BufferSource) {
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', data)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

async function toArrayBuffer(blob: Blob) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            resolve(reader.result as ArrayBuffer)
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(blob)
    })
}
