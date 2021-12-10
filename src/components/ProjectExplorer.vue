<script setup lang="ts">
import { watchEffect } from 'vue'
import {
    isOpened,
    open,
    toggle,
    toKey,
    useExplorer,
} from '../composables/explorer'
import { useState } from '../composables/state'
import IconAngleDown from '../icons/angle-down-solid.svg?component'
import IconAngleRight from '../icons/angle-right-solid.svg?component'
import IconEdit from '../icons/edit-solid.svg?component'
import IconFile from '../icons/file-solid.svg?component'
import IconPlus from '../icons/plus-solid.svg?component'
import IconTrash from '../icons/trash-alt-solid.svg?component'
import MyImageIcon from './ui/MyImageIcon.vue'
import { resolveViewInfo } from './ViewManager.vue'

const { project, view, isExplorerOpened } = useState()
const { tree } = useExplorer()

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

function onClick(item: { path: string[] }) {
    if (
        resolveViewInfo(project.value, item.path) &&
        !isPathCurrentView(item.path)
    ) {
        view.value = item.path
        isExplorerOpened.value = false
        return
    }
    toggle(item.path)
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
                @click.stop="toggle(item.path)"
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
                :fallback="item.fallback || IconFile"
                fill
            />
            <component
                :is="item.icon || item.fallback"
                v-else
                class="flex-none icon"
            />
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
                v-if="item.onRename"
                class="
                    flex-none
                    h-full
                    px-2
                    transition-opacity
                    duration-200
                    sm:opacity-0
                    group-hover:opacity-100
                "
                @click.stop="item.onRename?.()"
            >
                <IconEdit class="icon" />
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
