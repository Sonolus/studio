import { markRaw, Ref } from 'vue'
import {
    ExplorerItem,
    isOpened,
    onDelete,
    onDeleteAll,
    onNew,
    onRename,
} from '.'
import ModalSkinSpriteId from '../../components/modals/ModalSkinSpriteId.vue'
import { Project } from '../../core/project'
import { formatSkinSpriteId, newSkin, newSkinSprite } from '../../core/skin'
import { clone } from '../../core/utils'
import IconDot from '../../icons/dot-circle-regular.svg?component'
import IconFileImage from '../../icons/file-image-solid.svg?component'
import IconFolder from '../../icons/folder-solid.svg?component'
import IconPlus from '../../icons/plus-solid.svg?component'
import { show } from '../modal'
import { push } from '../state'

export function addSkinItems(
    items: ExplorerItem[],
    project: Project,
    isExplorerOpened: Ref<boolean>
) {
    items.push({
        level: 0,
        path: ['skins'],
        hasChildren: true,
        icon: IconDot,
        title: `Skins (${project.skins.size})`,
        onNew: () =>
            onNew(
                project,
                isExplorerOpened,
                'skins',
                'New Skin',
                'Enter skin name...',
                newSkin()
            ),
        onDelete: () => onDeleteAll(project, 'skins'),
    })
    if (isOpened(['skins'])) {
        project.skins.forEach((skin, name) => {
            items.push({
                level: 1,
                path: ['skins', name],
                hasChildren: true,
                icon: skin.thumbnail,
                title: name,
                onRename: () =>
                    onRename(
                        project,
                        'skins',
                        'Rename Skin',
                        'Enter new skin name...',
                        name
                    ),
                onDelete: () => onDelete(project, 'skins', name),
            })

            if (!isOpened(['skins', name])) return
            items.push({
                level: 2,
                path: ['skins', name, 'sprites'],
                hasChildren: true,
                icon: IconFolder,
                title: `Sprites (${skin.data.sprites.length})`,
                onNew: () => onNewSkinSprite(project, isExplorerOpened, name),
                onDelete: () => onDeleteSkinSprites(project, name),
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
                    onDelete: () => onDeleteSkinSprite(project, name, id),
                })
            })
        })
    }
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
