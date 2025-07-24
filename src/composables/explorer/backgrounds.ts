import { type ExplorerItem, isOpened, onClone, onDelete, onDeleteAll, onNew, onRename } from '.'
import { newBackground } from '../../core/background'
import IconImage from '../../icons/image-solid.svg?component'
import { type UseStateReturn } from '../state'

export function addBackgroundItems(state: UseStateReturn, items: ExplorerItem[]) {
    items.push({
        level: 0,
        path: ['backgrounds'],
        hasChildren: true,
        icon: IconImage,
        title: `Backgrounds (${state.project.value.backgrounds.size})`,
        onNew: () => {
            void onNew(
                state,
                'backgrounds',
                'New Background',
                'Enter background name...',
                newBackground(),
            )
        },
        onDelete: () => {
            onDeleteAll(state, 'backgrounds')
        },
    })

    if (!isOpened(['backgrounds'])) return

    for (const [name, background] of state.project.value.backgrounds) {
        items.push({
            level: 1,
            path: ['backgrounds', name],
            hasChildren: false,
            icon: background.thumbnail,
            title: name,
            onRename: () => {
                void onRename(
                    state,
                    'backgrounds',
                    'Rename Background',
                    'Enter new background name...',
                    name,
                )
            },
            onClone: () => {
                void onClone(
                    state,
                    'backgrounds',
                    'Clone Background',
                    'Enter new background name...',
                    name,
                )
            },
            onDelete: () => {
                onDelete(state, 'backgrounds', name)
            },
        })
    }
}
