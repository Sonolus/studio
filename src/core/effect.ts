import { EffectClip, EffectData, EffectItem, ItemDetails } from 'sonolus-core'
import { PackProcess } from './project'
import { packJson, packRaw, srl } from './utils'

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

export function hasEffectClip(effect: Effect, id: number) {
    return effect.data.clips.some((c) => c.id === id)
}

export function formatEffectClipId(id: number) {
    const name = EffectClip[id]
    if (name) return name

    if (id >= 100000 && id < 200000) {
        const engineId = Math.floor(id / 100 - 1000)
        const clipId = id % 100
        return `${engineId}: ${clipId}`
    }

    return id.toString()
}

export function addEffectToWhitelist(effect: Effect, whitelist: Set<string>) {
    whitelist.add(effect.thumbnail)
    Object.values(effect.data.clips).forEach(({ clip }) => whitelist.add(clip))
}

export function packEffect(
    { effects, tasks, addRaw, addJson }: PackProcess,
    name: string,
    effect: Effect
) {
    const item: EffectItem = {
        name,
        version: 2,
        title: effect.title,
        subtitle: effect.subtitle,
        author: effect.author,
        thumbnail: srl('EffectThumbnail'),
        data: srl('EffectData'),
    }
    effects.push(item)

    tasks.push({
        description: `Packing effect "${name}" thumbnail...`,
        async execute() {
            const { hash, data } = await packRaw(effect.thumbnail)

            const path = `repository/EffectThumbnail/${hash}`
            item.thumbnail.hash = hash
            item.thumbnail.url = `/${path}`
            await addRaw(path, data)
        },
    })

    const effectData: EffectData = {
        clips: effect.data.clips.map(({ id, clip }) => {
            const output = {
                id,
                clip: srl('EffectClip'),
            }

            tasks.push({
                description: `Packing effect "${name}" clip "${formatEffectClipId(
                    id
                )}"...`,
                async execute() {
                    const { hash, data } = await packRaw(clip)

                    const path = `repository/EffectClip/${hash}`
                    output.clip.hash = hash
                    output.clip.url = `/${path}`
                    await addRaw(path, data)
                },
            })

            return output
        }),
    }

    tasks.push({
        description: `Packing effect "${name}" data...`,
        async execute() {
            const { hash, data } = await packJson(effectData)

            const path = `repository/EffectData/${hash}`
            item.data.hash = hash
            item.data.url = `/${path}`
            await addRaw(path, data)
        },
    })

    tasks.push({
        description: `Generating /effects/${name}`,
        async execute() {
            await addJson<ItemDetails<EffectItem>>(`effects/${name}`, {
                item,
                description: effect.description,
                recommended: [],
            })
        },
    })
}
