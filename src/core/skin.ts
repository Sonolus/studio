import { ItemDetails, ItemList, SkinData, SkinItem, SkinSpriteName } from '@sonolus/core'
import { formatNameKey } from './names'
import { PackProcess, Project, UnpackProcess } from './project'
import { bakeSprite, tryCalculateLayout } from './sprite-sheet'
import { load } from './storage'
import { emptySrl, getBlob, getImageInfo, packJson, packRaw, unpackJson } from './utils'

const allZero = { x1: 0, x2: 0, x3: 0, x4: 0, y1: 0, y2: 0, y3: 0, y4: 0 }

export type Skin = {
    title: string
    subtitle: string
    author: string
    description: string
    thumbnail: string
    data: {
        interpolation: boolean
        sprites: {
            name: string
            texture: string
            padding: {
                left: boolean
                right: boolean
                top: boolean
                bottom: boolean
            }
            transform: Transform
        }[]
    }
}
export type Transform = Record<`${'x' | 'y'}${1 | 2 | 3 | 4}`, Expression>
export type Expression = Record<`${'x' | 'y'}${1 | 2 | 3 | 4}`, number>

export function newSkin(): Skin {
    return {
        title: '',
        subtitle: '',
        author: '',
        description: '',
        thumbnail: '',
        data: {
            interpolation: true,
            sprites: [],
        },
    }
}

export function newSkinSprite(name: string): Skin['data']['sprites'][number] {
    return {
        name,
        texture: '',
        padding: {
            left: true,
            right: true,
            top: true,
            bottom: true,
        },
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
    }
}

export function hasSkinSprite(skin: Skin, name: string) {
    return skin.data.sprites.some((s) => s.name === name)
}

export function formatSkinSpriteName(name: string) {
    const kvp = Object.entries(SkinSpriteName).find(([, v]) => v === name)
    if (!kvp) return `Custom: ${name}`

    return formatNameKey(kvp[0])
}

export function addSkinToWhitelist(skin: Skin, whitelist: Set<string>) {
    whitelist.add(skin.thumbnail)
    skin.data.sprites.forEach((s) => whitelist.add(s.texture))
}

export function packSkins(process: PackProcess, project: Project) {
    project.skins.forEach((skin, name) => packSkin(process, name, skin))
}

function packSkin(
    { skins, tasks, canvas, addRaw, addJson }: PackProcess,
    name: string,
    skin: Skin,
) {
    const item: SkinItem = {
        name,
        version: 4,
        title: skin.title,
        subtitle: skin.subtitle,
        author: skin.author,
        tags: [],
        thumbnail: emptySrl(),
        data: emptySrl(),
        texture: emptySrl(),
    }
    skins.push(item)

    tasks.push({
        description: `Packing skin "${name}" thumbnail...`,
        async execute() {
            const { hash, data } = await packRaw(skin.thumbnail)

            const path = `/sonolus/repository/${hash}`
            item.thumbnail.hash = hash
            item.thumbnail.url = path
            addRaw(path, data)
        },
    })

    const skinData: SkinData = {
        width: 0,
        height: 0,
        interpolation: skin.data.interpolation,
        sprites: [],
    }

    tasks.push({
        description: `Packing skin "${name}" texture...`,
        async execute() {
            const { size, layouts } = await tryCalculateLayout(
                skin.data.sprites.map((s) => ({
                    name: s.name,
                    texture: s.texture,
                    padding: s.padding,
                })),
            )

            skinData.width = size
            skinData.height = size

            canvas.width = size
            canvas.height = size

            const ctx = canvas.getContext('2d')
            if (!ctx) throw 'Failed to obtain canvas context'

            ctx.clearRect(0, 0, size, size)

            for (const { name, x, y, w, h } of layouts) {
                const sprite = skin.data.sprites.find((sprite) => sprite.name === name)
                if (!sprite) throw 'Unexpected missing sprite'

                skinData.sprites.push({
                    name,
                    x: x + (sprite.padding.left ? 1 : 0),
                    y: y + (sprite.padding.top ? 1 : 0),
                    w,
                    h,
                    transform: sprite.transform,
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
        description: `Packing skin "${name}" data...`,
        async execute() {
            const { hash, data } = await packJson(skinData)

            const path = `/sonolus/repository/${hash}`
            item.data.hash = hash
            item.data.url = path
            addRaw(path, data)
        },
    })

    tasks.push({
        description: `Generating skin "${name}" details...`,
        async execute() {
            addJson<ItemDetails<SkinItem>>(`/sonolus/skins/${name}`, {
                item,
                description: skin.description,
                sections: [],
            })
        },
    })
}

export function unpackSkins(process: UnpackProcess) {
    const { tasks, getJsonOptional } = process

    tasks.push({
        description: 'Loading skin list...',
        async execute() {
            const list = await getJsonOptional<ItemList<SkinItem>>('/sonolus/skins/list')
            if (!list) return

            list.items.forEach(({ name }) => unpackSkin(process, name))
        },
    })
}

function unpackSkin({ project, tasks, canvas, getRaw, getJson }: UnpackProcess, name: string) {
    tasks.push({
        description: `Loading skin "${name}" details...`,
        async execute() {
            const details = await getJson<ItemDetails<SkinItem>>(`/sonolus/skins/${name}`)

            const item = newSkin()
            item.title = details.item.title
            item.subtitle = details.item.subtitle
            item.author = details.item.author
            item.description = details.description

            let img: HTMLImageElement

            tasks.push({
                description: `Unpacking skin "${name}" thumbnail...`,
                async execute() {
                    item.thumbnail = load(await getRaw(details.item.thumbnail.url))
                },
            })

            tasks.push({
                description: `Unpacking skin "${name}" texture...`,
                async execute() {
                    const url = URL.createObjectURL(await getRaw(details.item.texture.url))
                    img = (await getImageInfo(url)).img
                    URL.revokeObjectURL(url)
                },
            })

            tasks.push({
                description: `Unpacking skin "${name}" data...`,
                async execute() {
                    const data = await unpackJson<SkinData>(await getRaw(details.item.data.url))

                    item.data.interpolation = data.interpolation

                    data.sprites.forEach(({ name: spriteName, x, y, w, h, transform }) => {
                        const sprite = newSkinSprite(spriteName)
                        sprite.transform = {
                            x1: { ...allZero, ...transform.x1 },
                            x2: { ...allZero, ...transform.x2 },
                            x3: { ...allZero, ...transform.x3 },
                            x4: { ...allZero, ...transform.x4 },
                            y1: { ...allZero, ...transform.y1 },
                            y2: { ...allZero, ...transform.y2 },
                            y3: { ...allZero, ...transform.y3 },
                            y4: { ...allZero, ...transform.y4 },
                        }

                        tasks.push({
                            description: `Unpacking skin "${name}" sprite ${formatSkinSpriteName(
                                spriteName,
                            )}...`,
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
                },
            })

            project.skins.set(name, item)
        },
    })
}
