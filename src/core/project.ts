import * as zip from '@zip.js/zip.js'
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

zip.configure({
    useWebWorkers: false,
})

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

    addRaw: (path: string, data: Uint8Array) => Promise<void>
    addJson: <T>(path: string, data: T) => Promise<void>

    finish: () => Promise<Blob>
}

export function packProject(project: Project, canvas: HTMLCanvasElement) {
    const blobWriter = new zip.BlobWriter('application/zip')
    const zipWriter = new zip.ZipWriter(blobWriter)
    const paths = new Set<string>()

    const process: PackProcess = {
        skins: [],
        backgrounds: [],
        effects: [],

        tasks: [],

        canvas,

        async addRaw(path, data) {
            await add(path, new zip.Uint8ArrayReader(data))
        },
        async addJson(path, data) {
            await add(path, new zip.TextReader(JSON.stringify(data)))
        },

        async finish() {
            await zipWriter.close()
            return blobWriter.getData()
        },
    }

    packSkins(process, project)
    packBackgrounds(process, project)
    packEffects(process, project)

    process.tasks.push({
        description: 'Generating /skins/list...',
        async execute() {
            await process.addJson<ItemList<SkinItem>>('/skins/list', {
                pageCount: 1,
                items: process.skins,
            })
        },
    })

    process.tasks.push({
        description: 'Generating /backgrounds/list...',
        async execute() {
            await process.addJson<ItemList<BackgroundItem>>(
                '/backgrounds/list',
                {
                    pageCount: 1,
                    items: process.backgrounds,
                }
            )
        },
    })

    process.tasks.push({
        description: 'Generating /effects/list...',
        async execute() {
            await process.addJson<ItemList<EffectItem>>('/effects/list', {
                pageCount: 1,
                items: process.effects,
            })
        },
    })

    return process

    function add(path: string, reader: zip.Reader) {
        if (!path.startsWith('/')) throw `"${path}" not allowed`
        path = path.slice(1)

        if (paths.has(path)) return
        paths.add(path)

        return zipWriter.add(path, reader)
    }
}

export type UnpackProcess = {
    project: Project

    tasks: {
        description: string
        execute: () => Promise<void>
    }[]

    canvas: HTMLCanvasElement

    getRaw: (path: string, mime?: string) => Promise<Blob>
    getJson: <T>(path: string) => Promise<T>

    finish: () => Promise<void>
}

export function unpackPackage(file: File, canvas: HTMLCanvasElement) {
    const zipReader = new zip.ZipReader(new zip.BlobReader(file))
    let entries: zip.Entry[] = []

    const process: UnpackProcess = {
        project: newProject(),

        tasks: [],

        canvas,

        async getRaw(path: string, mime?: string) {
            return await get(path, new zip.BlobWriter(mime))
        },
        async getJson(path: string) {
            return JSON.parse(await get(path, new zip.TextWriter()))
        },

        async finish() {
            await zipReader.close()
        },
    }

    process.tasks.push({
        description: 'Loading package...',
        async execute() {
            entries = await zipReader.getEntries()
        },
    })

    unpackSkins(process)
    unpackBackgrounds(process)
    unpackEffects(process)

    return process

    function get(path: string, writer: zip.Writer) {
        if (!path.startsWith('/')) throw `"${path}" not allowed`
        const entry = entries.find((entry) => entry.filename === path.slice(1))
        if (!entry) throw `"${path}" not found`
        if (!entry.getData) throw 'Unexpected missing entry.getData'

        return entry.getData(writer)
    }
}
