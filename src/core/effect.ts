import { EffectClip } from 'sonolus-core'

export type Effect = {
    version: 2
    title: string
    subtitle: string
    author: string
    description: string
    thumbnail: string
    data: {
        clips: {
            id: EffectClip
            clip: string
        }[]
    }
}

export function newEffect(): Effect {
    return {
        version: 2,
        title: '',
        subtitle: '',
        author: '',
        description: '',
        thumbnail: '',
        data: {
            clips: [],
        },
    }
}

export function addEffectToWhitelist(effect: Effect, whitelist: Set<string>) {
    whitelist.add(effect.thumbnail)
    Object.values(effect.data.clips).forEach(({ clip }) => whitelist.add(clip))
}
