import { EffectClipName } from '@sonolus/core'
import { markRaw } from 'vue'
import { ExplorerItem, isOpened, onClone, onDelete, onDeleteAll, onNew, onRename } from '.'
import ModalName from '../../components/modals/ModalName.vue'
import { formatEffectClipName, newEffect, newEffectClip } from '../../core/effect'
import { clone } from '../../core/utils'
import IconClone from '../../icons/clone-solid.svg?component'
import IconDrum from '../../icons/drum-solid.svg?component'
import IconFileAudio from '../../icons/file-audio-solid.svg?component'
import IconFolder from '../../icons/folder-solid.svg?component'
import IconPlus from '../../icons/plus-solid.svg?component'
import { show } from '../modal'
import { UseStateReturn, push } from '../state'

export function addEffectItems(state: UseStateReturn, items: ExplorerItem[]) {
    items.push({
        level: 0,
        path: ['effects'],
        hasChildren: true,
        icon: IconDrum,
        title: `Effects (${state.project.value.effects.size})`,
        onNew: () => onNew(state, 'effects', 'New Effect', 'Enter effect name...', newEffect()),
        onDelete: () => onDeleteAll(state, 'effects'),
    })

    if (!isOpened(['effects'])) return
    state.project.value.effects.forEach((effect, name) => {
        items.push({
            level: 1,
            path: ['effects', name],
            hasChildren: true,
            icon: effect.thumbnail,
            title: name,
            onRename: () =>
                onRename(state, 'effects', 'Rename Effect', 'Enter new effect name...', name),
            onClone: () =>
                onClone(state, 'effects', 'Clone Effect', 'Enter new effect name...', name),
            onDelete: () => onDelete(state, 'effects', name),
        })

        if (!isOpened(['effects', name])) return
        items.push({
            level: 2,
            path: ['effects', name, 'clips'],
            hasChildren: true,
            icon: IconFolder,
            title: `Clips (${effect.data.clips.length})`,
            onNew: () => onNewEffectClip(state, name),
            onDelete: () => onDeleteEffectClips(state, name),
        })

        if (!isOpened(['effects', name, 'clips'])) return
        effect.data.clips.forEach(({ name: clipName }) => {
            items.push({
                level: 3,
                path: ['effects', name, 'clips', clipName],
                hasChildren: false,
                icon: IconFileAudio,
                title: formatEffectClipName(clipName),
                onRename: () => onRenameEffectClip(state, name, clipName),
                onClone: () => onCloneEffectClip(state, name, clipName),
                onDelete: () => onDeleteEffectClip(state, name, clipName),
            })
        })
    })
}

async function onNewEffectClip({ project, isExplorerOpened }: UseStateReturn, name: string) {
    const effect = project.value.effects.get(name)
    if (!effect) throw 'Effect not found'

    const newName = await show(ModalName, {
        icon: markRaw(IconPlus),
        title: 'New Effect Clip',
        names: EffectClipName,
        defaultValue: EffectClipName.Miss,
        validator: (value) => !!value && !effect.data.clips.some(({ name }) => name === value),
    })
    if (!newName) return

    const newEffect = clone(effect)
    newEffect.data.clips.push(newEffectClip(newName))

    const effects = new Map(project.value.effects)
    effects.set(name, newEffect)

    push({
        ...project.value,
        view: ['effects', name, 'clips', newName],
        effects,
    })

    isExplorerOpened.value = false
}

async function onDeleteEffectClips({ project }: UseStateReturn, name: string) {
    const effect = project.value.effects.get(name)
    if (!effect) throw 'Effect not found'
    if (!effect.data.clips.length) return

    const newEffect = clone(effect)
    newEffect.data.clips = []

    const effects = new Map(project.value.effects)
    effects.set(name, newEffect)

    push({
        ...project.value,
        view: [],
        effects,
    })
}

async function onDeleteEffectClip({ project }: UseStateReturn, name: string, clipName: string) {
    const effect = project.value.effects.get(name)
    if (!effect) throw 'Effect not found'

    const newEffect = clone(effect)
    newEffect.data.clips = newEffect.data.clips.filter(({ name }) => name !== clipName)

    const effects = new Map(project.value.effects)
    effects.set(name, newEffect)

    push({
        ...project.value,
        view: [],
        effects,
    })
}

async function onRenameEffectClip(
    { project, view }: UseStateReturn,
    name: string,
    spriteName: string,
) {
    const effect = project.value.effects.get(name)
    if (!effect) throw 'Effect not found'

    const clip = effect.data.clips.find(({ name }) => name === spriteName)
    if (!clip) throw 'Effect clip not found'

    const newName = await show(ModalName, {
        icon: markRaw(IconPlus),
        title: 'Rename Effect Clip',
        names: EffectClipName,
        defaultValue: spriteName,
        validator: (value) => !!value && !effect.data.clips.some(({ name }) => name === value),
    })
    if (!newName) return

    const newClip = clone(clip)
    newClip.name = newName

    const newEffect = clone(effect)
    newEffect.data.clips = newEffect.data.clips.map((clip) =>
        clip.name === spriteName ? newClip : clip,
    )

    const effects = new Map(project.value.effects)
    effects.set(name, newEffect)

    push({
        ...project.value,
        view:
            view.value[0] === 'effects' &&
            view.value[1] === name &&
            view.value[2] === 'clips' &&
            view.value[3] === spriteName
                ? ['effects', name, 'clips', newName, ...view.value.slice(4)]
                : view.value,
        effects,
    })
}

async function onCloneEffectClip(
    { project, view }: UseStateReturn,
    name: string,
    spriteName: string,
) {
    const effect = project.value.effects.get(name)
    if (!effect) throw 'Effect not found'

    const clip = effect.data.clips.find(({ name }) => name === spriteName)
    if (!clip) throw 'Effect clip not found'

    const newName = await show(ModalName, {
        icon: markRaw(IconClone),
        title: 'Clone Effect Clip',
        names: EffectClipName,
        defaultValue: spriteName,
        validator: (value) => !!value && !effect.data.clips.some(({ name }) => name === value),
    })
    if (!newName) return

    const newClip = clone(clip)
    newClip.name = newName

    const newEffect = clone(effect)
    newEffect.data.clips.push(newClip)

    const effects = new Map(project.value.effects)
    effects.set(name, newEffect)

    push({
        ...project.value,
        view:
            view.value[0] === 'effects' &&
            view.value[1] === name &&
            view.value[2] === 'clips' &&
            view.value[3] === spriteName
                ? ['effects', name, 'clips', newName, ...view.value.slice(4)]
                : view.value,
        effects,
    })
}
