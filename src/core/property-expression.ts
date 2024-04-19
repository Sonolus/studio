import { ParticleDataGroupParticlePropertyExpression } from '@sonolus/core'
import { createEquationToExpression } from './expression'

export type PropertyExpression = Required<ParticleDataGroupParticlePropertyExpression>

export const allZero: PropertyExpression = {
    c: 0,
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

export const equationToPropertyExpression = createEquationToExpression(allZero)

export function getPropertyExpressionRandom() {
    return Object.fromEntries(
        [...Array(8).keys()].flatMap((i) => {
            const value = Math.random()
            return [
                [`r${i + 1}`, value],
                [`sinr${i + 1}`, Math.sin(2 * Math.PI * value)],
                [`cosr${i + 1}`, Math.cos(2 * Math.PI * value)],
            ]
        }),
    ) as Record<`${'r' | 'sinr' | 'cosr'}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`, number>
}
