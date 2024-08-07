import { createEquationToExpression } from './expression'

export type TransformExpression = Record<
    | 'c'
    | `${'x' | 'y'}${1 | 2 | 3 | 4}`
    | `${'r' | 'sinr' | 'cosr'}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`,
    number
>

export const allZero: TransformExpression = {
    c: 0,
    x1: 0,
    x2: 0,
    x3: 0,
    x4: 0,
    y1: 0,
    y2: 0,
    y3: 0,
    y4: 0,
    r1: 0,
    r2: 0,
    r3: 0,
    r4: 0,
    r5: 0,
    r6: 0,
    r7: 0,
    r8: 0,
    sinr1: 0,
    sinr2: 0,
    sinr3: 0,
    sinr4: 0,
    sinr5: 0,
    sinr6: 0,
    sinr7: 0,
    sinr8: 0,
    cosr1: 0,
    cosr2: 0,
    cosr3: 0,
    cosr4: 0,
    cosr5: 0,
    cosr6: 0,
    cosr7: 0,
    cosr8: 0,
}

export const equationToTransformExpression = createEquationToExpression(allZero)
