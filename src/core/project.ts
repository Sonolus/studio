import JSZip from 'jszip'
import { BackgroundItem, EffectItem, ItemList, SkinItem } from 'sonolus-core'
import {
    addBackgroundToWhitelist,
    Background,
    packBackgrounds,
    unpackBackgrounds,
} from './background'
import {
    addEffectToWhitelist,
    Effect,
    packEffects,
    unpackEffects,
} from './effect'
import { addSkinToWhitelist, packSkins, Skin, unpackSkins } from './skin'

export type Project = {
    view: string[]
    skins: Map<string, Skin>
    backgrounds: Map<string, Background>
    effects: Map<string, Effect>
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
    }
}

export function addProjectToWhitelist(
    project: Project,
    whitelist: Set<string>
) {
    project.skins.forEach((skin) => addSkinToWhitelist(skin, whitelist))
    project.backgrounds.forEach((background) =>
        addBackgroundToWhitelist(background, whitelist)
    )
    project.effects.forEach((effect) => addEffectToWhitelist(effect, whitelist))
}

export type PackProcess = {
    skins: SkinItem[]
    backgrounds: BackgroundItem[]
    effects: EffectItem[]

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
            process.addJson<ItemList<BackgroundItem>>(
                '/sonolus/backgrounds/list',
                {
                    pageCount: 1,
                    items: process.backgrounds,
                    search: { options: [] },
                }
            )
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
