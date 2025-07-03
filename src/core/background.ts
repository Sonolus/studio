import {
    BackgroundConfiguration,
    BackgroundData,
    BackgroundItem,
    ServerItemDetails,
    ServerItemList,
} from '@sonolus/core'
import { PackProcess, Project, UnpackProcess } from './project'
import { load } from './storage'
import { emptySrl, packJson, packRaw, unpackJson } from './utils'

export type Background = {
    title: string
    subtitle: string
    author: string
    description: string
    thumbnail: string
    image: string
    data: BackgroundData
    configuration: Required<BackgroundConfiguration>
}

export function newBackground(): Background {
    return {
        title: '',
        subtitle: '',
        author: '',
        description: '',
        thumbnail: '',
        image: '',
        data: {
            fit: 'cover',
            color: '#000',
        },
        configuration: {
            scope: '',
            blur: 0,
            mask: '#0000',
        },
    }
}

export function addBackgroundToWhitelist(background: Background, whitelist: Set<string>) {
    whitelist.add(background.thumbnail)
    whitelist.add(background.image)
}

export function packBackgrounds(process: PackProcess, project: Project) {
    project.backgrounds.forEach((background, name) => packBackground(process, name, background))
}

function packBackground(
    { backgrounds, tasks, addRaw, addJson }: PackProcess,
    name: string,
    background: Background,
) {
    const item: BackgroundItem = {
        name,
        version: 2,
        title: background.title,
        subtitle: background.subtitle,
        author: background.author,
        tags: [],
        thumbnail: emptySrl(),
        image: emptySrl(),
        data: emptySrl(),
        configuration: emptySrl(),
    }
    backgrounds.push(item)

    tasks.push({
        description: `Packing background "${name}" thumbnail...`,
        async execute() {
            const { hash, data } = await packRaw(background.thumbnail)

            const path = `/sonolus/repository/${hash}`
            item.thumbnail.hash = hash
            item.thumbnail.url = path
            addRaw(path, data)
        },
    })

    tasks.push({
        description: `Packing background "${name}" image...`,
        async execute() {
            const { hash, data } = await packRaw(background.image)

            const path = `/sonolus/repository/${hash}`
            item.image.hash = hash
            item.image.url = path
            addRaw(path, data)
        },
    })

    tasks.push({
        description: `Packing background "${name}" data...`,
        async execute() {
            const { hash, data } = await packJson(background.data)

            const path = `/sonolus/repository/${hash}`
            item.data.hash = hash
            item.data.url = path
            addRaw(path, data)
        },
    })

    tasks.push({
        description: `Packing background "${name}" configuration...`,
        async execute() {
            const { hash, data } = await packJson(background.configuration)

            const path = `/sonolus/repository/${hash}`
            item.configuration.hash = hash
            item.configuration.url = path
            addRaw(path, data)
        },
    })

    tasks.push({
        description: `Generating background "${name}" details...`,
        async execute() {
            addJson<ServerItemDetails<BackgroundItem>>(`/sonolus/backgrounds/${name}`, {
                item,
                description: background.description,
                actions: [],
                hasCommunity: false,
                leaderboards: [],
                sections: [],
            })
        },
    })
}

export function unpackBackgrounds(process: UnpackProcess) {
    const { tasks, getJsonOptional } = process

    tasks.push({
        description: 'Loading background list...',
        async execute() {
            const list = await getJsonOptional<ServerItemList<BackgroundItem>>(
                '/sonolus/backgrounds/list',
            )
            if (!list) return

            list.items.forEach(({ name }) => unpackBackground(process, name))
        },
    })
}

function unpackBackground({ project, tasks, getRaw, getJson }: UnpackProcess, name: string) {
    tasks.push({
        description: `Loading background "${name}" details...`,
        async execute() {
            const details = await getJson<ServerItemDetails<BackgroundItem>>(
                `/sonolus/backgrounds/${name}`,
            )

            const item = newBackground()
            item.title = details.item.title
            item.subtitle = details.item.subtitle
            item.author = details.item.author
            item.description = details.description || ''

            tasks.push({
                description: `Unpacking background "${name}" thumbnail...`,
                async execute() {
                    item.thumbnail = load(await getRaw(details.item.thumbnail.url))
                },
            })

            tasks.push({
                description: `Unpacking background "${name}" image...`,
                async execute() {
                    item.image = load(await getRaw(details.item.image.url))
                },
            })

            tasks.push({
                description: `Unpacking background "${name}" data...`,
                async execute() {
                    item.data = await unpackJson(await getRaw(details.item.data.url))
                },
            })

            tasks.push({
                description: `Unpacking background "${name}" configuration...`,
                async execute() {
                    item.configuration = await unpackJson(
                        await getRaw(details.item.configuration.url),
                    )
                },
            })

            project.backgrounds.set(name, item)
        },
    })
}
