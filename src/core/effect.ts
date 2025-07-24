import {
    EffectClipName,
    type EffectData,
    type EffectItem,
    type ServerItemDetails,
    type ServerItemList,
} from '@sonolus/core'
import JSZip from 'jszip'
import { formatNameKey } from './names'
import { type PackProcess, type Project, type UnpackProcess } from './project'
import { load } from './storage'
import { emptySrl, packArrayBuffer, packJson, packRaw, unpackJson } from './utils'

export type Effect = {
    title: string
    subtitle: string
    author: string
    description: string
    thumbnail: string
    data: {
        clips: {
            name: string
            url: string
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

export function newEffectClip(name: string): Effect['data']['clips'][number] {
    return {
        name,
        url: '',
    }
}

export function hasEffectClip(effect: Effect, name: string) {
    return effect.data.clips.some((c) => c.name === name)
}

export function formatEffectClipName(name: string) {
    const kvp = Object.entries(EffectClipName).find(([, v]) => v === name)
    if (!kvp) return `Custom: ${name}`

    return formatNameKey(kvp[0])
}

export function addEffectToWhitelist(effect: Effect, whitelist: Set<string>) {
    whitelist.add(effect.thumbnail)

    for (const { url } of effect.data.clips) {
        whitelist.add(url)
    }
}

export function packEffects(process: PackProcess, project: Project) {
    for (const [name, effect] of project.effects) {
        packEffect(process, name, effect)
    }
}

function packEffect(
    { effects, tasks, addRaw, addJson }: PackProcess,
    name: string,
    effect: Effect,
) {
    const item: EffectItem = {
        name,
        version: 5,
        title: effect.title,
        subtitle: effect.subtitle,
        author: effect.author,
        tags: [],
        thumbnail: emptySrl(),
        data: emptySrl(),
        audio: emptySrl(),
    }
    effects.push(item)

    const effectAudio = new JSZip()

    tasks.push({
        description: `Packing SFX "${name}" thumbnail...`,
        async execute() {
            const { hash, data } = await packRaw(effect.thumbnail)

            const path = `/sonolus/repository/${hash}`
            item.thumbnail.hash = hash
            item.thumbnail.url = path
            addRaw(path, data)
        },
    })

    const effectData: EffectData = {
        clips: effect.data.clips.map(({ name: clipName, url }, index) => {
            const output = {
                name: clipName,
                filename: `${index}`,
            }

            tasks.push({
                description: `Packing SFX "${name}" clip "${formatEffectClipName(clipName)}"...`,
                async execute() {
                    const { data } = await packRaw(url)

                    effectAudio.file(output.filename, data)
                },
            })

            return output
        }),
    }

    tasks.push({
        description: `Packing SFX "${name}" audio...`,
        async execute() {
            const { hash, data } = await packArrayBuffer(
                await effectAudio.generateAsync({
                    type: 'arraybuffer',
                    compression: 'DEFLATE',
                }),
            )

            const path = `/sonolus/repository/${hash}`
            item.audio.hash = hash
            item.audio.url = path
            addRaw(path, data)
        },
    })

    tasks.push({
        description: `Packing SFX "${name}" data...`,
        async execute() {
            const { hash, data } = await packJson(effectData)

            const path = `/sonolus/repository/${hash}`
            item.data.hash = hash
            item.data.url = path
            addRaw(path, data)
        },
    })

    tasks.push({
        description: `Generating SFX "${name}" details...`,
        execute() {
            addJson<ServerItemDetails<EffectItem>>(`/sonolus/effects/${name}`, {
                item,
                description: effect.description,
                actions: [],
                hasCommunity: false,
                leaderboards: [],
                sections: [],
            })
        },
    })
}

export function unpackEffects(process: UnpackProcess) {
    const { tasks, getJsonOptional } = process

    tasks.push({
        description: 'Loading SFX list...',
        async execute() {
            const list = await getJsonOptional<ServerItemList<EffectItem>>('/sonolus/effects/list')
            if (!list) return

            for (const { name } of list.items) {
                unpackEffect(process, name)
            }
        },
    })
}

function unpackEffect({ project, tasks, getRaw, getJson }: UnpackProcess, name: string) {
    tasks.push({
        description: `Loading SFX "${name}" details...`,
        async execute() {
            const details = await getJson<ServerItemDetails<EffectItem>>(`/sonolus/effects/${name}`)

            const item = newEffect()
            item.title = details.item.title
            item.subtitle = details.item.subtitle
            item.author = details.item.author
            item.description = details.description ?? ''

            let effectAudio: JSZip

            tasks.push({
                description: `Unpacking SFX "${name}" thumbnail...`,
                async execute() {
                    item.thumbnail = load(await getRaw(details.item.thumbnail.url))
                },
            })

            tasks.push({
                description: `Unpacking SFX "${name}" audio...`,
                async execute() {
                    effectAudio = await JSZip.loadAsync(await getRaw(details.item.audio.url))
                },
            })

            tasks.push({
                description: `Unpacking SFX "${name}" data...`,
                async execute() {
                    const data = await unpackJson<EffectData>(await getRaw(details.item.data.url))

                    for (const { name: clipName, filename } of data.clips) {
                        tasks.push({
                            description: `Unpacking SFX "${name}" clip "${formatEffectClipName(
                                clipName,
                            )}"...`,
                            async execute() {
                                const file = effectAudio.file(filename)
                                if (!file) throw new Error(`"${filename}" not found`)

                                item.data.clips.push({
                                    name: clipName,
                                    url: load(await file.async('blob')),
                                })
                            },
                        })
                    }
                },
            })

            project.effects.set(name, item)
        },
    })
}
