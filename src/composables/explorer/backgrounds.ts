import { Ref } from 'vue'
import {
    ExplorerItem,
    isOpened,
    onDelete,
    onDeleteAll,
    onNew,
    onRename,
} from '.'
import { newBackground } from '../../core/background'
import { Project } from '../../core/project'
import IconImage from '../../icons/image-solid.svg?component'

export function addBackgroundItems(
    items: ExplorerItem[],
    project: Project,
    isExplorerOpened: Ref<boolean>
) {
    items.push({
        level: 0,
        path: ['backgrounds'],
        hasChildren: true,
        icon: IconImage,
        title: `Backgrounds (${project.backgrounds.size})`,
        onNew: () =>
            onNew(
                project,
                isExplorerOpened,
                'backgrounds',
                'New Background',
                'Enter background name...',
                newBackground()
            ),
        onDelete: () => onDeleteAll(project, 'backgrounds'),
    })

    if (!isOpened(['backgrounds'])) return
    project.backgrounds.forEach((background, name) => {
        items.push({
            level: 1,
            path: ['backgrounds', name],
            hasChildren: false,
            icon: background.thumbnail,
            title: name,
            onRename: () =>
                onRename(
                    project,
                    'backgrounds',
                    'Rename Background',
                    'Enter new background name...',
                    name
                ),
            onDelete: () => onDelete(project, 'backgrounds', name),
        })
    })
}
