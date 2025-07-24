import { type Expression, type Transform } from './skin'

type Point = {
    x: Expression
    y: Expression
}

export function getSimpleTransform(
    left: number,
    right: number,
    top: number,
    bottom: number,
): Transform {
    const p = [
        {
            x: { x1: 1, x2: 0, x3: 0, x4: 0, y1: 0, y2: 0, y3: 0, y4: 0 },
            y: { x1: 0, x2: 0, x3: 0, x4: 0, y1: 1, y2: 0, y3: 0, y4: 0 },
        },
        {
            x: { x1: 0, x2: 1, x3: 0, x4: 0, y1: 0, y2: 0, y3: 0, y4: 0 },
            y: { x1: 0, x2: 0, x3: 0, x4: 0, y1: 0, y2: 1, y3: 0, y4: 0 },
        },
        {
            x: { x1: 0, x2: 0, x3: 1, x4: 0, y1: 0, y2: 0, y3: 0, y4: 0 },
            y: { x1: 0, x2: 0, x3: 0, x4: 0, y1: 0, y2: 0, y3: 1, y4: 0 },
        },
        {
            x: { x1: 0, x2: 0, x3: 0, x4: 1, y1: 0, y2: 0, y3: 0, y4: 0 },
            y: { x1: 0, x2: 0, x3: 0, x4: 0, y1: 0, y2: 0, y3: 0, y4: 1 },
        },
    ] as const

    const t = scale(p[1], p[2], left, right)
    const b = scale(p[0], p[3], left, right)
    const l = scale(b[0], t[0], bottom, top)
    const r = scale(b[1], t[1], bottom, top)

    return {
        x1: l[0].x,
        x2: l[1].x,
        x3: r[1].x,
        x4: r[0].x,
        y1: l[0].y,
        y2: l[1].y,
        y3: r[1].y,
        y4: r[0].y,
    }
}

const keys = ['x1', 'x2', 'x3', 'x4', 'y1', 'y2', 'y3', 'y4'] as const

function scale(a: Point, b: Point, m: number, n: number) {
    const l = 1 - m - n
    return [
        add(b, multiply(subtract(a, b), (m + l) / l)),
        add(a, multiply(subtract(b, a), (n + l) / l)),
    ] as const
}

function add(a: Point, b: Point): Point {
    return {
        x: addExp(a.x, b.x),
        y: addExp(a.y, b.y),
    }
}

function subtract(a: Point, b: Point): Point {
    return {
        x: subtractExp(a.x, b.x),
        y: subtractExp(a.y, b.y),
    }
}

function multiply(a: Point, b: number): Point {
    return {
        x: multiplyExp(a.x, b),
        y: multiplyExp(a.y, b),
    }
}

function addExp(a: Expression, b: Expression) {
    return Object.fromEntries(keys.map((key) => [key, a[key] + b[key]])) as Expression
}

function subtractExp(a: Expression, b: Expression) {
    return Object.fromEntries(keys.map((key) => [key, a[key] - b[key]])) as Expression
}

function multiplyExp(a: Expression, b: number) {
    return Object.fromEntries(keys.map((key) => [key, a[key] * b])) as Expression
}
