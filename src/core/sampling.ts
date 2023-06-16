type RGBA = [number, number, number, number]

export function sample(
    buffer: Uint8ClampedArray,
    w: number,
    h: number,
    x: number,
    y: number,
    interpolation: boolean,
) {
    return (interpolation ? sampleBilinear : sampleNearest)(buffer, w, h, x, y)
}

function sampleNearest(
    buffer: Uint8ClampedArray,
    w: number,
    h: number,
    x: number,
    y: number,
): RGBA {
    const index = (Math.floor(y * h) * w + Math.floor(x * w)) * 4
    return [buffer[index + 0], buffer[index + 1], buffer[index + 2], buffer[index + 3]]
}

function sampleBilinear(
    buffer: Uint8ClampedArray,
    w: number,
    h: number,
    x: number,
    y: number,
): RGBA {
    x *= w
    y *= h
    x -= 0.5
    y -= 0.5

    const u0 = Math.max(Math.floor(x), 0)
    const u1 = Math.min(Math.ceil(x), w - 1)
    const mu0 = u1 - x
    const mu1 = 1 - mu0

    const v0 = Math.max(Math.floor(y), 0)
    const v1 = Math.min(Math.ceil(y), h - 1)
    const mv0 = v1 - y
    const mv1 = 1 - mv0

    const i00 = (v0 * w + u0) * 4
    const i10 = (v0 * w + u1) * 4
    const i01 = (v1 * w + u0) * 4
    const i11 = (v1 * w + u1) * 4

    return [
        buffer[i00 + 0] * mu0 * mv0 +
            buffer[i10 + 0] * mu1 * mv0 +
            buffer[i01 + 0] * mu0 * mv1 +
            buffer[i11 + 0] * mu1 * mv1,

        buffer[i00 + 1] * mu0 * mv0 +
            buffer[i10 + 1] * mu1 * mv0 +
            buffer[i01 + 1] * mu0 * mv1 +
            buffer[i11 + 1] * mu1 * mv1,

        buffer[i00 + 2] * mu0 * mv0 +
            buffer[i10 + 2] * mu1 * mv0 +
            buffer[i01 + 2] * mu0 * mv1 +
            buffer[i11 + 2] * mu1 * mv1,

        buffer[i00 + 3] * mu0 * mv0 +
            buffer[i10 + 3] * mu1 * mv0 +
            buffer[i01 + 3] * mu0 * mv1 +
            buffer[i11 + 3] * mu1 * mv1,
    ]
}
