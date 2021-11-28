import * as zip from '@zip.js/zip.js'
import { BackgroundItem, EffectItem, ItemList } from 'sonolus-core'
import {
    addBackgroundToWhitelist,
    Background,
    packBackground,
} from './background'
import { addEffectToWhitelist, Effect, packEffect } from './effect'

zip.configure({
    useWebWorkers: false,
})

export type Project = {
    view: string[]
    backgrounds: Map<string, Background>
    effects: Map<string, Effect>
}

export type ProjectItemTypeOf<T> = {
    [K in keyof Project]: Project[K] extends Map<string, T> ? K : never
}[keyof Project]

export function newProject(): Project {
    return {
        view: [],
        backgrounds: new Map(),
        effects: new Map(),
    }
}

export function addProjectToWhitelist(
    project: Project,
    whitelist: Set<string>
) {
    project.backgrounds.forEach((background) =>
        addBackgroundToWhitelist(background, whitelist)
    )
    project.effects.forEach((effect) => addEffectToWhitelist(effect, whitelist))
}

export type PackProcess = {
    backgrounds: BackgroundItem[]
    effects: EffectItem[]

    tasks: {
        description: string
        execute: () => Promise<void>
    }[]

    addRaw: (path: string, data: Uint8Array) => Promise<void>
    addJson: <T>(path: string, data: T) => Promise<void>

    finish: () => Promise<Blob>
}

export function packProject(project: Project) {
    const blobWriter = new zip.BlobWriter('application/zip')
    const zipWriter = new zip.ZipWriter(blobWriter)
    const paths = new Set<string>()

    const process: PackProcess = {
        backgrounds: [],
        effects: [],

        tasks: [],

        async addRaw(path, data) {
            if (paths.has(path)) return
            paths.add(path)

            await zipWriter.add(path, new zip.Uint8ArrayReader(data))
        },
        async addJson(path, data) {
            if (paths.has(path)) return
            paths.add(path)

            await zipWriter.add(path, new zip.TextReader(JSON.stringify(data)))
        },

        async finish() {
            await zipWriter.close()
            return blobWriter.getData()
        },
    }

    project.backgrounds.forEach((background, name) =>
        packBackground(process, name, background)
    )
    project.effects.forEach((effect, name) => packEffect(process, name, effect))

    process.tasks.push({
        description: 'Generating /backgrounds/list...',
        async execute() {
            await process.addJson<ItemList<BackgroundItem>>(
                'backgrounds/list',
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
            await process.addJson<ItemList<EffectItem>>('effects/list', {
                pageCount: 1,
                items: process.effects,
            })
        },
    })

    return process
}

export type UnpackProcess = {
    project: Project

    tasks: {
        description: string
        execute: () => Promise<void>
    }[]

    finish: () => Promise<void>
}

export function unpackPackage(file: File) {
    const process: UnpackProcess = {
        project: newProject(),

        tasks: [],

        async finish() {
            console.log('finished')
        },
    }

    return process
}
