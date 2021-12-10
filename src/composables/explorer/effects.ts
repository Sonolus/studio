import { markRaw, Ref } from 'vue'
import {
    ExplorerItem,
    isOpened,
    onDelete,
    onDeleteAll,
    onNew,
    onRename,
} from '.'
import ModalEffectClipId from '../../components/modals/ModalEffectClipId.vue'
import { formatEffectClipId, newEffect, newEffectClip } from '../../core/effect'
import { Project } from '../../core/project'
import { clone } from '../../core/utils'
import IconDrum from '../../icons/drum-solid.svg?component'
import IconFileAudio from '../../icons/file-audio-solid.svg?component'
import IconFolder from '../../icons/folder-solid.svg?component'
import IconPlus from '../../icons/plus-solid.svg?component'
import { show } from '../modal'
import { push } from '../state'

export function addEffectItems(
    items: ExplorerItem[],
    project: Project,
    isExplorerOpened: Ref<boolean>
) {
    items.push({
        level: 0,
        path: ['effects'],
        hasChildren: true,
        icon: IconDrum,
        title: `Effects (${project.effects.size})`,
        onNew: () =>
            onNew(
                project,
                isExplorerOpened,
                'effects',
                'New Effect',
                'Enter effect name...',
                newEffect()
            ),
        onDelete: () => onDeleteAll(project, 'effects'),
    })
    if (isOpened(['effects'])) {
        project.effects.forEach((effect, name) => {
            items.push({
                level: 1,
                path: ['effects', name],
                hasChildren: true,
                icon: effect.thumbnail,
                title: name,
                onRename: () =>
                    onRename(
                        project,
                        'effects',
                        'Rename Effect',
                        'Enter new effect name...',
                        name
                    ),
                onDelete: () => onDelete(project, 'effects', name),
            })

            if (!isOpened(['effects', name])) return
            items.push({
                level: 2,
                path: ['effects', name, 'clips'],
                hasChildren: true,
                icon: IconFolder,
                title: `Clips (${effect.data.clips.length})`,
                onNew: () => onNewEffectClip(project, isExplorerOpened, name),
                onDelete: () => onDeleteEffectClips(project, name),
            })

            if (!isOpened(['effects', name, 'clips'])) return
            effect.data.clips.forEach(({ id }) => {
                items.push({
                    level: 3,
                    path: ['effects', name, 'clips', id.toString()],
                    hasChildren: false,
                    icon: IconFileAudio,
                    title: formatEffectClipId(id),
                    onDelete: () => onDeleteEffectClip(project, name, id),
                })
            })
        })
    }
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
