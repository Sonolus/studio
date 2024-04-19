import { EffectClipName, EffectData, EffectItem, ItemDetails, ItemList } from '@sonolus/core'
import JSZip from 'jszip'
import { formatNameKey } from './names'
import { PackProcess, Project, UnpackProcess } from './project'
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
    Object.values(effect.data.clips).forEach(({ url }) => whitelist.add(url))
}

export function packEffects(process: PackProcess, project: Project) {
    project.effects.forEach((effect, name) => packEffect(process, name, effect))
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
        description: `Packing effect "${name}" thumbnail...`,
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
                description: `Packing effect "${name}" clip "${formatEffectClipName(clipName)}"...`,
                async execute() {
                    const { data } = await packRaw(url)

                    effectAudio.file(output.filename, data)
                },
            })

            return output
        }),
    }

    tasks.push({
        description: `Packing effect "${name}" audio...`,
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
        description: `Packing effect "${name}" data...`,
        async execute() {
            const { hash, data } = await packJson(effectData)

            const path = `/sonolus/repository/${hash}`
            item.data.hash = hash
            item.data.url = path
            addRaw(path, data)
        },
    })

    tasks.push({
        description: `Generating effect "${name}" details...`,
        async execute() {
            addJson<ItemDetails<EffectItem>>(`/sonolus/effects/${name}`, {
                item,
                description: effect.description,
                sections: [],
            })
        },
    })
}

export function unpackEffects(process: UnpackProcess) {
    const { tasks, getJsonOptional } = process

    tasks.push({
        description: 'Loading effect list...',
        async execute() {
            const list = await getJsonOptional<ItemList<EffectItem>>('/sonolus/effects/list')
            if (!list) return

            list.items.forEach(({ name }) => unpackEffect(process, name))
        },
    })
}

function unpackEffect({ project, tasks, getRaw, getJson }: UnpackProcess, name: string) {
    tasks.push({
        description: `Loading effect "${name}" details...`,
        async execute() {
            const details = await getJson<ItemDetails<EffectItem>>(`/sonolus/effects/${name}`)

            const item = newEffect()
            item.title = details.item.title
            item.subtitle = details.item.subtitle
            item.author = details.item.author
            item.description = details.description

            let effectAudio: JSZip

            tasks.push({
                description: `Unpacking effect "${name}" thumbnail...`,
                async execute() {
                    item.thumbnail = load(await getRaw(details.item.thumbnail.url))
                },
            })

            tasks.push({
                description: `Unpacking effect "${name}" audio...`,
                async execute() {
                    effectAudio = await JSZip.loadAsync(await getRaw(details.item.audio.url))
                },
            })

            tasks.push({
                description: `Unpacking effect "${name}" data...`,
                async execute() {
                    const data = await unpackJson<EffectData>(await getRaw(details.item.data.url))

                    data.clips.forEach(({ name: clipName, filename }) => {
                        tasks.push({
                            description: `Unpacking effect "${name}" clip "${formatEffectClipName(
                                clipName,
                            )}"...`,
                            async execute() {
                                const file = effectAudio.file(filename)
                                if (!file) throw `"${filename}" not found`

                                item.data.clips.push({
                                    name: clipName,
                                    url: load(await file.async('blob')),
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
