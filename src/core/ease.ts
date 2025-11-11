import { type ParticleDataGroupParticleProperty } from '@sonolus/core'

export type Ease = Required<ParticleDataGroupParticleProperty>['ease']

export const easings: Record<Ease, (x: number) => number> = {
    linear: (x) => x,
    inSine: (x) => 1 - Math.cos((x * Math.PI) / 2),
    outSine: (x) => Math.sin((x * Math.PI) / 2),
    inOutSine: (x) => -(Math.cos(x * Math.PI) - 1) / 2,
    outInSine: (x) =>
        x < 0.5 ? Math.sin(x * Math.PI) / 2 : 1 - 0.5 * Math.cos((x - 0.5) * Math.PI),
    inQuad: (x) => x * x,
    outQuad: (x) => 1 - (1 - x) * (1 - x),
    inOutQuad: (x) => (x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) * (-2 * x + 2)) / 2),
    outInQuad: (x) =>
        x < 0.5 ? 0.5 - 0.5 * (1 - 2 * x) * (1 - 2 * x) : 0.5 + 0.5 * (2 * x - 1) * (2 * x - 1),
    inCubic: (x) => x * x * x,
    outCubic: (x) => 1 - (1 - x) * (1 - x) * (1 - x),
    inOutCubic: (x) =>
        x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) * (-2 * x + 2) * (-2 * x + 2)) / 2,
    outInCubic: (x) =>
        x < 0.5
            ? 0.5 - 0.5 * (1 - 2 * x) * (1 - 2 * x) * (1 - 2 * x)
            : 0.5 + 0.5 * (2 * x - 1) * (2 * x - 1) * (2 * x - 1),
    inQuart: (x) => x * x * x * x,
    outQuart: (x) => 1 - (1 - x) * (1 - x) * (1 - x) * (1 - x),
    inOutQuart: (x) =>
        x < 0.5
            ? 8 * x * x * x * x
            : 1 - ((-2 * x + 2) * (-2 * x + 2) * (-2 * x + 2) * (-2 * x + 2)) / 2,
    outInQuart: (x) =>
        x < 0.5
            ? 0.5 - 0.5 * (1 - 2 * x) * (1 - 2 * x) * (1 - 2 * x) * (1 - 2 * x)
            : 0.5 + 0.5 * (2 * x - 1) * (2 * x - 1) * (2 * x - 1) * (2 * x - 1),
    inQuint: (x) => x * x * x * x * x,
    outQuint: (x) => 1 - (1 - x) * (1 - x) * (1 - x) * (1 - x) * (1 - x),
    inOutQuint: (x) =>
        x < 0.5
            ? 16 * x * x * x * x * x
            : 1 - ((-2 * x + 2) * (-2 * x + 2) * (-2 * x + 2) * (-2 * x + 2) * (-2 * x + 2)) / 2,
    outInQuint: (x) =>
        x < 0.5
            ? 0.5 - 0.5 * (1 - 2 * x) * (1 - 2 * x) * (1 - 2 * x) * (1 - 2 * x) * (1 - 2 * x)
            : 0.5 + 0.5 * (2 * x - 1) * (2 * x - 1) * (2 * x - 1) * (2 * x - 1) * (2 * x - 1),
    inExpo: (x) => (x == 0 ? 0 : Math.pow(2, 10 * x - 10)),
    outExpo: (x) => (x == 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    inOutExpo: (x) =>
        x == 0
            ? 0
            : x == 1
              ? 1
              : x < 0.5
                ? 0.5 * Math.pow(2, 20 * x - 10)
                : 1 - 0.5 * Math.pow(2, -20 * x + 10),
    outInExpo: (x) =>
        x == 0
            ? 0
            : x == 1
              ? 1
              : x < 0.5
                ? 0.5 - 0.5 * Math.pow(2, -20 * x)
                : 0.5 + 0.5 * Math.pow(2, 20 * x - 20),
    inCirc: (x) => 1 - Math.sqrt(1 - x * x),
    outCirc: (x) => Math.sqrt(1 - (x - 1) * (x - 1)),
    inOutCirc: (x) =>
        x < 0.5
            ? 0.5 - 0.5 * Math.sqrt(1 - 4 * x * x)
            : 0.5 + 0.5 * Math.sqrt(1 - (-2 * x + 2) * (-2 * x + 2)),
    outInCirc: (x) =>
        x < 0.5
            ? 0.5 * Math.sqrt(1 - (2 * x - 1) * (2 * x - 1))
            : 1 - 0.5 * Math.sqrt(1 - (2 * x - 1) * (2 * x - 1)),
    inBack: (x) => 2.70158 * x * x * x - 1.70158 * x * x,
    outBack: (x) => 1 + 2.70158 * (x - 1) * (x - 1) * (x - 1) + 1.70158 * (x - 1) * (x - 1),
    inOutBack: (x) =>
        x < 0.5
            ? 4 * 2.70158 * x * x * x - 2 * 1.70158 * x * x
            : 1 +
              0.5 * 2.70158 * (2 * x - 2) * (2 * x - 2) * (2 * x - 2) +
              0.5 * 1.70158 * (2 * x - 2) * (2 * x - 2),
    outInBack: (x) =>
        x < 0.5
            ? 0.5 +
              0.5 * 2.70158 * (2 * x - 1) * (2 * x - 1) * (2 * x - 1) +
              0.5 * 1.70158 * (2 * x - 1) * (2 * x - 1)
            : 0.5 +
              0.5 * 2.70158 * (2 * x - 1) * (2 * x - 1) * (2 * x - 1) -
              0.5 * 1.70158 * (2 * x - 1) * (2 * x - 1),
    inElastic: (x) =>
        x == 0
            ? 0
            : x == 1
              ? 1
              : -Math.pow(2, 10 * x - 10) * Math.sin(((x * 10 - 10.75) * 2 * Math.PI) / 3),
    outElastic: (x) =>
        x == 0
            ? 0
            : x == 1
              ? 1
              : Math.pow(2, -10 * x) * Math.sin(((x * 10 - 0.75) * 2 * Math.PI) / 3) + 1,
    inOutElastic: (x) =>
        x == 0
            ? 0
            : x == 1
              ? 1
              : x < 0.5
                ? (-Math.pow(2, 20 * x - 10) * Math.sin(((20 * x - 10.75) * 2 * Math.PI) / 3)) / 2
                : 1 +
                  (Math.pow(2, -20 * x + 10) * Math.sin(((20 * x - 10.75) * 2 * Math.PI) / 3)) / 2,
    outInElastic: (x) =>
        x == 0
            ? 0
            : x == 1
              ? 1
              : x < 0.5
                ? 0.5 * Math.pow(2, -20 * x) * Math.sin(((x * 20 - 0.75) * 2 * Math.PI) / 3) + 0.5
                : 0.5 -
                  0.5 *
                      Math.pow(2, 10 * (2 * x - 1) - 10) *
                      Math.sin((((2 * x - 1) * 10 - 10.75) * 2 * Math.PI) / 3),
    none: (x) => (x == 1 ? 1 : 0),
}
