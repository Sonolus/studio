import { ParticleDataGroupParticleProperty } from '@sonolus/core'

export type Ease = Required<ParticleDataGroupParticleProperty>['ease']

const c1 = 1.70158
const c3 = c1 + 1
const c4 = (2 * Math.PI) / 3

export const easings: Record<Ease, (x: number) => number> = {
    linear: (x) => x,
    inQuad: (x) => x * x,
    outQuad: (x) => 1 - (1 - x) * (1 - x),
    inOutQuad: (x) => (x < 0.5 ? easings.inQuad(x * 2) / 2 : easings.outQuad(x * 2 - 1) / 2 + 0.5),
    outInQuad: (x) => (x < 0.5 ? easings.outQuad(x * 2) / 2 : easings.inQuad(x * 2 - 1) / 2 + 0.5),
    inCubic: (x) => x * x * x,
    outCubic: (x) => 1 - Math.pow(1 - x, 3),
    inOutCubic: (x) =>
        x < 0.5 ? easings.inCubic(x * 2) / 2 : easings.outCubic(x * 2 - 1) / 2 + 0.5,
    outInCubic: (x) =>
        x < 0.5 ? easings.outCubic(x * 2) / 2 : easings.inCubic(x * 2 - 1) / 2 + 0.5,
    inQuart: (x) => x * x * x * x,
    outQuart: (x) => 1 - Math.pow(1 - x, 4),
    inOutQuart: (x) =>
        x < 0.5 ? easings.inQuart(x * 2) / 2 : easings.outQuart(x * 2 - 1) / 2 + 0.5,
    outInQuart: (x) =>
        x < 0.5 ? easings.outQuart(x * 2) / 2 : easings.inQuart(x * 2 - 1) / 2 + 0.5,
    inQuint: (x) => x * x * x * x * x,
    outQuint: (x) => 1 - Math.pow(1 - x, 5),
    inOutQuint: (x) =>
        x < 0.5 ? easings.inQuint(x * 2) / 2 : easings.outQuint(x * 2 - 1) / 2 + 0.5,
    outInQuint: (x) =>
        x < 0.5 ? easings.outQuint(x * 2) / 2 : easings.inQuint(x * 2 - 1) / 2 + 0.5,
    inSine: (x) => 1 - Math.cos((x * Math.PI) / 2),
    outSine: (x) => Math.sin((x * Math.PI) / 2),
    inOutSine: (x) => (x < 0.5 ? easings.inSine(x * 2) / 2 : easings.outSine(x * 2 - 1) / 2 + 0.5),
    outInSine: (x) => (x < 0.5 ? easings.outSine(x * 2) / 2 : easings.inSine(x * 2 - 1) / 2 + 0.5),
    inExpo: (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10)),
    outExpo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    inOutExpo: (x) => (x < 0.5 ? easings.inExpo(x * 2) / 2 : easings.outExpo(x * 2 - 1) / 2 + 0.5),
    outInExpo: (x) => (x < 0.5 ? easings.outExpo(x * 2) / 2 : easings.inExpo(x * 2 - 1) / 2 + 0.5),
    inCirc: (x) => 1 - Math.sqrt(1 - Math.pow(x, 2)),
    outCirc: (x) => Math.sqrt(1 - Math.pow(x - 1, 2)),
    inOutCirc: (x) => (x < 0.5 ? easings.inCirc(x * 2) / 2 : easings.outCirc(x * 2 - 1) / 2 + 0.5),
    outInCirc: (x) => (x < 0.5 ? easings.outCirc(x * 2) / 2 : easings.inCirc(x * 2 - 1) / 2 + 0.5),
    inBack: (x) => c3 * x * x * x - c1 * x * x,
    outBack: (x) => 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2),
    inOutBack: (x) => (x < 0.5 ? easings.inBack(x * 2) / 2 : easings.outBack(x * 2 - 1) / 2 + 0.5),
    outInBack: (x) => (x < 0.5 ? easings.outBack(x * 2) / 2 : easings.inBack(x * 2 - 1) / 2 + 0.5),
    inElastic: (x) =>
        x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4),
    outElastic: (x) =>
        x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1,
    inOutElastic: (x) =>
        x < 0.5 ? easings.inElastic(x * 2) / 2 : easings.outElastic(x * 2 - 1) / 2 + 0.5,
    outInElastic: (x) =>
        x < 0.5 ? easings.outElastic(x * 2) / 2 : easings.inElastic(x * 2 - 1) / 2 + 0.5,
    none: (x) => (x < 0.5 ? 0 : 1),
}
