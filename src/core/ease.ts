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
    Linear: function (x: number) {
        return x
    },
    InQuad: function (x: number) {
        return x * x
    },
    OutQuad: function (x: number) {
        return 1 - (1 - x) * (1 - x)
    },
    InOutQuad: function (x: number) {
        return x < 0.5 ? EaseFunction.InQuad(x * 2) / 2 : EaseFunction.OutQuad(x * 2 - 1) / 2 + 0.5
    },
    OutInQuad: function (x: number) {
        return x < 0.5 ? EaseFunction.OutQuad(x * 2) / 2 : EaseFunction.InQuad(x * 2 - 1) / 2 + 0.5
    },
    InCubic: function (x: number) {
        return x * x * x
    },
    OutCubic: function (x: number) {
        return 1 - pow(1 - x, 3)
    },
    InOutCubic: function (x: number) {
        return x < 0.5
            ? EaseFunction.InCubic(x * 2) / 2
            : EaseFunction.OutCubic(x * 2 - 1) / 2 + 0.5
    },
    OutInCubic: function (x: number) {
        return x < 0.5 ? EaseFunction.OutQuad(x * 2) / 2 : EaseFunction.InCubic(x * 2 - 1) / 2 + 0.5
    },
    InQuart: function (x: number) {
        return x * x * x * x
    },
    OutQuart: function (x: number) {
        return 1 - pow(1 - x, 4)
    },
    InOutQuart: function (x: number) {
        return x < 0.5
            ? EaseFunction.InQuart(x * 2) / 2
            : EaseFunction.OutQuart(x * 2 - 1) / 2 + 0.5
    },
    OutInQuart: function (x: number) {
        return x < 0.5
            ? EaseFunction.OutQuart(x * 2) / 2
            : EaseFunction.InQuart(x * 2 - 1) / 2 + 0.5
    },
    InQuint: function (x: number) {
        return x * x * x * x * x
    },
    OutQuint: function (x: number) {
        return 1 - pow(1 - x, 5)
    },
    InOutQuint: function (x: number) {
        return x < 0.5
            ? EaseFunction.InQuint(x * 2) / 2
            : EaseFunction.OutQuint(x * 2 - 1) / 2 + 0.5
    },
    OutInQuint: function (x: number) {
        return x < 0.5
            ? EaseFunction.OutQuint(x * 2) / 2
            : EaseFunction.InQuint(x * 2 - 1) / 2 + 0.5
    },
    InSine: function (x: number) {
        return 1 - cos((x * PI) / 2)
    },
    OutSine: function (x: number) {
        return sin((x * PI) / 2)
    },
    InOutSine: function (x: number) {
        return x < 0.5 ? EaseFunction.InSine(x * 2) / 2 : EaseFunction.OutSine(x * 2 - 1) / 2 + 0.5
    },
    OutInSine: function (x: number) {
        return x < 0.5 ? EaseFunction.OutSine(x * 2) / 2 : EaseFunction.InSine(x * 2 - 1) / 2 + 0.5
    },
    InExpo: function (x: number) {
        return x === 0 ? 0 : pow(2, 10 * x - 10)
    },
    OutExpo: function (x: number) {
        return x === 1 ? 1 : 1 - pow(2, -10 * x)
    },
    InOutExpo: function (x: number) {
        return x < 0.5 ? EaseFunction.InExpo(x * 2) / 2 : EaseFunction.OutExpo(x * 2 - 1) / 2 + 0.5
    },
    OutInExpo: function (x: number) {
        return x < 0.5 ? EaseFunction.OutExpo(x * 2) / 2 : EaseFunction.InExpo(x * 2 - 1) / 2 + 0.5
    },
    InCirc: function (x: number) {
        return 1 - sqrt(1 - pow(x, 2))
    },
    OutCirc: function (x: number) {
        return sqrt(1 - pow(x - 1, 2))
    },
    InOutCirc: function (x: number) {
        return x < 0.5 ? EaseFunction.InCirc(x * 2) / 2 : EaseFunction.OutCirc(x * 2 - 1) / 2 + 0.5
    },
    OutInCirc: function (x: number) {
        return x < 0.5 ? EaseFunction.OutCirc(x * 2) / 2 : EaseFunction.InCirc(x * 2 - 1) / 2 + 0.5
    },
    InBack: function (x: number) {
        return c3 * x * x * x - c1 * x * x
    },
    OutBack: function (x: number) {
        return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2)
    },
    InOutBack: function (x: number) {
        return x < 0.5 ? EaseFunction.InBack(x * 2) / 2 : EaseFunction.OutBack(x * 2 - 1) / 2 + 0.5
    },
    OutInBack: function (x: number) {
        return x < 0.5 ? EaseFunction.OutBack(x * 2) / 2 : EaseFunction.InBack(x * 2 - 1) / 2 + 0.5
    },
    InElastic: function (x: number) {
        return x === 0 ? 0 : x === 1 ? 1 : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4)
    },
    OutElastic: function (x: number) {
        return x === 0 ? 0 : x === 1 ? 1 : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1
    },
    InOutElastic: function (x: number) {
        return x < 0.5
            ? EaseFunction.InElastic(x * 2) / 2
            : EaseFunction.OutElastic(x * 2 - 1) / 2 + 0.5
    },
    OutInElastic: function (x: number) {
        return x < 0.5
            ? EaseFunction.OutElastic(x * 2) / 2
            : EaseFunction.InElastic(x * 2 - 1) / 2 + 0.5
    },
    None: function (x: number) {
        return x < 0.5 ? 0 : 1
    },
    undefined: function (x: number) {
        return EaseFunction.Linear(x)
    },
} as const
