import JSZip from 'jszip'
import {
    BackgroundItem,
    EffectItem,
    EngineItem,
    ItemList,
    LevelItem,
    ParticleItem,
    ServerInfo,
    SkinItem,
} from 'sonolus-core'
import {
    Background,
    addBackgroundToWhitelist,
    packBackgrounds,
    unpackBackgrounds,
} from './background'
import { Effect, addEffectToWhitelist, packEffects, unpackEffects } from './effect'
import { Skin, addSkinToWhitelist, packSkins, unpackSkins } from './skin'
import { Particle, addParticleToWhitelist, packParticles, unpackParticles } from './particle'

export type Project = {
    view: string[]
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
        skins: new Map(),
        backgrounds: new Map(),
        effects: new Map(),
        particles: new Map(),
    }
}

export function addProjectToWhitelist(project: Project, whitelist: Set<string>) {
    project.skins.forEach((skin) => addSkinToWhitelist(skin, whitelist))
    project.backgrounds.forEach((background) => addBackgroundToWhitelist(background, whitelist))
    project.effects.forEach((effect) => addEffectToWhitelist(effect, whitelist))
    project.particles.forEach((particle) => addParticleToWhitelist(particle, whitelist))
}

export type PackProcess = {
    skins: SkinItem[]
    backgrounds: BackgroundItem[]
    effects: EffectItem[]
    particles: ParticleItem[]

    tasks: {
        description: string
        execute: () => Promise<void>
    }[]

    canvas: HTMLCanvasElement

    addRaw: (path: string, data: Uint8Array) => void
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
        description: 'Generating server information...',
        async execute() {
            process.addJson<ServerInfo>('/sonolus/info', {
                title: 'Sonolus Studio',
                banner: {
                    type: 'ServerBanner',
                    hash: '',
                    url: '',
                },
                levels: {
                    items: [],
                    search: { options: [] },
                },
                skins: {
                    items: process.skins.slice(0, 5),
                    search: { options: [] },
                },
                backgrounds: {
                    items: process.backgrounds.slice(0, 5),
                    search: { options: [] },
                },
                effects: {
                    items: process.effects.slice(0, 5),
                    search: { options: [] },
                },
                particles: {
                    items: process.particles.slice(0, 5),
                    search: { options: [] },
                },
                engines: {
                    items: [],
                    search: { options: [] },
                },
            })
        },
    })

    process.tasks.push({
        description: 'Generating level list...',
        async execute() {
            process.addJson<ItemList<LevelItem>>('/sonolus/levels/list', {
                pageCount: 1,
                items: [],
                search: { options: [] },
            })
        },
    })

    process.tasks.push({
        description: 'Generating skin list...',
        async execute() {
            process.addJson<ItemList<SkinItem>>('/sonolus/skins/list', {
                pageCount: 1,
                items: process.skins,
                search: { options: [] },
            })
        },
    })

    process.tasks.push({
        description: 'Generating background list...',
        async execute() {
            process.addJson<ItemList<BackgroundItem>>('/sonolus/backgrounds/list', {
                pageCount: 1,
                items: process.backgrounds,
                search: { options: [] },
            })
        },
    })

    process.tasks.push({
        description: 'Generating effect list...',
        async execute() {
            process.addJson<ItemList<EffectItem>>('/sonolus/effects/list', {
                pageCount: 1,
                items: process.effects,
                search: { options: [] },
            })
        },
    })

    process.tasks.push({
        description: 'Generating particle list...',
        async execute() {
            process.addJson<ItemList<ParticleItem>>('/sonolus/particles/list', {
                pageCount: 1,
                items: process.particles,
                search: { options: [] },
            })
        },
    })

    process.tasks.push({
        description: 'Generating engine list...',
        async execute() {
            process.addJson<ItemList<EngineItem>>('/sonolus/engines/list', {
                pageCount: 1,
                items: [],
                search: { options: [] },
            })
        },
    })

    return process

    function add(path: string, data: unknown) {
        if (!path.startsWith('/')) throw `"${path}" not allowed`
        path = path.slice(1)

        zip.file(path, data)
    }
}

export type UnpackProcess = {
    project: Project

    tasks: {
        description: string
        execute: () => Promise<void>
    }[]

    canvas: HTMLCanvasElement

    getRaw: (path: string) => Promise<Blob>
    getJson: <T>(path: string) => Promise<T>
    getJsonOptional: <T>(path: string) => Promise<T | undefined>

    finish: () => Promise<void>
}

export function unpackPackage(file: File, canvas: HTMLCanvasElement) {
    let zip: JSZip

    const process: UnpackProcess = {
        project: newProject(),

        tasks: [],

        canvas,

        async getRaw(path: string) {
            return await get(path).async('blob')
        },
        async getJson(path: string) {
            return JSON.parse(await get(path).async('string'))
        },
        async getJsonOptional(path: string) {
            const file = getOptional(path)
            if (!file) return

            return JSON.parse(await file.async('string'))
        },

        async finish() {
            // No cleanup needed
        },
    }

    process.tasks.push({
        description: 'Loading package...',
        async execute() {
            zip = await JSZip.loadAsync(file)
        },
    })

    unpackSkins(process)
    unpackBackgrounds(process)
    unpackEffects(process)
    unpackParticles(process)

    return process

    function getOptional(path: string) {
        if (!path.startsWith('/')) throw `"${path}" not allowed`

        return zip.file(path.slice(1))
    }

    function get(path: string) {
        const file = getOptional(path)
        if (!file) throw `"${path}" not found`

        return file
    }
}
