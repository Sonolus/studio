import { Component, computed, markRaw, reactive, Ref } from 'vue'
import ModalEffectClipId from '../../components/modals/ModalEffectClipId.vue'
import ModalSkinSpriteId from '../../components/modals/ModalSkinSpriteId.vue'
import ModalTextInput from '../../components/modals/ModalTextInput.vue'
import { newBackground } from '../../core/background'
import { formatEffectClipId, newEffect, newEffectClip } from '../../core/effect'
import { Project, ProjectItemTypeOf } from '../../core/project'
import { formatSkinSpriteId, newSkin, newSkinSprite } from '../../core/skin'
import { clone } from '../../core/utils'
import IconDot from '../../icons/dot-circle-regular.svg?component'
import IconDrum from '../../icons/drum-solid.svg?component'
import IconEdit from '../../icons/edit-solid.svg?component'
import IconFileAudio from '../../icons/file-audio-solid.svg?component'
import IconFileImage from '../../icons/file-image-solid.svg?component'
import IconFolder from '../../icons/folder-solid.svg?component'
import IconImage from '../../icons/image-solid.svg?component'
import IconPlus from '../../icons/plus-solid.svg?component'
import { show } from '../modal'
import { push, useState } from '../state'

export type ExplorerItem = {
    level: number
    path: string[]
    hasChildren: boolean

    icon: Component | string
    fallback?: Component
    title: string

    onNew?: () => void
    onRename?: () => void
    onDelete: () => void
}

const openedPaths = reactive(new Map<string, true>())

export function useExplorer() {
    const { project, isExplorerOpened } = useState()

    const tree = computed(() => {
        const items: ExplorerItem[] = []

        items.push({
            level: 0,
            path: ['skins'],
            hasChildren: true,
            icon: IconDot,
            title: `Skins (${project.value.skins.size})`,
            onNew: () =>
                onNew(
                    project.value,
                    isExplorerOpened,
                    'skins',
                    'New Skin',
                    'Enter skin name...',
                    newSkin()
                ),
            onDelete: () => onDeleteAll(project.value, 'skins'),
        })
        if (isOpened(['skins'])) {
            project.value.skins.forEach((skin, name) => {
                items.push({
                    level: 1,
                    path: ['skins', name],
                    hasChildren: true,
                    icon: skin.thumbnail,
                    title: name,
                    onRename: () =>
                        onRename(
                            project.value,
                            'skins',
                            'Rename Skin',
                            'Enter new skin name...',
                            name
                        ),
                    onDelete: () => onDelete(project.value, 'skins', name),
                })

                if (!isOpened(['skins', name])) return
                items.push({
                    level: 2,
                    path: ['skins', name, 'sprites'],
                    hasChildren: true,
                    icon: IconFolder,
                    title: `Sprites (${skin.data.sprites.length})`,
                    onNew: () =>
                        onNewSkinSprite(project.value, isExplorerOpened, name),
                    onDelete: () => onDeleteSkinSprites(project.value, name),
                })

                if (!isOpened(['skins', name, 'sprites'])) return
                skin.data.sprites.forEach(({ id, texture }) => {
                    items.push({
                        level: 3,
                        path: ['skins', name, 'sprites', id.toString()],
                        hasChildren: false,
                        icon: texture,
                        fallback: IconFileImage,
                        title: formatSkinSpriteId(id),
                        onDelete: () =>
                            onDeleteSkinSprite(project.value, name, id),
                    })
                })
            })
        }

        items.push({
            level: 0,
            path: ['backgrounds'],
            hasChildren: true,
            icon: IconImage,
            title: `Backgrounds (${project.value.backgrounds.size})`,
            onNew: () =>
                onNew(
                    project.value,
                    isExplorerOpened,
                    'backgrounds',
                    'New Background',
                    'Enter background name...',
                    newBackground()
                ),
            onDelete: () => onDeleteAll(project.value, 'backgrounds'),
        })
        if (isOpened(['backgrounds'])) {
            project.value.backgrounds.forEach((background, name) => {
                items.push({
                    level: 1,
                    path: ['backgrounds', name],
                    hasChildren: false,
                    icon: background.thumbnail,
                    title: name,
                    onRename: () =>
                        onRename(
                            project.value,
                            'backgrounds',
                            'Rename Background',
                            'Enter new background name...',
                            name
                        ),
                    onDelete: () =>
                        onDelete(project.value, 'backgrounds', name),
                })
            })
        }

        items.push({
            level: 0,
            path: ['effects'],
            hasChildren: true,
            icon: IconDrum,
            title: `Effects (${project.value.effects.size})`,
            onNew: () =>
                onNew(
                    project.value,
                    isExplorerOpened,
                    'effects',
                    'New Effect',
                    'Enter effect name...',
                    newEffect()
                ),
            onDelete: () => onDeleteAll(project.value, 'effects'),
        })
        if (isOpened(['effects'])) {
            project.value.effects.forEach((effect, name) => {
                items.push({
                    level: 1,
                    path: ['effects', name],
                    hasChildren: true,
                    icon: effect.thumbnail,
                    title: name,
                    onRename: () =>
                        onRename(
                            project.value,
                            'effects',
                            'Rename Effect',
                            'Enter new effect name...',
                            name
                        ),
                    onDelete: () => onDelete(project.value, 'effects', name),
                })

                if (!isOpened(['effects', name])) return
                items.push({
                    level: 2,
                    path: ['effects', name, 'clips'],
                    hasChildren: true,
                    icon: IconFolder,
                    title: `Clips (${effect.data.clips.length})`,
                    onNew: () =>
                        onNewEffectClip(project.value, isExplorerOpened, name),
                    onDelete: () => onDeleteEffectClips(project.value, name),
                })

                if (!isOpened(['effects', name, 'clips'])) return
                effect.data.clips.forEach(({ id }) => {
                    items.push({
                        level: 3,
                        path: ['effects', name, 'clips', id.toString()],
                        hasChildren: false,
                        icon: IconFileAudio,
                        title: formatEffectClipId(id),
                        onDelete: () =>
                            onDeleteEffectClip(project.value, name, id),
                    })
                })
            })
        }

        return items
    })

    return {
        tree,
    }
}

export function toKey(path: string[]) {
    return path.join('/')
}

export function isOpened(path: string[]) {
    const key = path.join('/')
    return openedPaths.has(key)
}

export function open(path: string[]) {
    openedPaths.set(toKey(path), true)
}

export function close(path: string[]) {
    openedPaths.delete(toKey(path))
}

export function toggle(path: string[]) {
    if (isOpened(path)) {
        close(path)
    } else {
        open(path)
    }
}

async function onNew<T>(
    project: Project,
    isExplorerOpened: Ref<boolean>,
    type: ProjectItemTypeOf<T>,
    title: string,
    placeholder: string,
    value: T
) {
    const name = (
        await show(ModalTextInput, {
            icon: markRaw(IconPlus),
            title,
            defaultValue: '',
            placeholder,
            validator(name) {
                name = name.trim()
                if (!name.length) return false
                if (project[type].has(name)) return false
                return true
            },
        })
    )?.trim()
    if (!name) return

    const items = new Map(project[type] as never)
    items.set(name, value as never)

    push({
        ...project,
        view: [type, name],
        [type]: items,
    })

    isExplorerOpened.value = false
}

function onDeleteAll<T>(project: Project, type: ProjectItemTypeOf<T>) {
    if (!project[type].size) return

    push({
        ...project,
        view: [],
        [type]: new Map(),
    })
}

function onDelete<T>(
    project: Project,
    type: ProjectItemTypeOf<T>,
    name: string
) {
    const items = new Map(project[type] as never)
    items.delete(name)

    push({
        ...project,
        view: [],
        [type]: items,
    })
}

async function onRename<T>(
    project: Project,
    type: ProjectItemTypeOf<T>,
    title: string,
    placeholder: string,
    oldName: string
) {
    const newName = (
        await show(ModalTextInput, {
            icon: markRaw(IconEdit),
            title,
            defaultValue: oldName,
            placeholder,
            validator(name) {
                name = name.trim()
                if (!name.length) return false
                if (project[type].has(name)) return false
                return true
            },
        })
    )?.trim()
    if (!newName) return

    const items = new Map(project[type] as never)
    const oldItem = items.get(oldName)
    items.delete(oldName)
    items.set(newName, oldItem as never)

    push({
        ...project,
        view: [],
        [type]: items,
    })
}

async function onNewSkinSprite(
    project: Project,
    isExplorerOpened: Ref<boolean>,
    name: string
) {
    const skin = project.skins.get(name)
    if (!skin) throw 'Skin not found'

    const id = await show(ModalSkinSpriteId, {
        icon: markRaw(IconPlus),
        title: 'New Skin Sprite',
        defaultValue: 0,
        validator: (value) => !skin.data.sprites.some(({ id }) => id === value),
    })
    if (id === undefined) return

    const newSkin = clone(skin)
    newSkin.data.sprites.push(newSkinSprite(id))

    const skins = new Map(project.skins)
    skins.set(name, newSkin)

    push({
        ...project,
        view: ['skins', name, 'sprites', id.toString()],
        skins,
    })

    isExplorerOpened.value = false
}

async function onDeleteSkinSprites(project: Project, name: string) {
    const skin = project.skins.get(name)
    if (!skin) throw 'Skin not found'
    if (!skin.data.sprites.length) return

    const newSkin = clone(skin)
    newSkin.data.sprites = []

    const skins = new Map(project.skins)
    skins.set(name, newSkin)

    push({
        ...project,
        view: [],
        skins,
    })
}

async function onDeleteSkinSprite(project: Project, name: string, id: number) {
    const skin = project.skins.get(name)
    if (!skin) throw 'Skin not found'

    const newSkin = clone(skin)
    newSkin.data.sprites = newSkin.data.sprites.filter(
        (sprite) => sprite.id !== id
    )

    const skins = new Map(project.skins)
    skins.set(name, newSkin)

    push({
        ...project,
        view: [],
        skins,
    })
}

async function onNewEffectClip(
    project: Project,
    isExplorerOpened: Ref<boolean>,
    name: string
) {
    const effect = project.effects.get(name)
    if (!effect) throw 'Effect not found'

    const id = await show(ModalEffectClipId, {
        icon: markRaw(IconPlus),
        title: 'New Effect Clip',
        defaultValue: 0,
        validator: (value) => !effect.data.clips.some(({ id }) => id === value),
    })
    if (id === undefined) return

    const newEffect = clone(effect)
    newEffect.data.clips.push(newEffectClip(id))

    const effects = new Map(project.effects)
    effects.set(name, newEffect)

    push({
        ...project,
        view: ['effects', name, 'clips', id.toString()],
        effects,
    })

    isExplorerOpened.value = false
}

async function onDeleteEffectClips(project: Project, name: string) {
    const effect = project.effects.get(name)
    if (!effect) throw 'Effect not found'
    if (!effect.data.clips.length) return

    const newEffect = clone(effect)
    newEffect.data.clips = []

    const effects = new Map(project.effects)
    effects.set(name, newEffect)

    push({
        ...project,
        view: [],
        effects,
    })
}

async function onDeleteEffectClip(project: Project, name: string, id: number) {
    const effect = project.effects.get(name)
    if (!effect) throw 'Effect not found'

    const newEffect = clone(effect)
    newEffect.data.clips = newEffect.data.clips.filter((clip) => clip.id !== id)

    const effects = new Map(project.effects)
    effects.set(name, newEffect)

    push({
        ...project,
        view: [],
        effects,
    })
}
