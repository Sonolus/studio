<script setup lang="ts">
import { watchEffect } from 'vue'
import { isOpened, open, toggle, toKey, useExplorer } from '../composables/explorer'
import { useState } from '../composables/state'
import IconAngleDown from '../icons/angle-down-solid.svg?component'
import IconAngleRight from '../icons/angle-right-solid.svg?component'
import IconClone from '../icons/clone-solid.svg?component'
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
        path.length === view.value.length && path.every((part, index) => part === view.value[index])
    )
}

function onClick(item: { path: string[] }) {
    if (resolveViewInfo(project.value, item.path) && !isPathCurrentView(item.path)) {
        view.value = item.path
        isExplorerOpened.value = false
        return
    }
    toggle(item.path)
}
</script>

<template>
    <div
        class="scrollbar fixed bottom-0 left-0 top-8 z-10 w-full -translate-x-full overflow-y-auto bg-sonolus-main text-sm opacity-0 transition-all duration-200 sm:w-60 sm:translate-x-0 sm:opacity-100 md:w-80 lg:w-100"
        :class="{
            'translate-x-0 opacity-100': isExplorerOpened,
        }"
    >
        <button
            v-for="item in tree"
            :key="toKey(item.path)"
            class="transparent-clickable group flex h-8 w-full items-center"
            :class="{
                'bg-sonolus-ui-button-normal': isPathCurrentView(item.path),
            }"
            @click="onClick(item)"
        >
            <button
                class="h-full flex-none pr-2"
                :class="{
                    'pl-2': item.level === 0,
                    'pl-4': item.level === 1,
                    'pl-8': item.level === 2,
                    'pl-12': item.level === 3,
                    'pl-16': item.level === 4,
                    'pl-20': item.level === 5,
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
                class="icon flex-none"
                :src="item.icon"
                :fallback="item.fallback || IconFile"
                fill
            />
            <component :is="item.icon || item.fallback" v-else class="icon flex-none" />
            <div class="ml-2 flex-1 truncate text-left">
                {{ item.title }}
            </div>
            <button
                v-if="item.onNew"
                class="h-full flex-none px-2 transition-opacity duration-200 group-hover:opacity-100 sm:opacity-0"
                @click.stop="item.onNew?.()"
            >
                <IconPlus class="icon" />
            </button>
            <button
                v-if="item.onClone"
                class="h-full flex-none px-2 transition-opacity duration-200 group-hover:opacity-100 sm:opacity-0"
                @click.stop="item.onClone?.()"
            >
                <IconClone class="icon" />
            </button>
            <button
                v-if="item.onRename"
                class="h-full flex-none px-2 transition-opacity duration-200 group-hover:opacity-100 sm:opacity-0"
                @click.stop="item.onRename?.()"
            >
                <IconEdit class="icon" />
            </button>
            <button
                class="h-full flex-none px-2 transition-opacity duration-200 group-hover:opacity-100 sm:opacity-0"
                @click.stop="item.onDelete()"
            >
                <IconTrash class="icon" />
            </button>
        </button>
    </div>
</template>
