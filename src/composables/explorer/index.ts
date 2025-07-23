import { type Component, computed, markRaw, reactive } from 'vue'
import ModalTextInput from '../../components/modals/ModalTextInput.vue'
import { type ProjectItemTypeOf } from '../../core/project'
import { clone } from '../../core/utils'
import IconScp from '../../icons/box-solid.svg?component'
import IconClone from '../../icons/clone-solid.svg?component'
import IconEdit from '../../icons/edit-solid.svg?component'
import IconPlus from '../../icons/plus-solid.svg?component'
import { show } from '../modal'
import { type UseStateReturn, push, useState } from '../state'
import { addBackgroundItems } from './backgrounds'
import { addEffectItems } from './effects'
import { addParticleItems } from './particles'
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
    onClone?: () => void
    onDelete?: () => void
}

const openedPaths = reactive(new Map<string, true>())

export function useExplorer() {
    const state = useState()

    const tree = computed(() => {
        const items: ExplorerItem[] = [
            {
                level: 0,
                path: ['info'],
                hasChildren: false,
                icon: IconScp,
                title: 'Info',
            },
        ]

        addSkinItems(state, items)
        addBackgroundItems(state, items)
        addEffectItems(state, items)
        addParticleItems(state, items)

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
    { project, isExplorerOpened }: UseStateReturn,
    type: ProjectItemTypeOf<T>,
    title: string,
    placeholder: string,
    value: T,
) {
    const rawName: string | undefined = await show(ModalTextInput, {
        icon: markRaw(IconPlus),
        title,
        defaultValue: '',
        placeholder,
        validator(name: string) {
            name = name.trim()
            if (!name.length) return false
            if (name !== encodeURIComponent(name)) return false
            if (project.value[type].has(name)) return false
            return true
        },
    })
    const name = rawName?.trim()
    if (!name) return

    const items = new Map(project.value[type] as never)
    items.set(name, value as never)

    push({
        ...project.value,
        view: [type, name],
        [type]: items,
    })

    isExplorerOpened.value = false
}

export function onDeleteAll<T>({ project }: UseStateReturn, type: ProjectItemTypeOf<T>) {
    if (!project.value[type].size) return

    push({
        ...project.value,
        view: [],
        [type]: new Map(),
    })
}

export function onDelete<T>({ project }: UseStateReturn, type: ProjectItemTypeOf<T>, name: string) {
    const items = new Map(project.value[type] as never)
    items.delete(name)

    push({
        ...project.value,
        view: [],
        [type]: items,
    })
}

export async function onRename<T>(
    { project, view }: UseStateReturn,
    type: ProjectItemTypeOf<T>,
    title: string,
    placeholder: string,
    oldName: string,
) {
    const rawNewName: string | undefined = await show(ModalTextInput, {
        icon: markRaw(IconEdit),
        title,
        defaultValue: oldName,
        placeholder,
        validator(name: string) {
            name = name.trim()
            if (!name.length) return false
            if (project.value[type].has(name)) return false
            return true
        },
    })
    const newName = rawNewName?.trim()
    if (!newName) return

    const items = new Map(project.value[type] as never)
    const oldItem = items.get(oldName)
    items.delete(oldName)
    items.set(newName, oldItem as never)

    push({
        ...project.value,
        view:
            view.value[0] === type && view.value[1] === oldName
                ? [type, newName, ...view.value.slice(2)]
                : view.value,
        [type]: items,
    })
}

export async function onClone<T>(
    { project, view }: UseStateReturn,
    type: ProjectItemTypeOf<T>,
    title: string,
    placeholder: string,
    oldName: string,
) {
    const rawNewName: string | undefined = await show(ModalTextInput, {
        icon: markRaw(IconClone),
        title,
        defaultValue: oldName,
        placeholder,
        validator(name: string) {
            name = name.trim()
            if (!name.length) return false
            if (project.value[type].has(name)) return false
            return true
        },
    })
    const newName = rawNewName?.trim()
    if (!newName) return

    const items = new Map(project.value[type] as never)
    const newItem = clone(items.get(oldName))
    items.set(newName, newItem as never)

    push({
        ...project.value,
        view:
            view.value[0] === type && view.value[1] === oldName
                ? [type, newName, ...view.value.slice(2)]
                : view.value,
        [type]: items,
    })
}
