import {
    ItemDetails,
    ItemList,
    SkinData,
    SkinDataTransform,
    SkinItem,
    SkinSprite,
} from 'sonolus-core'
import { PackProcess, Project, UnpackProcess } from './project'
import { load } from './storage'
import {
    getBlob,
    getImageInfo,
    packJson,
    packRaw,
    srl,
    unpackJson,
} from './utils'

export type Skin = {
    title: string
    subtitle: string
    author: string
    description: string
    thumbnail: string
    data: {
        interpolation: boolean
        sprites: {
            id: SkinSprite
            texture: string
            padding: {
                left: boolean
                right: boolean
                top: boolean
                bottom: boolean
            }
            transform: SkinDataTransform
        }[]
    }
}

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

export function newSkinSprite(id: SkinSprite): Skin['data']['sprites'][number] {
    return {
        id,
        texture: '',
        padding: {
            left: true,
            right: true,
            top: true,
            bottom: true,
        },
        transform: {
            x1: { x1: 1 },
            x2: { x2: 1 },
            x3: { x3: 1 },
            x4: { x4: 1 },
            y1: { y1: 1 },
            y2: { y2: 1 },
            y3: { y3: 1 },
            y4: { y4: 1 },
        },
    }
}

export function hasSkinSprite(skin: Skin, id: number) {
    return skin.data.sprites.some((s) => s.id === id)
}

export function formatSkinSpriteId(id: number) {
    const name = SkinSprite[id]
    if (name) return name

    if (id >= 100000 && id < 200000) {
        const engineId = Math.floor(id / 100 - 1000)
        const spriteId = id % 100
        return `${engineId}: ${spriteId}`
    }

    return id.toString()
}

export function addSkinToWhitelist(skin: Skin, whitelist: Set<string>) {
    whitelist.add(skin.thumbnail)
    skin.data.sprites.forEach((s) => whitelist.add(s.texture))
}

export function packSkins(process: PackProcess, project: Project) {
    project.skins.forEach((skin, name) => packSkin(process, name, skin))
}

function packSkin(
    { skins, tasks, addRaw, addJson }: PackProcess,
    name: string,
    skin: Skin
) {
    const item: SkinItem = {
        name,
        version: 2,
        title: skin.title,
        subtitle: skin.subtitle,
        author: skin.author,
        thumbnail: srl('SkinThumbnail'),
        data: srl('SkinData'),
        texture: srl('SkinTexture'),
    }
    skins.push(item)

    tasks.push({
        description: `Packing skin "${name}" thumbnail...`,
        async execute() {
            const { hash, data } = await packRaw(skin.thumbnail)

            const path = `/repository/SkinThumbnail/${hash}`
            item.thumbnail.hash = hash
            item.thumbnail.url = path
            await addRaw(path, data)
        },
    })

    const skinData: SkinData = {
        width: 0,
        height: 0,
        interpolation: skin.data.interpolation,
        sprites: [],
    }

    tasks.push({
        description: `Packing skin "${name}" data...`,
        async execute() {
            const { hash, data } = await packJson(skinData)

            const path = `/repository/SkinData/${hash}`
            item.data.hash = hash
            item.data.url = path
            await addRaw(path, data)
        },
    })

    tasks.push({
        description: `Generating /skins/${name}`,
        async execute() {
            await addJson<ItemDetails<SkinItem>>(`/skins/${name}`, {
                item,
                description: skin.description,
                recommended: [],
            })
        },
    })
}

export function unpackSkins(process: UnpackProcess) {
    const { tasks, getJson } = process

    tasks.push({
        description: 'Loading /skins/list...',
        async execute() {
            const list = await getJson<ItemList<SkinItem>>('/skins/list')
            list.items.forEach(({ name }) => unpackSkin(process, name))
        },
    })
}

function unpackSkin(
    { project, tasks, canvas, getRaw, getJson }: UnpackProcess,
    name: string
) {
    tasks.push({
        description: `Loading /skins/${name}...`,
        async execute() {
            const details = await getJson<ItemDetails<SkinItem>>(
                `/skins/${name}`
            )

            const item = newSkin()
            item.title = details.item.title
            item.subtitle = details.item.subtitle
            item.author = details.item.author
            item.description = details.description

            let img: HTMLImageElement

            tasks.push({
                description: `Unpacking skin "${name}" thumbnail...`,
                async execute() {
                    item.thumbnail = load(
                        await getRaw(details.item.thumbnail.url, 'image/png')
                    )
                },
            })

            tasks.push({
                description: `Unpacking skin "${name}" texture...`,
                async execute() {
                    const url = URL.createObjectURL(
                        await getRaw(details.item.texture.url, 'image/png')
                    )
                    img = (await getImageInfo(url)).img
                    URL.revokeObjectURL(url)
                },
            })

            tasks.push({
                description: `Unpacking skin "${name}" data...`,
                async execute() {
                    const data = await unpackJson<SkinData>(
                        await getRaw(details.item.data.url)
                    )

                    item.data.interpolation = data.interpolation

                    data.sprites.forEach(({ id, x, y, w, h, transform }) => {
                        const sprite = newSkinSprite(id)
                        sprite.transform = transform

                        tasks.push({
                            description: `Unpacking skin "${name}" sprite ${formatSkinSpriteId(
                                id
                            )}...`,
                            async execute() {
                                if (!img)
                                    throw 'Unexpected missing skin texture'

                                const ctx = canvas.getContext('2d')
                                if (!ctx)
                                    throw 'Failed to obtain canvas context'

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
