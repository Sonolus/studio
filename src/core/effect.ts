export type Effect = {
    version: 2
    title: string
    subtitle: string
    author: string
    description: string
    thumbnail: string
}

export function newEffect(): Effect {
    return {
        version: 2,
        title: '',
        subtitle: '',
        author: '',
        description: '',
        thumbnail: '',
    }
}

export function addEffectToWhitelist(effect: Effect, whitelist: Set<string>) {
    whitelist.add(effect.thumbnail)
}
