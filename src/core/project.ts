import {
    type BackgroundItem,
    type EffectItem,
    type PackageInfo,
    type ParticleItem,
    type ServerInfo,
    type ServerItemInfo,
    type ServerItemList,
    type SkinItem,
    type Srl,
} from '@sonolus/core'
import JSZip from 'jszip'
import {
    type Background,
    addBackgroundToWhitelist,
    packBackgrounds,
    unpackBackgrounds,
} from './background'
import { type Effect, addEffectToWhitelist, packEffects, unpackEffects } from './effect'
import { type Particle, addParticleToWhitelist, packParticles, unpackParticles } from './particle'
import { type Skin, addSkinToWhitelist, packSkins, unpackSkins } from './skin'
import { load } from './storage'
import { packRaw } from './utils'

export type Project = {
    view: string[]
    title: string
    description: string
    banner: string
    skins: Map<string, Skin>
    backgrounds: Map<string, Background>
    effects: Map<string, Effect>
    particles: Map<string, Particle>
}

export type ProjectItemTypeOf<T> = {
    [K in keyof Project]: Project[K] extends Map<string, T> ? K : never
}[keyof Project]

export function newProject(): Project {
    return {
        view: [],
        title: 'Sonolus Studio',
        description: '',
        banner: '',
        skins: new Map(),
        backgrounds: new Map(),
        effects: new Map(),
        particles: new Map(),
    }
}

export function addProjectToWhitelist(project: Project, whitelist: Set<string>) {
    whitelist.add(project.banner)

    for (const skin of project.skins.values()) {
        addSkinToWhitelist(skin, whitelist)
    }

    for (const background of project.backgrounds.values()) {
        addBackgroundToWhitelist(background, whitelist)
    }

    for (const effect of project.effects.values()) {
        addEffectToWhitelist(effect, whitelist)
    }

    for (const particle of project.particles.values()) {
        addParticleToWhitelist(particle, whitelist)
    }
}

export type PackProcess = {
    skins: SkinItem[]
    backgrounds: BackgroundItem[]
    effects: EffectItem[]
    particles: ParticleItem[]

    tasks: {
        description: string
        execute: () => void | Promise<void>
    }[]

    canvas: HTMLCanvasElement

    addRaw: (path: string, data: Uint8Array) => void
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    addJson: <T>(path: string, data: T) => void

    finish: () => Promise<Blob>
}

export function packProject(project: Project, canvas: HTMLCanvasElement) {
    const zip = new JSZip()

    const process: PackProcess = {
        skins: [],
        backgrounds: [],
        effects: [],
        particles: [],

        tasks: [],

        canvas,

        addRaw(path, data) {
            add(path, data)
        },
        addJson(path, data) {
            add(path, JSON.stringify(data))
        },

        async finish() {
            return await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
            })
        },
    }

    packSkins(process, project)
    packBackgrounds(process, project)
    packEffects(process, project)
    packParticles(process, project)

    process.tasks.push({
        description: 'Generating package information...',
        execute() {
            process.addJson<PackageInfo>('/sonolus/package', {
                shouldUpdate: false,
            })
        },
    })

    process.tasks.push({
        description: 'Generating server information...',
        async execute() {
            let banner: Srl | undefined

            if (project.banner) {
                const { hash, data } = await packRaw(project.banner)

                const path = `/sonolus/repository/${hash}`
                banner = {
                    hash,
                    url: path,
                }
                process.addRaw(path, data)
            }

            process.addJson<ServerInfo>('/sonolus/info', {
                title: project.title,
                description: project.description,
                buttons: [
                    { type: 'skin' },
                    { type: 'background' },
                    { type: 'effect' },
                    { type: 'particle' },
                ],
                configuration: {
                    options: [],
                },
                banner,
            })
        },
    })

    for (const [name, path] of [
        ['post', 'posts'],
        ['playlist', 'playlists'],
        ['level', 'levels'],
        ['replay', 'replays'],
        ['skin', 'skins'],
        ['background', 'backgrounds'],
        ['effect', 'effects'],
        ['particle', 'particles'],
        ['engine', 'engines'],
    ] as const) {
        process.tasks.push({
            description: `Generating ${name} info...`,
            execute() {
                process.addJson<ServerItemInfo>(`/sonolus/${path}/info`, {
                    sections: [],
                })
            },
        })

        process.tasks.push({
            description: `Generating ${name} list...`,
            execute() {
                process.addJson<ServerItemList<unknown>>(`/sonolus/${path}/list`, {
                    pageCount: 1,
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    items: process[path as never] ?? [],
                })
            },
        })
    }

    return process

    function add(path: string, data: string | Uint8Array) {
        if (!path.startsWith('/')) throw new Error(`"${path}" not allowed`)
        path = path.slice(1)

        zip.file(path, data)
    }
}

export type UnpackProcess = {
    project: Project

    tasks: {
        description: string
        execute: () => void | Promise<void>
    }[]

    canvas: HTMLCanvasElement

    getRaw: (path: string | null | undefined) => Promise<Blob>
    getJson: <T>(path: string | null | undefined) => Promise<T>
    getJsonOptional: <T>(path: string | null | undefined) => Promise<T | undefined>

    finish: () => Promise<void>
}

export function unpackPackage(file: File, canvas: HTMLCanvasElement) {
    let zip: JSZip

    const process: UnpackProcess = {
        project: newProject(),

        tasks: [],

        canvas,

        async getRaw(path: string | null | undefined) {
            return await get(path).async('blob')
        },
        async getJson(path: string | null | undefined) {
            return JSON.parse(await get(path).async('string')) as never
        },
        async getJsonOptional(path: string | null | undefined) {
            const file = getOptional(path)
            if (!file) return

            return JSON.parse(await file.async('string')) as never
        },

        async finish() {
            // No cleanup needed
        },
    }

    process.tasks.push({
        description: 'Loading package information...',
        async execute() {
            zip = await JSZip.loadAsync(file)

            const packageInfo = await process.getJson<PackageInfo>(`/sonolus/package`)
            if (packageInfo.shouldUpdate)
                throw new Error(
                    'Package not supported. If the package is exported from Sonolus, please export again using Full mode.',
                )
        },
    })

    process.tasks.push({
        description: 'Loading server information...',
        async execute() {
            const serverInfo = await process.getJson<ServerInfo>(`/sonolus/info`)

            process.project.title = serverInfo.title
            process.project.description = serverInfo.description ?? ''

            if (serverInfo.banner?.url) {
                process.project.banner = load(await process.getRaw(serverInfo.banner.url))
            }
        },
    })

    unpackSkins(process)
    unpackBackgrounds(process)
    unpackEffects(process)
    unpackParticles(process)

    return process

    function getOptional(path: string | null | undefined) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (!path?.startsWith('/')) throw new Error(`"${path!}" not allowed`)

        return zip.file(path.slice(1))
    }

    function get(path: string | null | undefined) {
        const file = getOptional(path)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (!file) throw new Error(`"${path!}" not found`)

        return file
    }
}
