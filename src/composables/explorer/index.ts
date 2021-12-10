import { Component, computed, markRaw, reactive, Ref } from 'vue'
import ModalTextInput from '../../components/modals/ModalTextInput.vue'
import { Project, ProjectItemTypeOf } from '../../core/project'
import IconEdit from '../../icons/edit-solid.svg?component'
import IconPlus from '../../icons/plus-solid.svg?component'
import { show } from '../modal'
import { push, useState } from '../state'
import { addBackgroundItems } from './backgrounds'
import { addEffectItems } from './effects'
import { addSkinItems } from './skins'

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

        addSkinItems(items, project.value, isExplorerOpened)
        addBackgroundItems(items, project.value, isExplorerOpened)
        addEffectItems(items, project.value, isExplorerOpened)

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

export async function onNew<T>(
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

export function onDeleteAll<T>(project: Project, type: ProjectItemTypeOf<T>) {
    if (!project[type].size) return

    push({
        ...project,
        view: [],
        [type]: new Map(),
    })
}

export function onDelete<T>(
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

export async function onRename<T>(
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
