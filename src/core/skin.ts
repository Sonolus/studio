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

export function hasSkinSprite(skin: Skin, id: number) {
    return skin.data.sprites.some((s) => s.id === id)
}

export function addSkinToWhitelist(skin: Skin, whitelist: Set<string>) {
    whitelist.add(skin.thumbnail)
    skin.data.sprites.forEach((s) => whitelist.add(s.texture))
}
