import {
    EffectClip,
    EffectData,
    EffectItem,
    ItemDetails,
    ItemList,
} from 'sonolus-core'
import { PackProcess, Project, UnpackProcess } from './project'
import { load } from './storage'
import { packJson, packRaw, srl, unpackJson } from './utils'

export type Effect = {
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

export function newEffectClip(id: EffectClip): Effect['data']['clips'][number] {
    return {
        id,
        clip: '',
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

export function packEffects(process: PackProcess, project: Project) {
    project.effects.forEach((effect, name) => packEffect(process, name, effect))
}

function packEffect(
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

            const path = `/repository/EffectThumbnail/${hash}`
            item.thumbnail.hash = hash
            item.thumbnail.url = path
            addRaw(path, data)
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

                    const path = `/repository/EffectClip/${hash}`
                    output.clip.hash = hash
                    output.clip.url = path
                    addRaw(path, data)
                },
            })

            return output
        }),
    }

    tasks.push({
        description: `Packing effect "${name}" data...`,
        async execute() {
            const { hash, data } = await packJson(effectData)

            const path = `/repository/EffectData/${hash}`
            item.data.hash = hash
            item.data.url = path
            addRaw(path, data)
        },
    })

    tasks.push({
        description: `Generating /effects/${name}`,
        async execute() {
            addJson<ItemDetails<EffectItem>>(`/effects/${name}`, {
                item,
                description: effect.description,
                recommended: [],
            })
        },
    })
}

export function unpackEffects(process: UnpackProcess) {
    const { tasks, getJsonOptional } = process

    tasks.push({
        description: 'Loading /effects/list...',
        async execute() {
            const list = await getJsonOptional<ItemList<EffectItem>>(
                '/effects/list'
            )
            if (!list) return

            list.items.forEach(({ name }) => unpackEffect(process, name))
        },
    })
}

function unpackEffect(
    { project, tasks, getRaw, getJson }: UnpackProcess,
    name: string
) {
    tasks.push({
        description: `Loading /effects/${name}...`,
        async execute() {
            const details = await getJson<ItemDetails<EffectItem>>(
                `/effects/${name}`
            )

            const item = newEffect()
            item.title = details.item.title
            item.subtitle = details.item.subtitle
            item.author = details.item.author
            item.description = details.description

            tasks.push({
                description: `Unpacking effect "${name}" thumbnail...`,
                async execute() {
                    item.thumbnail = load(
                        await getRaw(details.item.thumbnail.url)
                    )
                },
            })

            tasks.push({
                description: `Unpacking effect "${name}" data...`,
                async execute() {
                    const data = await unpackJson<EffectData>(
                        await getRaw(details.item.data.url)
                    )

                    data.clips.forEach(({ id, clip }) => {
                        tasks.push({
                            description: `Unpacking effect "${name}" clip "${formatEffectClipId(
                                id
                            )}"...`,
                            async execute() {
                                item.data.clips.push({
                                    id,
                                    clip: load(await getRaw(clip.url)),
                                })
                            },
                        })
                    })
                },
            })

            project.effects.set(name, item)
        },
    })
}
