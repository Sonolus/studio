type Point = [number, number]
type Rect = [Point, Point, Point, Point]

export function inverseBilinear(p: Point, [d, a, b, c]: Rect): Point {
    const e = subtract(b, a)
    const f = subtract(d, a)
    const g = add(subtract(a, b), subtract(c, d))
    const h = subtract(p, a)

    const k2 = cross(g, f)
    const k1 = cross(e, f) + cross(h, g)
    const k0 = cross(h, e)

    if (Math.abs(k2) < 0.001)
        return [(h[0] * k1 + f[0] * k0) / (e[0] * k1 - g[0] * k0), -k0 / k1]

    const w2 = k1 * k1 - 4 * k0 * k2
    if (w2 < 0) return [-1, -1]
    const w = Math.sqrt(w2)

    const ik2 = 0.5 / k2
    let v = (-k1 - w) * ik2
    let u = (h[0] - f[0] * v) / (e[0] + g[0] * v)

    if (u < 0 || u > 1 || v < 0 || v > 1) {
        v = (-k1 + w) * ik2
        u = (h[0] - f[0] * v) / (e[0] + g[0] * v)
    }

    return [u, v]
}

function add(a: Point, b: Point): Point {
    return [a[0] + b[0], a[1] + b[1]]
}

function subtract(a: Point, b: Point): Point {
    return [a[0] - b[0], a[1] - b[1]]
}

function cross(a: Point, b: Point) {
    return a[0] * b[1] - a[1] * b[0]
}
