import {
    type ParticleData,
    type ParticleDataGroupParticle,
    ParticleEffectName,
    type ParticleItem,
    type ServerItemDetails,
    type ServerItemList,
} from '@sonolus/core'
import { type Ease } from './ease'
import { newId } from './id'
import { formatNameKey } from './names'
import { type PackProcess, type Project, type UnpackProcess } from './project'
import { type PropertyExpression, allZero as allZeroProperty } from './property-expression'
import { bakeSprite, tryCalculateLayout } from './sprite-sheet'
import { load } from './storage'
import { type TransformExpression, allZero as allZeroTransform } from './transform-expression'
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
        color: '#fff',
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

    for (const { texture } of particle.data.sprites) {
        whitelist.add(texture)
    }
}

export function packParticles(process: PackProcess, project: Project) {
    for (const [name, particle] of project.particles) {
        packParticle(process, name, particle)
    }
}

function prune(expression: Record<string, number>) {
    const res: Record<string, number> = {}
    for (const [k, v] of Object.entries(expression)) {
        if (v !== 0) res[k] = v
    }
    return res
}

function pruneNode(
    from: Record<string, number> | undefined,
    to: Record<string, number> | undefined,
) {
    const newFrom: Record<string, number> = {}
    const newTo: Record<string, number> = {}

    const f = from ?? {}
    const t = to ?? {}

    const keys = new Set([...Object.keys(f), ...Object.keys(t)])

    for (const key of keys) {
        const vFrom = f[key] ?? 0
        const vTo = t[key] ?? 0

        if (vFrom !== 0 || vTo !== 0) {
            newFrom[key] = vFrom
            newTo[key] = vTo
        }
    }

    if (Object.keys(newFrom).length === 0) {
        newFrom.c = 0
        newTo.c = 0
    }

    return { from: newFrom, to: newTo }
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
            for (const { name, transform, groups } of particle.data.effects) {
                particleData.effects.push({
                    name,
                    transform: {
                        x1: prune(transform.x1),
                        x2: prune(transform.x2),
                        x3: prune(transform.x3),
                        x4: prune(transform.x4),
                        y1: prune(transform.y1),
                        y2: prune(transform.y2),
                        y3: prune(transform.y3),
                        y4: prune(transform.y4),
                    },
                    groups: groups.map(({ count, particles }) => ({
                        count,
                        particles: particles.map(
                            ({ spriteId, color, start, duration, x, y, w, h, r, a }) => {
                                const p: Partial<ParticleDataGroupParticle> = {
                                    sprite: particle.data.sprites.findIndex(
                                        ({ id }) => id === spriteId,
                                    ),
                                    color,
                                    start,
                                    duration,
                                }

                                const px = pruneNode(x.from, x.to)
                                if (Object.keys(px.from).length > 0) p.x = { ...px, ease: x.ease }

                                const py = pruneNode(y.from, y.to)
                                if (Object.keys(py.from).length > 0) p.y = { ...py, ease: y.ease }

                                const pw = pruneNode(w.from, w.to)
                                if (Object.keys(pw.from).length > 0) p.w = { ...pw, ease: w.ease }

                                const ph = pruneNode(h.from, h.to)
                                if (Object.keys(ph.from).length > 0) p.h = { ...ph, ease: h.ease }

                                const pr = pruneNode(r.from, r.to)
                                if (Object.keys(pr.from).length > 0) p.r = { ...pr, ease: r.ease }

                                const pa = pruneNode(a.from, a.to)
                                if (Object.keys(pa.from).length > 0) p.a = { ...pa, ease: a.ease }

                                return p as ParticleDataGroupParticle
                            },
                        ),
                    })),
                })
            }

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
            if (!ctx) throw new Error('Failed to obtain canvas context')

            ctx.clearRect(0, 0, size, size)

            for (const { name, x, y, w, h } of layouts) {
                const sprite = particle.data.sprites.find(({ id }) => id === name)
                if (!sprite) throw new Error('Unexpected missing sprite')

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
        execute() {
            addJson<ServerItemDetails<ParticleItem>>(`/sonolus/particles/${name}`, {
                item,
                description: particle.description,
                actions: [],
                hasCommunity: false,
                leaderboards: [],
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
            const list =
                await getJsonOptional<ServerItemList<ParticleItem>>('/sonolus/particles/list')
            if (!list) return

            for (const { name } of list.items) {
                unpackParticle(process, name)
            }
        },
    })
}

function unpackParticle({ project, tasks, canvas, getRaw, getJson }: UnpackProcess, name: string) {
    tasks.push({
        description: `Loading particle "${name}" details...`,
        async execute() {
            const details = await getJson<ServerItemDetails<ParticleItem>>(
                `/sonolus/particles/${name}`,
            )

            const item = newParticle()
            item.title = details.item.title
            item.subtitle = details.item.subtitle
            item.author = details.item.author
            item.description = details.description ?? ''

            let img: HTMLImageElement | undefined

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

                    for (const [index, { x, y, w, h }] of data.sprites.entries()) {
                        const spriteId = newId()

                        const sprite = newParticleSprite(spriteId)

                        tasks.push({
                            description: `Unpacking skin "${name}" sprite #${index + 1}...`,
                            async execute() {
                                if (!img) throw new Error('Unexpected missing skin texture')

                                const ctx = canvas.getContext('2d')
                                if (!ctx) throw new Error('Failed to obtain canvas context')

                                canvas.width = w
                                canvas.height = h
                                ctx.drawImage(img, x, y, w, h, 0, 0, w, h)

                                sprite.texture = load(await getBlob(canvas))
                            },
                        })

                        item.data.sprites.push(sprite)
                    }

                    tasks.push({
                        description: `Unpacking particle "${name}" effects...`,
                        execute() {
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
