import { type Ease } from './ease'
import { execute } from './expression'
import { type Particle } from './particle'
import { type PropertyExpression } from './property-expression'
import { type ImageInfo } from './utils'

export type ParticleState = Exclude<ReturnType<typeof getParticleState>, undefined>

export function getParticleState(
    particle: Particle['data']['effects'][number]['groups'][number]['particles'][number],
    imageInfos: Record<string, ImageInfo>,
    values: PropertyExpression,
) {
    const imageInfo = imageInfos[particle.spriteId]
    if (!imageInfo) return

    const texture = new OffscreenCanvas(imageInfo.width, imageInfo.height)

    const ctx = texture.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = particle.color
    ctx.fillRect(0, 0, imageInfo.width, imageInfo.height)

    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(imageInfo.img, 0, 0)

    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(imageInfo.img, 0, 0)

    return {
        texture,
        start: particle.start,
        end: particle.start + particle.duration,
        x: executeProperty(particle.x, values),
        y: executeProperty(particle.y, values),
        w: executeProperty(particle.w, values),
        h: executeProperty(particle.h, values),
        r: executeProperty(particle.r, values),
        a: executeProperty(particle.a, values),
    }
}

function executeProperty(
    { from, to, ease }: { from: PropertyExpression; to: PropertyExpression; ease: Ease },
    values: PropertyExpression,
) {
    return {
        from: execute(from, values),
        to: execute(to, values),
        ease,
    }
}
