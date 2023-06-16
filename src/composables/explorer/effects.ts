import { EffectClip } from 'sonolus-core'
import { markRaw } from 'vue'
import { ExplorerItem, isOpened, onDelete, onDeleteAll, onNew, onRename } from '.'
import ModalEffectClipId from '../../components/modals/ModalEffectClipId.vue'
import { formatEffectClipId, newEffect, newEffectClip } from '../../core/effect'
import { clone } from '../../core/utils'
import IconDrum from '../../icons/drum-solid.svg?component'
import IconFileAudio from '../../icons/file-audio-solid.svg?component'
import IconFolder from '../../icons/folder-solid.svg?component'
import IconPlus from '../../icons/plus-solid.svg?component'
import { show } from '../modal'
import { push, UseStateReturn } from '../state'

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
        effect.data.clips.forEach(({ id }) => {
            items.push({
                level: 3,
                path: ['effects', name, 'clips', id.toString()],
                hasChildren: false,
                icon: IconFileAudio,
                title: formatEffectClipId(id),
                onRename: () => onRenameEffectClip(state, name, id),
                onDelete: () => onDeleteEffectClip(state, name, id),
            })
        })
    })
}

async function onNewEffectClip({ project, isExplorerOpened }: UseStateReturn, name: string) {
    const effect = project.value.effects.get(name)
    if (!effect) throw 'Effect not found'

    const id = await show(ModalEffectClipId, {
        icon: markRaw(IconPlus),
        title: 'New Effect Clip',
        defaultValue: EffectClip.Miss,
        validator: (value) => !effect.data.clips.some(({ id }) => id === value),
    })
    if (id === undefined) return

    const newEffect = clone(effect)
    newEffect.data.clips.push(newEffectClip(id))

    const effects = new Map(project.value.effects)
    effects.set(name, newEffect)

    push({
        ...project.value,
        view: ['effects', name, 'clips', id.toString()],
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

async function onDeleteEffectClip({ project }: UseStateReturn, name: string, id: number) {
    const effect = project.value.effects.get(name)
    if (!effect) throw 'Effect not found'

    const newEffect = clone(effect)
    newEffect.data.clips = newEffect.data.clips.filter((clip) => clip.id !== id)

    const effects = new Map(project.value.effects)
    effects.set(name, newEffect)

    push({
        ...project.value,
        view: [],
        effects,
    })
}

async function onRenameEffectClip({ project, view }: UseStateReturn, name: string, oldId: number) {
    const effect = project.value.effects.get(name)
    if (!effect) throw 'Effect not found'

    const clip = effect.data.clips.find(({ id }) => id === oldId)
    if (!clip) throw 'Effect clip not found'

    const newId = await show(ModalEffectClipId, {
        icon: markRaw(IconPlus),
        title: 'Rename Effect Clip',
        defaultValue: oldId,
        validator: (value) => !effect.data.clips.some(({ id }) => id === value),
    })
    if (newId === undefined) return

    const newClip = clone(clip)
    newClip.id = newId

    const newEffect = clone(effect)
    newEffect.data.clips = newEffect.data.clips.map((clip) => (clip.id === oldId ? newClip : clip))

    const effects = new Map(project.value.effects)
    effects.set(name, newEffect)

    push({
        ...project.value,
        view:
            view.value[0] === 'effects' &&
            view.value[1] === name &&
            view.value[2] === 'clips' &&
            view.value[3] === oldId.toString()
                ? ['effects', name, 'clips', newId.toString(), ...view.value.slice(4)]
                : view.value,
        effects,
    })
}
