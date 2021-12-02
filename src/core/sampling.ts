export function sample(
    buffer: Uint8ClampedArray,
    w: number,
    h: number,
    x: number,
    y: number
): [number, number, number, number] {
    const index = (Math.floor(y * h) * w + Math.floor(x * w)) * 4
    return [
        buffer[index + 0],
        buffer[index + 1],
        buffer[index + 2],
        buffer[index + 3],
    ]
}
