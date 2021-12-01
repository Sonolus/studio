import {
    ItemDetails,
    ItemList,
    SkinData,
    SkinDataTransform,
    SkinItem,
    SkinSprite,
} from 'sonolus-core'
import { UnpackProcess } from './project'
import { load } from './storage'
import { unpackJson } from './utils'

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
    { project, tasks, getRaw, getJson }: UnpackProcess,
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

            tasks.push({
                description: `Unpacking skin "${name}" thumbnail...`,
                async execute() {
                    item.thumbnail = load(
                        await getRaw(details.item.thumbnail.url, 'image/png')
                    )
                },
            })

            tasks.push({
                description: `Unpacking skin "${name}" data...`,
                async execute() {
                    const data = await unpackJson<SkinData>(
                        await getRaw(details.item.data.url)
                    )

                    item.data.interpolation = data.interpolation

                    data.sprites.forEach(({ id, transform }) => {
                        const sprite = newSkinSprite(id)
                        sprite.transform = transform

                        item.data.sprites.push(sprite)
                    })
                },
            })

            project.skins.set(name, item)
        },
    })
}
