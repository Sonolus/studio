import {
    ItemDetails,
    ItemList,
    ParticleData,
    ParticleEffectName,
    ParticleItem,
} from '@sonolus/core'
import { Ease } from './ease'
import { newId } from './id'
import { formatNameKey } from './names'
import { PackProcess, Project, UnpackProcess } from './project'
import { PropertyExpression, allZero as allZeroProperty } from './property-expression'
import { bakeSprite, tryCalculateLayout } from './sprite-sheet'
import { load } from './storage'
import { TransformExpression, allZero as allZeroTransform } from './transform-expression'
import { emptySrl, getBlob, getImageInfo, packJson, packRaw, unpackJson } from './utils'

export type Particle = {
    title: string
    subtitle: string
    author: string
    description: string
    thumbnail: string
    data: {
        interpolation: boolean
        sprites: {
            id: string
            texture: string
            padding: {
                left: boolean
                right: boolean
                top: boolean
                bottom: boolean
            }
        }[]
        effects: {
            name: string
            transform: Transform
            groups: {
                count: number
                particles: {
                    spriteId: string
                    color: string
                    start: number
                    duration: number
                    x: { from: PropertyExpression; to: PropertyExpression; ease: Ease }
                    y: { from: PropertyExpression; to: PropertyExpression; ease: Ease }
                    w: { from: PropertyExpression; to: PropertyExpression; ease: Ease }
                    h: { from: PropertyExpression; to: PropertyExpression; ease: Ease }
                    r: { from: PropertyExpression; to: PropertyExpression; ease: Ease }
                    a: { from: PropertyExpression; to: PropertyExpression; ease: Ease }
                }[]
            }[]
        }[]
    }
}
export type Transform = Record<`${'x' | 'y'}${1 | 2 | 3 | 4}`, TransformExpression>

export function newParticle(): Particle {
    return {
        title: '',
        subtitle: '',
        author: '',
        description: '',
        thumbnail: '',
        data: {
            interpolation: true,
            sprites: [],
            effects: [],
        },
    }
}

export function newParticleSprite(id: string): Particle['data']['sprites'][number] {
    return {
        id,
        texture: '',
        padding: {
            left: true,
            right: true,
            top: true,
            bottom: true,
        },
    }
}

export function newParticleEffect(name: string): Particle['data']['effects'][number] {
    return {
        name,
        transform: {
            x1: { ...allZeroTransform, x1: 1 },
            x2: { ...allZeroTransform, x2: 1 },
            x3: { ...allZeroTransform, x3: 1 },
            x4: { ...allZeroTransform, x4: 1 },
            y1: { ...allZeroTransform, y1: 1 },
            y2: { ...allZeroTransform, y2: 1 },
            y3: { ...allZeroTransform, y3: 1 },
            y4: { ...allZeroTransform, y4: 1 },
        },
        groups: [],
    }
}
export function newParticleEffectGroup(): Particle['data']['effects'][number]['groups'][number] {
    return {
        count: 1,
        particles: [],
    }
}
export function newParticleEffectGroupParticle(): Particle['data']['effects'][number]['groups'][number]['particles'][number] {
    return {
        spriteId: '',
        color: '#000000',
        start: 0,
        duration: 1,
        x: { from: { ...allZeroProperty }, to: { ...allZeroProperty }, ease: 'linear' },
        y: { from: { ...allZeroProperty }, to: { ...allZeroProperty }, ease: 'linear' },
        w: { from: { ...allZeroProperty }, to: { ...allZeroProperty }, ease: 'linear' },
        h: { from: { ...allZeroProperty }, to: { ...allZeroProperty }, ease: 'linear' },
        r: { from: { ...allZeroProperty }, to: { ...allZeroProperty }, ease: 'linear' },
        a: { from: { ...allZeroProperty }, to: { ...allZeroProperty }, ease: 'linear' },
    }
}

export function hasParticleSprite(particle: Particle, id: string) {
    return particle.data.sprites.some((s) => s.id === id)
}

export function hasParticleEffect(particle: Particle, name: string) {
    return particle.data.effects.some((e) => e.name === name)
}

export function hasParticleEffectGroup(particle: Particle, name: string, index: number) {
    return particle.data.effects.some((e) => e.name === name && e.groups[index])
}

export function hasParticleEffectGroupParticle(
    particle: Particle,
    name: string,
    groupIndex: number,
    particleIndex: number,
) {
    return particle.data.effects.some(
        (e) => e.name === name && e.groups[groupIndex]?.particles[particleIndex],
    )
}

export function formatParticleEffectName(name: string) {
    const kvp = Object.entries(ParticleEffectName).find(([, v]) => v === name)
    if (!kvp) return `Custom: ${name}`

    return formatNameKey(kvp[0])
}

export function addParticleToWhitelist(particle: Particle, whitelist: Set<string>) {
    whitelist.add(particle.thumbnail)
    particle.data.sprites.forEach((s) => whitelist.add(s.texture))
}

export function packParticles(process: PackProcess, project: Project) {
    project.particles.forEach((particle, name) => packParticle(process, name, particle))
}

function packParticle(
    { particles, tasks, canvas, addRaw, addJson }: PackProcess,
    name: string,
    particle: Particle,
) {
    const item: ParticleItem = {
        name,
        version: 3,
        title: particle.title,
        subtitle: particle.subtitle,
        author: particle.author,
        tags: [],
        thumbnail: emptySrl(),
        data: emptySrl(),
        texture: emptySrl(),
    }
    particles.push(item)

    tasks.push({
        description: `Packing particle "${name}" thumbnail...`,
        async execute() {
            const { hash, data } = await packRaw(particle.thumbnail)

            const path = `/sonolus/repository/${hash}`
            item.thumbnail.hash = hash
            item.thumbnail.url = path
            addRaw(path, data)
        },
    })

    const particleData: ParticleData = {
        width: 0,
        height: 0,
        interpolation: particle.data.interpolation,
        sprites: [],
        effects: [],
    }

    tasks.push({
        description: `Packing particle "${name}" texture...`,
        async execute() {
            particle.data.effects.forEach(({ name, transform, groups }) => {
                particleData.effects.push({
                    name,
                    transform,
                    groups: groups.map(({ count, particles }) => ({
                        count,
                        particles: particles.map(
                            ({ spriteId, color, start, duration, x, y, w, h, r, a }) => ({
                                sprite: particle.data.sprites.findIndex(
                                    ({ id }) => id === spriteId,
                                ),
                                color,
                                start,
                                duration,
                                x: { from: x.from, to: x.to, ease: x.ease },
                                y: { from: y.from, to: y.to, ease: y.ease },
                                w: { from: w.from, to: w.to, ease: w.ease },
                                h: { from: h.from, to: h.to, ease: h.ease },
                                r: { from: r.from, to: r.to, ease: r.ease },
                                a: { from: a.from, to: a.to, ease: a.ease },
                            }),
                        ),
                    })),
                })
            })

            const { size, layouts } = await tryCalculateLayout(
                particle.data.sprites.map(({ id, padding, texture }) => ({
                    name: id,
                    padding,
                    texture,
                })),
            )

            particleData.width = size
            particleData.height = size

            canvas.width = size
            canvas.height = size

            const ctx = canvas.getContext('2d')
            if (!ctx) throw 'Failed to obtain canvas context'

            ctx.clearRect(0, 0, size, size)

            for (const { name, x, y, w, h } of layouts) {
                const sprite = particle.data.sprites.find(({ id }) => id === name)
                if (!sprite) throw 'Unexpected missing sprite'

                particleData.sprites[particle.data.sprites.indexOf(sprite)] = {
                    x: x + (sprite.padding.left ? 1 : 0),
                    y: y + (sprite.padding.top ? 1 : 0),
                    w,
                    h,
                }

                await bakeSprite(sprite, x, y, w, h, ctx)
            }

            const texture = URL.createObjectURL(await getBlob(canvas))

            const { hash, data } = await packRaw(texture)

            const path = `/sonolus/repository/${hash}`
            item.texture.hash = hash
            item.texture.url = path
            addRaw(path, data)

            URL.revokeObjectURL(texture)
        },
    })

    tasks.push({
        description: `Packing particle "${name}" data...`,
        async execute() {
            const { hash, data } = await packJson(particleData)

            const path = `/sonolus/repository/${hash}`
            item.data.hash = hash
            item.data.url = path
            addRaw(path, data)
        },
    })

    tasks.push({
        description: `Generating particle "${name}" details...`,
        async execute() {
            addJson<ItemDetails<ParticleItem>>(`/sonolus/particles/${name}`, {
                item,
                description: particle.description,
                sections: [],
            })
        },
    })
}

export function unpackParticles(process: UnpackProcess) {
    const { tasks, getJsonOptional } = process

    tasks.push({
        description: 'Loading particle list...',
        async execute() {
            const list = await getJsonOptional<ItemList<ParticleItem>>('/sonolus/particles/list')
            if (!list) return

            list.items.forEach(({ name }) => unpackParticle(process, name))
        },
    })
}

function unpackParticle({ project, tasks, canvas, getRaw, getJson }: UnpackProcess, name: string) {
    tasks.push({
        description: `Loading particle "${name}" details...`,
        async execute() {
            const details = await getJson<ItemDetails<ParticleItem>>(`/sonolus/particles/${name}`)

            const item = newParticle()
            item.title = details.item.title
            item.subtitle = details.item.subtitle
            item.author = details.item.author
            item.description = details.description

            let img: HTMLImageElement

            tasks.push({
                description: `Unpacking particle "${name}" thumbnail...`,
                async execute() {
                    item.thumbnail = load(await getRaw(details.item.thumbnail.url))
                },
            })

            tasks.push({
                description: `Unpacking particle "${name}" texture...`,
                async execute() {
                    const url = URL.createObjectURL(await getRaw(details.item.texture.url))
                    img = (await getImageInfo(url)).img
                    URL.revokeObjectURL(url)
                },
            })

            tasks.push({
                description: `Unpacking particle "${name}" data...`,
                async execute() {
                    const data = await unpackJson<ParticleData>(await getRaw(details.item.data.url))

                    item.data.interpolation = data.interpolation

                    data.sprites.forEach(({ x, y, w, h }, index) => {
                        const spriteId = newId()

                        const sprite = newParticleSprite(spriteId)

                        tasks.push({
                            description: `Unpacking skin "${name}" sprite #${index + 1}...`,
                            async execute() {
                                if (!img) throw 'Unexpected missing skin texture'

                                const ctx = canvas.getContext('2d')
                                if (!ctx) throw 'Failed to obtain canvas context'

                                canvas.width = w
                                canvas.height = h
                                ctx.drawImage(img, x, y, w, h, 0, 0, w, h)

                                sprite.texture = load(await getBlob(canvas))
                            },
                        })

                        item.data.sprites.push(sprite)
                    })

                    tasks.push({
                        description: `Unpacking particle "${name}" effects...`,
                        async execute() {
                            item.data.effects = data.effects.map((effect) => ({
                                name: effect.name,
                                transform: {
                                    x1: { ...allZeroTransform, ...effect.transform.x1 },
                                    x2: { ...allZeroTransform, ...effect.transform.x2 },
                                    x3: { ...allZeroTransform, ...effect.transform.x3 },
                                    x4: { ...allZeroTransform, ...effect.transform.x4 },
                                    y1: { ...allZeroTransform, ...effect.transform.y1 },
                                    y2: { ...allZeroTransform, ...effect.transform.y2 },
                                    y3: { ...allZeroTransform, ...effect.transform.y3 },
                                    y4: { ...allZeroTransform, ...effect.transform.y4 },
                                },
                                groups: effect.groups.map((group) => ({
                                    count: group.count,
                                    particles: group.particles.map((particle) => ({
                                        spriteId: item.data.sprites[particle.sprite]?.id ?? '',
                                        color: particle.color,
                                        start: particle.start,
                                        duration: particle.duration,
                                        x: {
                                            from: { ...allZeroProperty, ...particle.x.from },
                                            to: { ...allZeroProperty, ...particle.x.to },
                                            ease: particle.x.ease ?? 'linear',
                                        },
                                        y: {
                                            from: { ...allZeroProperty, ...particle.y.from },
                                            to: { ...allZeroProperty, ...particle.y.to },
                                            ease: particle.y.ease ?? 'linear',
                                        },
                                        w: {
                                            from: { ...allZeroProperty, ...particle.w.from },
                                            to: { ...allZeroProperty, ...particle.w.to },
                                            ease: particle.w.ease ?? 'linear',
                                        },
                                        h: {
                                            from: { ...allZeroProperty, ...particle.h.from },
                                            to: { ...allZeroProperty, ...particle.h.to },
                                            ease: particle.h.ease ?? 'linear',
                                        },
                                        r: {
                                            from: { ...allZeroProperty, ...particle.r.from },
                                            to: { ...allZeroProperty, ...particle.r.to },
                                            ease: particle.r.ease ?? 'linear',
                                        },
                                        a: {
                                            from: { ...allZeroProperty, ...particle.a.from },
                                            to: { ...allZeroProperty, ...particle.a.to },
                                            ease: particle.a.ease ?? 'linear',
                                        },
                                    })),
                                })),
                            }))
                        },
                    })
                },
            })

            project.particles.set(name, item)
        },
    })
}
