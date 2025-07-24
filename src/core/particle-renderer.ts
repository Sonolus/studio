import { type Ease, easings } from './ease'
import { type ParticleState } from './particle-state'
import { type Rect, lerp, lerpPoint, unlerp } from './utils'

export function renderParticle(
    ctx: CanvasRenderingContext2D,
    state: ParticleState,
    rect: Rect,
    loop: boolean,
    progress: number,
) {
    if (loop && progress < state.start) progress++
    if (progress < state.start || progress > state.end) return

    const p = unlerp(state.start, state.end, progress)

    const x = execute(state.x, p)
    const y = execute(state.y, p)
    const w = execute(state.w, p)
    const h = execute(state.h, p)
    const r = execute(state.r, p)
    const a = execute(state.a, p)

    const cosr = Math.cos(r)
    const sinr = Math.sin(r)

    const p0 = getPoint(rect, x, y, w, h, cosr, sinr, 0)
    const p1 = getPoint(rect, x, y, w, h, cosr, sinr, 1)
    const p2 = getPoint(rect, x, y, w, h, cosr, sinr, 2)
    const p3 = getPoint(rect, x, y, w, h, cosr, sinr, 3)

    ctx.globalAlpha = a

    ctx.save()

    ctx.transform(p3[0] - p0[0], p3[1] - p0[1], p0[0] - p1[0], p0[1] - p1[1], p1[0], p1[1])

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, 1)
    ctx.lineTo(1, 1)
    ctx.lineTo(0, 0)
    ctx.closePath()

    ctx.clip()
    ctx.drawImage(state.texture, 0, 0, 1, 1)

    ctx.restore()

    ctx.save()

    ctx.transform(p2[0] - p1[0], p2[1] - p1[1], p3[0] - p2[0], p3[1] - p2[1], p1[0], p1[1])

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(1, 0)
    ctx.lineTo(1, 1)
    ctx.lineTo(0, 0)
    ctx.closePath()

    ctx.clip()
    ctx.drawImage(state.texture, 0, 0, 1, 1)

    ctx.restore()
}

function execute({ from, to, ease }: { from: number; to: number; ease: Ease }, p: number) {
    return lerp(from, to, easings[ease](p))
}

function getPoint(
    rect: Rect,
    x: number,
    y: number,
    w: number,
    h: number,
    cosr: number,
    sinr: number,
    n: number,
) {
    const sx = (n === 0 || n === 1 ? -1 : 1) * w
    const sy = (n === 0 || n === 3 ? -1 : 1) * h

    const dx = sx * cosr - sy * sinr
    const dy = sy * cosr + sx * sinr

    const px = (x + dx + 1) / 2
    const py = (y + dy + 1) / 2

    const b = lerpPoint(rect[0], rect[3], px)
    const t = lerpPoint(rect[1], rect[2], px)
    return lerpPoint(b, t, py)
}
