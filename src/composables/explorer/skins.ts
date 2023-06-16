import { markRaw } from 'vue'
import { ExplorerItem, isOpened, onDelete, onDeleteAll, onNew, onRename } from '.'
import ModalTextInput from '../../components/modals/ModalTextInput.vue'
import { formatSkinSpriteName, newSkin, newSkinSprite } from '../../core/skin'
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
        skin.data.sprites.forEach(({ name: spriteName, texture }) => {
            items.push({
                level: 3,
                path: ['skins', name, 'sprites', spriteName],
                hasChildren: false,
                icon: texture,
                fallback: IconFileImage,
                title: formatSkinSpriteName(spriteName),
                onRename: () => onRenameSkinSprite(state, name, spriteName),
                onDelete: () => onDeleteSkinSprite(state, name, spriteName),
            })
        })
    })
}

async function onNewSkinSprite({ project, isExplorerOpened }: UseStateReturn, name: string) {
    const skin = project.value.skins.get(name)
    if (!skin) throw 'Skin not found'

    const spriteName = await show(ModalTextInput, {
        icon: markRaw(IconPlus),
        title: 'New Skin Sprite',
        defaultValue: '',
        placeholder: '',
        validator: (value) => !skin.data.sprites.some(({ name }) => name === value),
    })
    if (!spriteName) return

    const newSkin = clone(skin)
    newSkin.data.sprites.push(newSkinSprite(spriteName))

    const skins = new Map(project.value.skins)
    skins.set(name, newSkin)

    push({
        ...project.value,
        view: ['skins', name, 'sprites', spriteName],
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

async function onDeleteSkinSprite({ project }: UseStateReturn, name: string, spriteName: string) {
    const skin = project.value.skins.get(name)
    if (!skin) throw 'Skin not found'

    const newSkin = clone(skin)
    newSkin.data.sprites = newSkin.data.sprites.filter(({ name }) => name !== spriteName)

    const skins = new Map(project.value.skins)
    skins.set(name, newSkin)

    push({
        ...project.value,
        view: [],
        skins,
    })
}

async function onRenameSkinSprite(
    { project, view }: UseStateReturn,
    name: string,
    spriteName: string,
) {
    const skin = project.value.skins.get(name)
    if (!skin) throw 'Skin not found'

    const sprite = skin.data.sprites.find(({ name }) => name === spriteName)
    if (!sprite) throw 'Skin Sprite not found'

    const newName = await show(ModalTextInput, {
        icon: markRaw(IconPlus),
        title: 'Rename Skin Sprite',
        defaultValue: spriteName,
        placeholder: '',
        validator: (value) => !skin.data.sprites.some(({ name }) => name === value),
    })
    if (!newName) return

    const newSprite = clone(sprite)
    newSprite.name = newName

    const newSkin = clone(skin)
    newSkin.data.sprites = newSkin.data.sprites.map((sprite) =>
        sprite.name === spriteName ? newSprite : sprite,
    )

    const skins = new Map(project.value.skins)
    skins.set(name, newSkin)

    push({
        ...project.value,
        view:
            view.value[0] === 'skins' &&
            view.value[1] === name &&
            view.value[2] === 'sprites' &&
            view.value[3] === spriteName
                ? ['skins', name, 'sprites', newName, ...view.value.slice(4)]
                : view.value,
        skins,
    })
}
