import {
    BackgroundConfiguration,
    BackgroundData,
    BackgroundItem,
    ItemDetails,
} from 'sonolus-core'
import { PackProcess } from './project'
import { packJson, packRaw, srl } from './utils'

export type Background = {
    title: string
    subtitle: string
    author: string
    description: string
    thumbnail: string
    image: string
    data: BackgroundData
    configuration: BackgroundConfiguration
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
            aspectRatio: 1,
            fit: 'height',
            color: '#000',
        },
        configuration: {
            blur: 0,
            mask: '#0000',
        },
    }
}

export function addBackgroundToWhitelist(
    background: Background,
    whitelist: Set<string>
) {
    whitelist.add(background.thumbnail)
    whitelist.add(background.image)
}

export function packBackground(
    { backgrounds, tasks, addRaw, addJson }: PackProcess,
    name: string,
    background: Background
) {
    const item: BackgroundItem = {
        name,
        version: 2,
        title: background.title,
        subtitle: background.subtitle,
        author: background.author,
        thumbnail: srl('BackgroundThumbnail'),
        image: srl('BackgroundImage'),
        data: srl('BackgroundData'),
        configuration: srl('BackgroundConfiguration'),
    }
    backgrounds.push(item)

    tasks.push({
        description: `Packing background "${name}" thumbnail...`,
        async execute() {
            const { hash, data } = await packRaw(background.thumbnail)

            const path = `repository/BackgroundThumbnail/${hash}`
            item.thumbnail.hash = hash
            item.thumbnail.url = `/${path}`
            await addRaw(path, data)
        },
    })

    tasks.push({
        description: `Packing background "${name}" image...`,
        async execute() {
            const { hash, data } = await packRaw(background.image)

            const path = `repository/BackgroundImage/${hash}`
            item.image.hash = hash
            item.image.url = `/${path}`
            await addRaw(path, data)
        },
    })

    tasks.push({
        description: `Packing background "${name}" data...`,
        async execute() {
            const { hash, data } = await packJson(background.data)

            const path = `repository/BackgroundData/${hash}`
            item.data.hash = hash
            item.data.url = `/${path}`
            await addRaw(path, data)
        },
    })

    tasks.push({
        description: `Packing background "${name}" configuration...`,
        async execute() {
            const { hash, data } = await packJson(background.configuration)

            const path = `repository/BackgroundConfiguration/${hash}`
            item.configuration.hash = hash
            item.configuration.url = `/${path}`
            await addRaw(path, data)
        },
    })

    tasks.push({
        description: `Generating /backgrounds/${name}`,
        async execute() {
            await addJson<ItemDetails<BackgroundItem>>(`backgrounds/${name}`, {
                item,
                description: background.description,
                recommended: [],
            })
        },
    })
}
