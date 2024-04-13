const pow = Math.pow
const sqrt = Math.sqrt
const sin = Math.sin
const cos = Math.cos
const PI = Math.PI
const c1 = 1.70158
// const c2 = c1 * 1.525
const c3 = c1 + 1
const c4 = (2 * PI) / 3
// const c5 = (2 * PI) / 4.5

export const EaseFunction = {
    linear: function (x: number) {
        return x
    },
    inQuad: function (x: number) {
        return x * x
    },
    outQuad: function (x: number) {
        return 1 - (1 - x) * (1 - x)
    },
    inOutQuad: function (x: number) {
        return x < 0.5 ? EaseFunction.inQuad(x * 2) / 2 : EaseFunction.outQuad(x * 2 - 1) / 2 + 0.5
    },
    outInQuad: function (x: number) {
        return x < 0.5 ? EaseFunction.outQuad(x * 2) / 2 : EaseFunction.inQuad(x * 2 - 1) / 2 + 0.5
    },
    inCubic: function (x: number) {
        return x * x * x
    },
    outCubic: function (x: number) {
        return 1 - pow(1 - x, 3)
    },
    inOutCubic: function (x: number) {
        return x < 0.5
            ? EaseFunction.inCubic(x * 2) / 2
            : EaseFunction.outCubic(x * 2 - 1) / 2 + 0.5
    },
    outInCubic: function (x: number) {
        return x < 0.5
            ? EaseFunction.outCubic(x * 2) / 2
            : EaseFunction.inCubic(x * 2 - 1) / 2 + 0.5
    },
    inQuart: function (x: number) {
        return x * x * x * x
    },
    outQuart: function (x: number) {
        return 1 - pow(1 - x, 4)
    },
    inOutQuart: function (x: number) {
        return x < 0.5
            ? EaseFunction.inQuart(x * 2) / 2
            : EaseFunction.outQuart(x * 2 - 1) / 2 + 0.5
    },
    outInQuart: function (x: number) {
        return x < 0.5
            ? EaseFunction.outQuart(x * 2) / 2
            : EaseFunction.inQuart(x * 2 - 1) / 2 + 0.5
    },
    inQuint: function (x: number) {
        return x * x * x * x * x
    },
    outQuint: function (x: number) {
        return 1 - pow(1 - x, 5)
    },
    inOutQuint: function (x: number) {
        return x < 0.5
            ? EaseFunction.inQuint(x * 2) / 2
            : EaseFunction.outQuint(x * 2 - 1) / 2 + 0.5
    },
    outInQuint: function (x: number) {
        return x < 0.5
            ? EaseFunction.outQuint(x * 2) / 2
            : EaseFunction.inQuint(x * 2 - 1) / 2 + 0.5
    },
    inSine: function (x: number) {
        return 1 - cos((x * PI) / 2)
    },
    outSine: function (x: number) {
        return sin((x * PI) / 2)
    },
    inOutSine: function (x: number) {
        return x < 0.5 ? EaseFunction.inSine(x * 2) / 2 : EaseFunction.outSine(x * 2 - 1) / 2 + 0.5
    },
    outInSine: function (x: number) {
        return x < 0.5 ? EaseFunction.outSine(x * 2) / 2 : EaseFunction.inSine(x * 2 - 1) / 2 + 0.5
    },
    inExpo: function (x: number) {
        return x === 0 ? 0 : pow(2, 10 * x - 10)
    },
    outExpo: function (x: number) {
        return x === 1 ? 1 : 1 - pow(2, -10 * x)
    },
    inOutExpo: function (x: number) {
        return x < 0.5 ? EaseFunction.inExpo(x * 2) / 2 : EaseFunction.outExpo(x * 2 - 1) / 2 + 0.5
    },
    outInExpo: function (x: number) {
        return x < 0.5 ? EaseFunction.outExpo(x * 2) / 2 : EaseFunction.inExpo(x * 2 - 1) / 2 + 0.5
    },
    inCirc: function (x: number) {
        return 1 - sqrt(1 - pow(x, 2))
    },
    outCirc: function (x: number) {
        return sqrt(1 - pow(x - 1, 2))
    },
    inOutCirc: function (x: number) {
        return x < 0.5 ? EaseFunction.inCirc(x * 2) / 2 : EaseFunction.outCirc(x * 2 - 1) / 2 + 0.5
    },
    outInCirc: function (x: number) {
        return x < 0.5 ? EaseFunction.outCirc(x * 2) / 2 : EaseFunction.inCirc(x * 2 - 1) / 2 + 0.5
    },
    inBack: function (x: number) {
        return c3 * x * x * x - c1 * x * x
    },
    outBack: function (x: number) {
        return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2)
    },
    inOutBack: function (x: number) {
        return x < 0.5 ? EaseFunction.inBack(x * 2) / 2 : EaseFunction.outBack(x * 2 - 1) / 2 + 0.5
    },
    outInBack: function (x: number) {
        return x < 0.5 ? EaseFunction.outBack(x * 2) / 2 : EaseFunction.inBack(x * 2 - 1) / 2 + 0.5
    },
    inElastic: function (x: number) {
        return x === 0 ? 0 : x === 1 ? 1 : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4)
    },
    outElastic: function (x: number) {
        return x === 0 ? 0 : x === 1 ? 1 : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1
    },
    inOutElastic: function (x: number) {
        return x < 0.5
            ? EaseFunction.inElastic(x * 2) / 2
            : EaseFunction.outElastic(x * 2 - 1) / 2 + 0.5
    },
    outInElastic: function (x: number) {
        return x < 0.5
            ? EaseFunction.outElastic(x * 2) / 2
            : EaseFunction.inElastic(x * 2 - 1) / 2 + 0.5
    },
    none: function (x: number) {
        return x < 0.5 ? 0 : 1
    },
    undefined: function (x: number) {
        return EaseFunction.linear(x)
    },
} as const
