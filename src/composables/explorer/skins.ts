import { SkinSpriteName } from '@sonolus/core'
import { markRaw } from 'vue'
import { type ExplorerItem, isOpened, onClone, onDelete, onDeleteAll, onNew, onRename } from '.'
import ModalName from '../../components/modals/ModalName.vue'
import { formatSkinSpriteName, newSkin, newSkinSprite } from '../../core/skin'
import { clone } from '../../core/utils'
import IconClone from '../../icons/clone-solid.svg?component'
import IconDot from '../../icons/dot-circle-regular.svg?component'
import IconEdit from '../../icons/edit-solid.svg?component'
import IconFileImage from '../../icons/file-image-solid.svg?component'
import IconFolder from '../../icons/folder-solid.svg?component'
import IconPlus from '../../icons/plus-solid.svg?component'
import { show } from '../modal'
import { type UseStateReturn, push } from '../state'

export function addSkinItems(state: UseStateReturn, items: ExplorerItem[]) {
    items.push({
        level: 0,
        path: ['skins'],
        hasChildren: true,
        icon: IconDot,
        title: `Skins (${state.project.value.skins.size})`,
        onNew: () => {
            void onNew(state, 'skins', 'New Skin', 'Enter skin name...', newSkin())
        },
        onDelete: () => {
            onDeleteAll(state, 'skins')
        },
    })

    if (!isOpened(['skins'])) return

    for (const [name, skin] of state.project.value.skins) {
        items.push({
            level: 1,
            path: ['skins', name],
            hasChildren: true,
            icon: skin.thumbnail,
            title: name,
            onRename: () => {
                void onRename(state, 'skins', 'Rename Skin', 'Enter new skin name...', name)
            },
            onClone: () => {
                void onClone(state, 'skins', 'Clone Skin', 'Enter new skin name...', name)
            },
            onDelete: () => {
                onDelete(state, 'skins', name)
            },
        })

        if (!isOpened(['skins', name])) continue

        items.push({
            level: 2,
            path: ['skins', name, 'sprites'],
            hasChildren: true,
            icon: IconFolder,
            title: `Sprites (${skin.data.sprites.length})`,
            onNew: () => {
                void onNewSkinSprite(state, name)
            },
            onDelete: () => {
                onDeleteSkinSprites(state, name)
            },
        })

        if (!isOpened(['skins', name, 'sprites'])) continue

        for (const { name: spriteName, texture } of skin.data.sprites) {
            items.push({
                level: 3,
                path: ['skins', name, 'sprites', spriteName],
                hasChildren: false,
                icon: texture,
                fallback: IconFileImage,
                title: formatSkinSpriteName(spriteName),
                onRename: () => {
                    void onRenameSkinSprite(state, name, spriteName)
                },
                onClone: () => {
                    void onCloneSkinSprite(state, name, spriteName)
                },
                onDelete: () => {
                    onDeleteSkinSprite(state, name, spriteName)
                },
            })
        }
    }
}

async function onNewSkinSprite({ project, isExplorerOpened }: UseStateReturn, name: string) {
    const skin = project.value.skins.get(name)
    if (!skin) throw new Error('Skin not found')

    const spriteName = await show(ModalName, {
        icon: markRaw(IconPlus),
        title: 'New Skin Sprite',
        names: SkinSpriteName,
        defaultValue: SkinSpriteName.NoteHeadNeutral,
        validator: (value) => !!value && !skin.data.sprites.some(({ name }) => name === value),
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

function onDeleteSkinSprites({ project }: UseStateReturn, name: string) {
    const skin = project.value.skins.get(name)
    if (!skin) throw new Error('Skin not found')
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

function onDeleteSkinSprite({ project }: UseStateReturn, name: string, spriteName: string) {
    const skin = project.value.skins.get(name)
    if (!skin) throw new Error('Skin not found')

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
    if (!skin) throw new Error('Skin not found')

    const sprite = skin.data.sprites.find(({ name }) => name === spriteName)
    if (!sprite) throw new Error('Skin Sprite not found')

    const newName = await show(ModalName, {
        icon: markRaw(IconEdit),
        title: 'Rename Skin Sprite',
        names: SkinSpriteName,
        defaultValue: spriteName,
        validator: (value) => !!value && !skin.data.sprites.some(({ name }) => name === value),
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
async function onCloneSkinSprite(
    { project, view }: UseStateReturn,
    name: string,
    spriteName: string,
) {
    const skin = project.value.skins.get(name)
    if (!skin) throw new Error('Skin not found')

    const sprite = skin.data.sprites.find(({ name }) => name === spriteName)
    if (!sprite) throw new Error('Skin Sprite not found')

    const newName = await show(ModalName, {
        icon: markRaw(IconClone),
        title: 'Clone Skin Sprite',
        names: SkinSpriteName,
        defaultValue: spriteName,
        validator: (value) => !!value && !skin.data.sprites.some(({ name }) => name === value),
    })
    if (!newName) return

    const newSprite = clone(sprite)
    newSprite.name = newName

    const newSkin = clone(skin)
    newSkin.data.sprites.push(newSprite)

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
