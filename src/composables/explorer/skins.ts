import { markRaw } from 'vue'
import { ExplorerItem, isOpened, onDelete, onDeleteAll, onNew, onRename } from '.'
import ModalSkinSpriteId from '../../components/modals/ModalSkinSpriteId.vue'
import { formatSkinSpriteId, newSkin, newSkinSprite } from '../../core/skin'
import { clone } from '../../core/utils'
import IconDot from '../../icons/dot-circle-regular.svg?component'
import IconFileImage from '../../icons/file-image-solid.svg?component'
import IconFolder from '../../icons/folder-solid.svg?component'
import IconPlus from '../../icons/plus-solid.svg?component'
import { show } from '../modal'
import { UseStateReturn, push } from '../state'

export function addSkinItems(state: UseStateReturn, items: ExplorerItem[]) {
    items.push({
        level: 0,
        path: ['skins'],
        hasChildren: true,
        icon: IconDot,
        title: `Skins (${state.project.value.skins.size})`,
        onNew: () => onNew(state, 'skins', 'New Skin', 'Enter skin name...', newSkin()),
        onDelete: () => onDeleteAll(state, 'skins'),
    })

    if (!isOpened(['skins'])) return
    state.project.value.skins.forEach((skin, name) => {
        items.push({
            level: 1,
            path: ['skins', name],
            hasChildren: true,
            icon: skin.thumbnail,
            title: name,
            onRename: () => onRename(state, 'skins', 'Rename Skin', 'Enter new skin name...', name),
            onDelete: () => onDelete(state, 'skins', name),
        })

        if (!isOpened(['skins', name])) return
        items.push({
            level: 2,
            path: ['skins', name, 'sprites'],
            hasChildren: true,
            icon: IconFolder,
            title: `Sprites (${skin.data.sprites.length})`,
            onNew: () => onNewSkinSprite(state, name),
            onDelete: () => onDeleteSkinSprites(state, name),
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
                onRename: () => onRenameSkinSprite(state, name, id),
                onDelete: () => onDeleteSkinSprite(state, name, id),
            })
        })
    })
}

async function onNewSkinSprite({ project, isExplorerOpened }: UseStateReturn, name: string) {
    const skin = project.value.skins.get(name)
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

    const skins = new Map(project.value.skins)
    skins.set(name, newSkin)

    push({
        ...project.value,
        view: ['skins', name, 'sprites', id.toString()],
        skins,
    })

    isExplorerOpened.value = false
}

async function onDeleteSkinSprites({ project }: UseStateReturn, name: string) {
    const skin = project.value.skins.get(name)
    if (!skin) throw 'Skin not found'
    if (!skin.data.sprites.length) return

    const newSkin = clone(skin)
    newSkin.data.sprites = []

    const skins = new Map(project.value.skins)
    skins.set(name, newSkin)

    push({
        ...project.value,
        view: [],
        skins,
    })
}

async function onDeleteSkinSprite({ project }: UseStateReturn, name: string, id: number) {
    const skin = project.value.skins.get(name)
    if (!skin) throw 'Skin not found'

    const newSkin = clone(skin)
    newSkin.data.sprites = newSkin.data.sprites.filter((sprite) => sprite.id !== id)

    const skins = new Map(project.value.skins)
    skins.set(name, newSkin)

    push({
        ...project.value,
        view: [],
        skins,
    })
}

async function onRenameSkinSprite({ project, view }: UseStateReturn, name: string, oldId: number) {
    const skin = project.value.skins.get(name)
    if (!skin) throw 'Skin not found'

    const sprite = skin.data.sprites.find(({ id }) => id === oldId)
    if (!sprite) throw 'Skin Sprite not found'

    const newId = await show(ModalSkinSpriteId, {
        icon: markRaw(IconPlus),
        title: 'Rename Skin Sprite',
        defaultValue: oldId,
        validator: (value) => !skin.data.sprites.some(({ id }) => id === value),
    })
    if (newId === undefined) return

    const newSprite = clone(sprite)
    newSprite.id = newId

    const newSkin = clone(skin)
    newSkin.data.sprites = newSkin.data.sprites.map((sprite) =>
        sprite.id === oldId ? newSprite : sprite,
    )

    const skins = new Map(project.value.skins)
    skins.set(name, newSkin)

    push({
        ...project.value,
        view:
            view.value[0] === 'skins' &&
            view.value[1] === name &&
            view.value[2] === 'sprites' &&
            view.value[3] === oldId.toString()
                ? ['skins', name, 'sprites', newId.toString(), ...view.value.slice(4)]
                : view.value,
        skins,
    })
}
