<script setup lang="ts">
import type { Component } from 'vue'
import { computed, markRaw, reactive, watchEffect } from 'vue'
import { useModals } from '../composables/modal'
import { useState } from '../composables/state'
import { newBackground } from '../core/background'
import { formatEffectClipId, newEffect, newEffectClip } from '../core/effect'
import { ProjectItemTypeOf } from '../core/project'
import { formatSkinSpriteId, newSkin, newSkinSprite } from '../core/skin'
import { clone } from '../core/utils'
import IconAngleDown from '../icons/angle-down-solid.svg?component'
import IconAngleRight from '../icons/angle-right-solid.svg?component'
import IconDot from '../icons/dot-circle-regular.svg?component'
import IconDrum from '../icons/drum-solid.svg?component'
import IconFileAudio from '../icons/file-audio-solid.svg?component'
import IconFile from '../icons/file-solid.svg?component'
import IconFolder from '../icons/folder-solid.svg?component'
import IconImage from '../icons/image-solid.svg?component'
import IconPlus from '../icons/plus-solid.svg?component'
import IconTrash from '../icons/trash-alt-solid.svg?component'
import ModalEffectClipId from './modals/ModalEffectClipId.vue'
import ModalSkinSpriteId from './modals/ModalSkinSpriteId.vue'
import ModalTextInput from './modals/ModalTextInput.vue'
import MyImageIcon from './ui/MyImageIcon.vue'
import { resolveViewInfo } from './ViewManager.vue'

const { project, push, view, isExplorerOpened } = useState()

watchEffect(() => {
    if (!resolveViewInfo(project.value, view.value)) return

    const path: string[] = []
    view.value.forEach((part) => {
        path.push(part)
        open(path)
    })
})

function isPathCurrentView(path: string[]) {
    return (
        path.length === view.value.length &&
        path.every((part, index) => part === view.value[index])
    )
}

const openedPaths = reactive(new Map<string, true>())

function toKey(path: string[]) {
    return path.join('/')
}

function isOpened(path: string[]) {
    const key = path.join('/')
    return openedPaths.has(key)
}

function open(path: string[]) {
    openedPaths.set(toKey(path), true)
}

function close(path: string[]) {
    openedPaths.delete(toKey(path))
}

function toggleOpened(path: string[]) {
    if (isOpened(path)) {
        close(path)
    } else {
        open(path)
    }
}

const tree = computed(() => {
    const items: {
        level: number
        path: string[]
        hasChildren: boolean

        icon: Component | string
        title: string

        onNew?: () => void
        onDelete: () => void
    }[] = []

    items.push({
        level: 0,
        path: ['skins'],
        hasChildren: true,
        icon: IconDot,
        title: 'Skins',
        onNew: () =>
            onNew('skins', 'New Skin', 'Enter skin name...', newSkin()),
        onDelete: () => onDeleteAll('skins'),
    })
    if (isOpened(['skins'])) {
        project.value.skins.forEach((skin, name) => {
            items.push({
                level: 1,
                path: ['skins', name],
                hasChildren: true,
                icon: skin.thumbnail,
                title: name,
                onDelete: () => onDelete('skins', name),
            })

            if (!isOpened(['skins', name])) return
            items.push({
                level: 2,
                path: ['skins', name, 'sprites'],
                hasChildren: true,
                icon: IconFolder,
                title: 'Sprites',
                onNew: () => onNewSkinSprite(name),
                onDelete: () => onDeleteSkinSprites(name),
            })

            if (!isOpened(['skins', name, 'sprites'])) return
            skin.data.sprites.forEach(({ id, texture }) => {
                items.push({
                    level: 3,
                    path: ['skins', name, 'sprites', id.toString()],
                    hasChildren: false,
                    icon: texture,
                    title: formatSkinSpriteId(id),
                    onDelete: () => onDeleteSkinSprite(name, id),
                })
            })
        })
    }

    items.push({
        level: 0,
        path: ['backgrounds'],
        hasChildren: true,
        icon: IconImage,
        title: 'Backgrounds',
        onNew: () =>
            onNew(
                'backgrounds',
                'New Background',
                'Enter background name...',
                newBackground()
            ),
        onDelete: () => onDeleteAll('backgrounds'),
    })
    if (isOpened(['backgrounds'])) {
        project.value.backgrounds.forEach((background, name) => {
            items.push({
                level: 1,
                path: ['backgrounds', name],
                hasChildren: false,
                icon: background.thumbnail,
                title: name,
                onDelete: () => onDelete('backgrounds', name),
            })
        })
    }

    items.push({
        level: 0,
        path: ['effects'],
        hasChildren: true,
        icon: IconDrum,
        title: 'Effects',
        onNew: () =>
            onNew('effects', 'New Effect', 'Enter effect name...', newEffect()),
        onDelete: () => onDeleteAll('effects'),
    })
    if (isOpened(['effects'])) {
        project.value.effects.forEach((effect, name) => {
            items.push({
                level: 1,
                path: ['effects', name],
                hasChildren: true,
                icon: effect.thumbnail,
                title: name,
                onDelete: () => onDelete('effects', name),
            })

            if (!isOpened(['effects', name])) return
            items.push({
                level: 2,
                path: ['effects', name, 'clips'],
                hasChildren: true,
                icon: IconFolder,
                title: 'Clips',
                onNew: () => onNewEffectClip(name),
                onDelete: () => onDeleteEffectClips(name),
            })

            if (!isOpened(['effects', name, 'clips'])) return
            effect.data.clips.forEach(({ id }) => {
                items.push({
                    level: 3,
                    path: ['effects', name, 'clips', id.toString()],
                    hasChildren: false,
                    icon: IconFileAudio,
                    title: formatEffectClipId(id),
                    onDelete: () => onDeleteEffectClip(name, id),
                })
            })
        })
    }

    return items
})

function onClick(item: { path: string[] }) {
    if (resolveViewInfo(project.value, item.path)) {
        view.value = item.path

        isExplorerOpened.value = false
    } else {
        toggleOpened(item.path)
    }
}

const { show } = useModals()

async function onNew<T>(
    type: ProjectItemTypeOf<T>,
    title: string,
    placeholder: string,
    value: T
) {
    const name = (
        await show(ModalTextInput, {
            icon: markRaw(IconPlus),
            title,
            defaultValue: '',
            placeholder,
            validator(name) {
                name = name.trim()
                if (!name.length) return false
                if (project.value[type].has(name)) return false
                return true
            },
        })
    )?.trim()
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

function onDeleteAll<T>(type: ProjectItemTypeOf<T>) {
    if (!project.value[type].size) return

    push({
        ...project.value,
        view: [],
        [type]: new Map(),
    })
}

function onDelete<T>(type: ProjectItemTypeOf<T>, name: string) {
    const items = new Map(project.value[type] as never)
    items.delete(name)

    push({
        ...project.value,
        view: [],
        [type]: items,
    })
}

async function onNewSkinSprite(name: string) {
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

async function onDeleteSkinSprites(name: string) {
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

async function onDeleteSkinSprite(name: string, id: number) {
    const skin = project.value.skins.get(name)
    if (!skin) throw 'Skin not found'

    const newSkin = clone(skin)
    newSkin.data.sprites = newSkin.data.sprites.filter(
        (sprite) => sprite.id !== id
    )

    const skins = new Map(project.value.skins)
    skins.set(name, newSkin)

    push({
        ...project.value,
        view: [],
        skins,
    })
}

async function onNewEffectClip(name: string) {
    const effect = project.value.effects.get(name)
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

    const effects = new Map(project.value.effects)
    effects.set(name, newEffect)

    push({
        ...project.value,
        view: ['effects', name, 'clips', id.toString()],
        effects,
    })

    isExplorerOpened.value = false
}

async function onDeleteEffectClips(name: string) {
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

async function onDeleteEffectClip(name: string, id: number) {
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
</script>

<template>
    <div
        class="
            fixed
            bottom-0
            left-0
            z-10
            w-full
            overflow-y-auto
            text-sm
            transition-all
            duration-200
            -translate-x-full
            opacity-0
            sm:opacity-100
            scrollbar
            sm:w-48
            md:w-64
            lg:w-80
            top-8
            sm:translate-x-0
            bg-sonolus-main
        "
        :class="{
            'translate-x-0 opacity-100': isExplorerOpened,
        }"
    >
        <button
            v-for="item in tree"
            :key="toKey(item.path)"
            class="flex items-center w-full h-8 group transparent-clickable"
            :class="{
                'bg-sonolus-ui-button-normal': isPathCurrentView(item.path),
            }"
            @click="onClick(item)"
        >
            <button
                class="flex-none h-full pr-2"
                :class="{
                    'pl-2': item.level === 0,
                    'pl-4': item.level === 1,
                    'pl-8': item.level === 2,
                    'pl-10': item.level === 3,
                    'pointer-events-none opacity-0': !item.hasChildren,
                }"
                @click.stop="toggleOpened(item.path)"
            >
                <component
                    :is="isOpened(item.path) ? IconAngleDown : IconAngleRight"
                    class="icon"
                />
            </button>
            <MyImageIcon
                v-if="typeof item.icon === 'string'"
                class="flex-none icon"
                :src="item.icon"
                :fallback="IconFile"
                fill
            />
            <component :is="item.icon" v-else class="flex-none icon" />
            <div class="flex-1 ml-2 text-left truncate">
                {{ item.title }}
            </div>
            <button
                v-if="item.onNew"
                class="
                    flex-none
                    h-full
                    px-2
                    transition-opacity
                    duration-200
                    sm:opacity-0
                    group-hover:opacity-100
                "
                @click.stop="item.onNew?.()"
            >
                <IconPlus class="icon" />
            </button>
            <button
                class="
                    flex-none
                    h-full
                    px-2
                    transition-opacity
                    duration-200
                    sm:opacity-0
                    group-hover:opacity-100
                "
                @click.stop="item.onDelete()"
            >
                <IconTrash class="icon" />
            </button>
        </button>
    </div>
</template>
