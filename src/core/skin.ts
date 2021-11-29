import { SkinDataTransform, SkinSprite } from 'sonolus-core'

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

export function addSkinToWhitelist(skin: Skin, whitelist: Set<string>) {
    whitelist.add(skin.thumbnail)
    skin.data.sprites.forEach((s) => whitelist.add(s.texture))
}
