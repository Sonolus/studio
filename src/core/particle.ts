import {
    ItemDetails,
    ItemList,
    ParticleData,
    ParticleDataGroupParticlePropertyExpression,
    ParticleEffectName,
    ParticleItem,
} from '@sonolus/core'
import { Ease } from './ease'
import { formatNameKey } from './names'
import { PackProcess, Project, UnpackProcess } from './project'
import { SpriteLayout, bakeSprite, tryCalculateLayout } from './sprite-sheet'
import { load } from './storage'
import { emptySrl, getBlob, getImageInfo, packJson, packRaw, unpackJson } from './utils'

const allZero = { x1: 0, x2: 0, x3: 0, x4: 0, y1: 0, y2: 0, y3: 0, y4: 0 }

export type Particle = {
    title: string
    subtitle: string
    author: string
    description: string
    thumbnail: string
    data: {
        interpolation: boolean
        effects: {
            name: string
            transform: Transform
            padding: {
                left: boolean
                right: boolean
                top: boolean
                bottom: boolean
            }
            groups: {
                count: number
                particles: {
                    sprite: string
                    color: string
                    start: number
                    duration: number
                    x: {
                        from: string
                        to: string
                        ease: Ease
                    }
                    y: {
                        from: string
                        to: string
                        ease: Ease
                    }
                    w: {
                        from: string
                        to: string
                        ease: Ease
                    }
                    h: {
                        from: string
                        to: string
                        ease: Ease
                    }
                    r: {
                        from: string
                        to: string
                        ease: Ease
                    }
                    a: {
                        from: string
                        to: string
                        ease: Ease
                    }
                }[]
            }[]
        }[]
    }
}
export type Transform = Record<`${'x' | 'y'}${1 | 2 | 3 | 4}`, Expression>
export type Expression = Record<`${'x' | 'y'}${1 | 2 | 3 | 4}`, number>

export function newParticle(): Particle {
    return {
        title: '',
        subtitle: '',
        author: '',
        description: '',
        thumbnail: '',
        data: {
            interpolation: true,
            effects: [],
        },
    }
}

export function newParticleEffect(name: string): Particle['data']['effects'][number] {
    return {
        name: name,
        transform: {
            x1: { ...allZero, x1: 1 },
            x2: { ...allZero, x2: 1 },
            x3: { ...allZero, x3: 1 },
            x4: { ...allZero, x4: 1 },
            y1: { ...allZero, y1: 1 },
            y2: { ...allZero, y2: 1 },
            y3: { ...allZero, y3: 1 },
            y4: { ...allZero, y4: 1 },
        },
        padding: {
            left: true,
            right: true,
            top: true,
            bottom: true,
        },
        groups: [],
    }
}
export function newParticleEffectGroup(): Particle['data']['effects'][number]['groups'][number] {
    return {
        count: 0,
        particles: [],
    }
}
export function newParticleEffectGroupParticle(): Particle['data']['effects'][number]['groups'][number]['particles'][number] {
    return {
        sprite: '',
        color: '#000000',
        start: 0,
        duration: 1,
        x: { from: '', to: '', ease: 'linear' },
        y: { from: '', to: '', ease: 'linear' },
        w: { from: '', to: '', ease: 'linear' },
        h: { from: '', to: '', ease: 'linear' },
        r: { from: '', to: '', ease: 'linear' },
        a: { from: '', to: '', ease: 'linear' },
    }
}

export function hasParticleEffect(particle: Particle, name: string) {
    return particle.data.effects.some((e) => e.name === name)
}

export function formatParticleEffectName(name: string) {
    const kvp = Object.entries(ParticleEffectName).find(([, v]) => v === name)
    if (!kvp) return `Custom: ${name}`

    return formatNameKey(kvp[0])
}

export function addParticleToWhitelist(particle: Particle, whitelist: Set<string>) {
    whitelist.add(particle.thumbnail)
    particle.data.effects.forEach((s) => {
        s.groups.forEach((g) => {
            g.particles.forEach((p) => {
                whitelist.add(p.sprite)
            })
        })
    })
}

export function packParticles(process: PackProcess, project: Project) {
    project.particles.forEach((particle, name) => packParticle(process, name, particle))
}

export const varNames = [
    'c',
    'r1',
    'sinr1',
    'cosr1',
    'r2',
    'sinr2',
    'cosr2',
    'r3',
    'sinr3',
    'cosr3',
    'r4',
    'sinr4',
    'cosr4',
    'r5',
    'sinr5',
    'cosr5',
    'r6',
    'sinr6',
    'cosr6',
    'r7',
    'sinr7',
    'cosr7',
    'r8',
    'sinr8',
    'cosr8',
] as const

export const ease: Record<string, Ease> = {
    Linear: 'linear',
    InQuad: 'inQuad',
    OutQuad: 'outQuad',
    InOutQuad: 'inOutQuad',
    OutInQuad: 'outInQuad',
    InCubic: 'inCubic',
    OutCubic: 'outCubic',
    InOutCubic: 'inOutCubic',
    OutInCubic: 'outInCubic',
    InQuart: 'inQuart',
    OutQuart: 'outQuart',
    InOutQuart: 'inOutQuart',
    OutInQuart: 'outInQuart',
    InQuint: 'inQuint',
    OutQuint: 'outQuint',
    InOutQuint: 'inOutQuint',
    OutInQuint: 'outInQuint',
    InSine: 'inSine',
    OutSine: 'outSine',
    InOutSine: 'inOutSine',
    OutInSine: 'outInSine',
    InExpo: 'inExpo',
    OutExpo: 'outExpo',
    InOutExpo: 'inOutExpo',
    OutInExpo: 'outInExpo',
    InCirc: 'inCirc',
    OutCirc: 'outCirc',
    InOutCirc: 'inOutCirc',
    OutInCirc: 'outInCirc',
    InBack: 'inBack',
    OutBack: 'outBack',
    InOutBack: 'inOutBack',
    OutInBack: 'outInBack',
    InElastic: 'inElastic',
    OutElastic: 'outElastic',
    InOutElastic: 'inOutElastic',
    OutInElastic: 'outInElastic',
    None: 'none',
}

export function stringToParticleExpression(value: string) {
    const separator = /\+|-/
    const arr = value.split(separator)
    const res: ParticleDataGroupParticlePropertyExpression = {}
    const sign = []
    for (let i = 0; i < value.length; i++)
        if (value[i] == '-' || value[i] == '+') sign.push(value[i])
    for (let i = 0; i < arr.length; i++) {
        const arr2 = arr[i].split('*')
        let nan = 0
        let name = 'c'
        let val = 1
        for (let j = 0; j < arr2.length; j++) {
            if (isNaN(Number(arr2[j]))) {
                if (varNames.includes(arr2[j] as (typeof varNames)[number]) == false) return {}
                nan++
                if (nan > 1) return {}
                name = arr2[j]
            } else val *= Number(arr2[j])
        }
        if (val == 0) continue
        type Name = keyof ParticleDataGroupParticlePropertyExpression
        if (isNaN(Number(res[name as Name]))) res[name as Name] = 0
        res[name as Name] = Number(res[name as Name]) + val * (i && sign[i - 1] == '-' ? -1 : 1)
    }
    return res
}

function particleExpressionToString(
    value: ParticleDataGroupParticlePropertyExpression | undefined,
) {
    let res = ''
    for (let i = 0; i < varNames.length; i++) {
        const val =
            value == undefined
                ? 0
                : Number(value[varNames[i] as keyof ParticleDataGroupParticlePropertyExpression])
        if (val == 0 || Number.isNaN(val)) continue
        if (res != '') res += val > 0 ? '+' : '-'
        res += val.toString() + '*' + varNames[i]
    }
    return res
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
            const spritesArr: SpriteLayout[] = []
            particle.data.effects.forEach((effect) => {
                particleData.effects.push({
                    name: effect.name,
                    transform: {
                        x1: effect.transform.x1,
                        x2: effect.transform.x2,
                        x3: effect.transform.x3,
                        x4: effect.transform.x4,
                        y1: effect.transform.y1,
                        y2: effect.transform.y2,
                        y3: effect.transform.y3,
                        y4: effect.transform.y4,
                    },
                    groups: [],
                })
                effect.groups.forEach((group) => {
                    particleData.effects[particleData.effects.length - 1].groups.push({
                        count: group.count,
                        particles: [],
                    })
                    group.particles.forEach((particle) => {
                        particleData.effects[particleData.effects.length - 1].groups[
                            particleData.effects[particleData.effects.length - 1].groups.length - 1
                        ].particles.push({
                            sprite: spritesArr.length,
                            color: particle.color,
                            start: particle.start,
                            duration: particle.duration,
                            x: {
                                from: stringToParticleExpression(particle.x.from),
                                to: stringToParticleExpression(particle.x.to),
                                ease: particle.x.ease,
                            },
                            y: {
                                from: stringToParticleExpression(particle.y.from),
                                to: stringToParticleExpression(particle.y.to),
                                ease: particle.y.ease,
                            },
                            w: {
                                from: stringToParticleExpression(particle.w.from),
                                to: stringToParticleExpression(particle.w.to),
                                ease: particle.w.ease,
                            },
                            h: {
                                from: stringToParticleExpression(particle.h.from),
                                to: stringToParticleExpression(particle.h.to),
                                ease: particle.h.ease,
                            },
                            r: {
                                from: stringToParticleExpression(particle.r.from),
                                to: stringToParticleExpression(particle.r.to),
                                ease: particle.r.ease,
                            },
                            a: {
                                from: stringToParticleExpression(particle.a.from),
                                to: stringToParticleExpression(particle.a.to),
                                ease: particle.a.ease,
                            },
                        })
                        spritesArr.push({
                            name: spritesArr.length.toString(),
                            texture: particle.sprite,
                            padding: effect.padding,
                        })
                    })
                })
            })
            const { size, layouts } = await tryCalculateLayout(spritesArr)

            particleData.width = size
            particleData.height = size

            canvas.width = size
            canvas.height = size

            const ctx = canvas.getContext('2d')
            if (!ctx) throw 'Failed to obtain canvas context'

            ctx.clearRect(0, 0, size, size)

            for (const { name, x, y, w, h } of layouts) {
                const sprite = spritesArr[Number(name)]
                if (!sprite) throw 'Unexpected missing sprite'

                particleData.sprites.push({
                    x: x + (sprite.padding.left ? 1 : 0),
                    y: y + (sprite.padding.top ? 1 : 0),
                    w,
                    h,
                })

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
        description: `Loading skin "${name}" details...`,
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

                    let pt = 0
                    const sprites: SpriteLayout[] = []
                    data.sprites.forEach(({ x, y, w, h }) => {
                        const sprite: SpriteLayout = {
                            name: (pt++).toString(),
                            texture: '',
                            padding: {
                                left: true,
                                right: true,
                                top: true,
                                bottom: true,
                            },
                        }

                        tasks.push({
                            description: `Unpacking particle "${name}" sprite #${pt}...`,
                            async execute() {
                                if (!img) throw 'Unexpected missing particle texture'

                                const ctx = canvas.getContext('2d')
                                if (!ctx) throw 'Failed to obtain canvas context'

                                canvas.width = w
                                canvas.height = h
                                ctx.drawImage(img, x, y, w, h, 0, 0, w, h)

                                sprite.texture = load(await getBlob(canvas))
                            },
                        })

                        sprites.push(sprite)
                    })

                    tasks.push({
                        description: `Mapping particle "${name}" data...`,
                        async execute() {
                            item.data.effects = data.effects.map((effect) => {
                                return {
                                    name: effect.name,
                                    transform: {
                                        x1: { ...allZero, ...effect.transform.x1 },
                                        x2: { ...allZero, ...effect.transform.x2 },
                                        x3: { ...allZero, ...effect.transform.x3 },
                                        x4: { ...allZero, ...effect.transform.x4 },
                                        y1: { ...allZero, ...effect.transform.y1 },
                                        y2: { ...allZero, ...effect.transform.y2 },
                                        y3: { ...allZero, ...effect.transform.y3 },
                                        y4: { ...allZero, ...effect.transform.y4 },
                                    },
                                    padding: {
                                        left: true,
                                        right: true,
                                        top: true,
                                        bottom: true,
                                    },
                                    groups: effect.groups.map((group) => {
                                        return {
                                            count: group.count,
                                            particles: group.particles.map((particle) => {
                                                return {
                                                    sprite: sprites[particle.sprite].texture,
                                                    color: particle.color,
                                                    start: particle.start,
                                                    duration: particle.duration,
                                                    x: {
                                                        from: particleExpressionToString(
                                                            particle.x.from,
                                                        ),
                                                        to: particleExpressionToString(
                                                            particle.x.to,
                                                        ),
                                                        ease: particle.x.ease ?? 'linear',
                                                    },
                                                    y: {
                                                        from: particleExpressionToString(
                                                            particle.y.from,
                                                        ),
                                                        to: particleExpressionToString(
                                                            particle.y.to,
                                                        ),
                                                        ease: particle.y.ease ?? 'linear',
                                                    },
                                                    w: {
                                                        from: particleExpressionToString(
                                                            particle.w.from,
                                                        ),
                                                        to: particleExpressionToString(
                                                            particle.w.to,
                                                        ),
                                                        ease: particle.w.ease ?? 'linear',
                                                    },
                                                    h: {
                                                        from: particleExpressionToString(
                                                            particle.h.from,
                                                        ),
                                                        to: particleExpressionToString(
                                                            particle.h.to,
                                                        ),
                                                        ease: particle.h.ease ?? 'linear',
                                                    },
                                                    r: {
                                                        from: particleExpressionToString(
                                                            particle.r.from,
                                                        ),
                                                        to: particleExpressionToString(
                                                            particle.r.to,
                                                        ),
                                                        ease: particle.r.ease ?? 'linear',
                                                    },
                                                    a: {
                                                        from: particleExpressionToString(
                                                            particle.a.from,
                                                        ),
                                                        to: particleExpressionToString(
                                                            particle.a.to,
                                                        ),
                                                        ease: particle.a.ease ?? 'linear',
                                                    },
                                                }
                                            }),
                                        }
                                    }),
                                }
                            })
                        },
                    })
                },
            })

            project.particles.set(name, item)
        },
    })
}
