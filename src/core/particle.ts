import { ItemDetails, ItemList, ParticleData, ParticleItem, ParticleEffectName, ParticleDataGroupParticleProperty } from 'sonolus-core'
import { formatNameKey } from './names'
import { PackProcess, Project, UnpackProcess } from './project'
import { bakeSprite, tryCalculateLayout } from './sprite-sheet'
import { load } from './storage'
import { getBlob, getImageInfo, packJson, packRaw, srl, unpackJson } from './utils'

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
                        from: string,
                        to: string,
                        ease: string
                    }
                    y: {
                        from: string,
                        to: string,
                        ease: string
                    }
                    w: {
                        from: string,
                        to: string,
                        ease: string
                    }
                    h: {
                        from: string,
                        to: string,
                        ease: string
                    }
                    r: {
                        from: string,
                        to: string,
                        ease: string
                    }
                    a: {
                        from: string,
                        to: string,
                        ease: string
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
            effects: []
        }
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
        groups: []
    }
}
export function newParticleEffectGroup(): Particle['data']['effects'][number]["groups"][number] {
    return {
        count: 0,
        particles: []
    }
}
export function newParticleEffectGroupParticle(): Particle['data']['effects'][number]["groups"][number]["particles"][number] {
    return {
        sprite: '',
        color: '#000000',
        start: 0,
        duration: 1,
        x: { from: '', to: '', ease: 'Linear' },
        y: { from: '', to: '', ease: 'Linear' },
        w: { from: '', to: '', ease: 'Linear' },
        h: { from: '', to: '', ease: 'Linear' },
        r: { from: '', to: '', ease: 'Linear' },
        a: { from: '', to: '', ease: 'Linear' }
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

// export function packSkins(process: PackProcess, project: Project) {
//     project.skins.forEach((skin, name) => packSkin(process, name, skin))
// }

// function packSkin(
//     { skins, tasks, canvas, addRaw, addJson }: PackProcess,
//     name: string,
//     skin: Skin,
// ) {
//     const item: SkinItem = {
//         name,
//         version: 4,
//         title: skin.title,
//         subtitle: skin.subtitle,
//         author: skin.author,
//         thumbnail: srl('SkinThumbnail'),
//         data: srl('SkinData'),
//         texture: srl('SkinTexture'),
//     }
//     skins.push(item)

//     tasks.push({
//         description: `Packing skin "${name}" thumbnail...`,
//         async execute() {
//             const { hash, data } = await packRaw(skin.thumbnail)

//             const path = `/sonolus/repository/SkinThumbnail/${hash}`
//             item.thumbnail.hash = hash
//             item.thumbnail.url = path
//             addRaw(path, data)
//         },
//     })

//     const skinData: SkinData = {
//         width: 0,
//         height: 0,
//         interpolation: skin.data.interpolation,
//         sprites: [],
//     }

//     tasks.push({
//         description: `Packing skin "${name}" texture...`,
//         async execute() {
//             const { size, layouts } = await tryCalculateLayout(skin)

//             skinData.width = size
//             skinData.height = size

//             canvas.width = size
//             canvas.height = size

//             const ctx = canvas.getContext('2d')
//             if (!ctx) throw 'Failed to obtain canvas context'

//             ctx.clearRect(0, 0, size, size)

//             for (const { name, x, y, w, h } of layouts) {
//                 const sprite = skin.data.sprites.find((sprite) => sprite.name === name)
//                 if (!sprite) throw 'Unexpected missing sprite'

//                 skinData.sprites.push({
//                     name,
//                     x: x + (sprite.padding.left ? 1 : 0),
//                     y: y + (sprite.padding.top ? 1 : 0),
//                     w,
//                     h,
//                     transform: sprite.transform,
//                 })

//                 await bakeSprite(sprite, x, y, w, h, ctx)
//             }

//             const texture = URL.createObjectURL(await getBlob(canvas))

//             const { hash, data } = await packRaw(texture)

//             const path = `/sonolus/repository/SkinTexture/${hash}`
//             item.texture.hash = hash
//             item.texture.url = path
//             addRaw(path, data)

//             URL.revokeObjectURL(texture)
//         },
//     })

//     tasks.push({
//         description: `Packing skin "${name}" data...`,
//         async execute() {
//             const { hash, data } = await packJson(skinData)

//             const path = `/sonolus/repository/SkinData/${hash}`
//             item.data.hash = hash
//             item.data.url = path
//             addRaw(path, data)
//         },
//     })

//     tasks.push({
//         description: `Generating skin "${name}" details...`,
//         async execute() {
//             addJson<ItemDetails<SkinItem>>(`/sonolus/skins/${name}`, {
//                 item,
//                 description: skin.description,
//                 recommended: [],
//             })
//         },
//     })
// }

// export function unpackSkins(process: UnpackProcess) {
//     const { tasks, getJsonOptional } = process

//     tasks.push({
//         description: 'Loading skin list...',
//         async execute() {
//             const list = await getJsonOptional<ItemList<SkinItem>>('/sonolus/skins/list')
//             if (!list) return

//             list.items.forEach(({ name }) => unpackSkin(process, name))
//         },
//     })
// }

// function unpackSkin({ project, tasks, canvas, getRaw, getJson }: UnpackProcess, name: string) {
//     tasks.push({
//         description: `Loading skin "${name}" details...`,
//         async execute() {
//             const details = await getJson<ItemDetails<SkinItem>>(`/sonolus/skins/${name}`)

//             const item = newSkin()
//             item.title = details.item.title
//             item.subtitle = details.item.subtitle
//             item.author = details.item.author
//             item.description = details.description

//             let img: HTMLImageElement

//             tasks.push({
//                 description: `Unpacking skin "${name}" thumbnail...`,
//                 async execute() {
//                     item.thumbnail = load(await getRaw(details.item.thumbnail.url))
//                 },
//             })

//             tasks.push({
//                 description: `Unpacking skin "${name}" texture...`,
//                 async execute() {
//                     const url = URL.createObjectURL(await getRaw(details.item.texture.url))
//                     img = (await getImageInfo(url)).img
//                     URL.revokeObjectURL(url)
//                 },
//             })

//             tasks.push({
//                 description: `Unpacking skin "${name}" data...`,
//                 async execute() {
//                     const data = await unpackJson<SkinData>(await getRaw(details.item.data.url))

//                     item.data.interpolation = data.interpolation

//                     data.sprites.forEach(({ name: spriteName, x, y, w, h, transform }) => {
//                         const sprite = newSkinSprite(spriteName)
//                         sprite.transform = {
//                             x1: { ...allZero, ...transform.x1 },
//                             x2: { ...allZero, ...transform.x2 },
//                             x3: { ...allZero, ...transform.x3 },
//                             x4: { ...allZero, ...transform.x4 },
//                             y1: { ...allZero, ...transform.y1 },
//                             y2: { ...allZero, ...transform.y2 },
//                             y3: { ...allZero, ...transform.y3 },
//                             y4: { ...allZero, ...transform.y4 },
//                         }

//                         tasks.push({
//                             description: `Unpacking skin "${name}" sprite ${formatSkinSpriteName(
//                                 spriteName,
//                             )}...`,
//                             async execute() {
//                                 if (!img) throw 'Unexpected missing skin texture'

//                                 const ctx = canvas.getContext('2d')
//                                 if (!ctx) throw 'Failed to obtain canvas context'

//                                 canvas.width = w
//                                 canvas.height = h
//                                 ctx.drawImage(img, x, y, w, h, 0, 0, w, h)

//                                 sprite.texture = load(await getBlob(canvas))
//                             },
//                         })

//                         item.data.sprites.push(sprite)
//                     })
//                 },
//             })

//             project.skins.set(name, item)
//         },
//     })
// }
