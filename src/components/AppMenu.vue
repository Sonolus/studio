<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useModals } from '../composables/modal'
import { useState } from '../composables/state'
import { newProject } from '../core/project'
import IconList from '../icons/list-solid.svg?component'
import ModalConfirmation from './modals/ModalConfirmation.vue'
import ModalPackProject from './modals/ModalPackProject.vue'

const { replace, canUndo, canRedo, undo, redo, isExplorerOpened } = useState()
const { modal, show } = useModals()

function toggleExplorer() {
    isExplorerOpened.value = !isExplorerOpened.value
    close()
}

const menus = computed(() => [
    {
        title: 'Project',
        items: [
            {
                title: 'New',
                enabled: true,
                key: 'n',
                command: onNewProject,
            },
            null,
            {
                title: 'Open',
                enabled: false,
                key: 'o',
                command: () => console.log('open-project'),
            },
            {
                title: 'Import',
                enabled: false,
                key: 'i',
                command: () => console.log('import-project'),
            },
            null,
            {
                title: 'Save',
                enabled: true,
                key: 's',
                command: () => show(ModalPackProject, null),
            },
        ],
    },
    {
        title: 'Edit',
        items: [
            {
                title: 'Undo',
                enabled: canUndo.value,
                key: 'z',
                command: undo,
            },
            {
                title: 'Redo',
                enabled: canRedo.value,
                key: 'y',
                command: redo,
            },
        ],
    },
])

async function onNewProject() {
    const result = await show(ModalConfirmation, {
        message:
            'Creating a new project will cause current project to be closed. Continue?',
    })
    if (!result) return

    replace(newProject())
}

const openedIndex = ref<number>()

function open(index: number) {
    openedIndex.value = index
}

function switchTo(index: number) {
    if (openedIndex.value === undefined) return

    openedIndex.value = index
}

function close() {
    openedIndex.value = undefined
}

function onClick(item: { command: () => void }) {
    item.command()
    close()
}

onMounted(() =>
    document.addEventListener('keydown', onKeyDown, { passive: false })
)
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))

const hotkeys = computed(() => {
    const output = new Map<string, (() => void) | null>()

    menus.value.forEach((menu) => {
        menu.items.forEach((item) => {
            if (!item) return

            output.set(item.key, item.enabled ? item.command : null)
        })
    })

    return output
})

function onKeyDown(e: KeyboardEvent) {
    if (!e.ctrlKey) return

    const command = hotkeys.value.get(e.key)
    if (command === undefined) return

    e.preventDefault()
    if (modal.value) return

    command?.()
}
</script>

<template>
    <div
        class="fixed top-0 z-50 flex w-full h-8 text-sm bg-sonolus-ui-surface"
        @click.self="close()"
    >
        <button
            class="flex-none h-full px-2 sm:hidden transparent-clickable"
            @click="toggleExplorer()"
        >
            <IconList class="icon" />
        </button>
        <button
            v-for="(menu, i) in menus"
            :key="i"
            class="flex-none h-full px-3 transparent-clickable"
            :class="{ 'bg-sonolus-ui-button-highlighted': openedIndex === i }"
            @click.self="open(i)"
            @mouseover.self="switchTo(i)"
        >
            {{ menu.title }}
            <div
                v-if="openedIndex === i"
                class="
                    cursor-default
                    absolute
                    flex flex-col
                    py-1
                    bg-sonolus-ui-surface
                    -ml-3
                    top-8
                    min-w-[8rem]
                    sm:min-w-[12rem]
                "
            >
                <template v-for="(item, j) in menu.items" :key="j">
                    <button
                        v-if="item"
                        class="
                            flex
                            items-center
                            flex-none
                            w-full
                            px-3
                            py-1
                            text-left
                            transparent-clickable
                        "
                        :disabled="!item.enabled"
                        @click="onClick(item)"
                    >
                        <div class="flex-grow">{{ item.title }}</div>
                        <div class="flex-shrink-0 hidden text-xs sm:block ml-8">
                            Ctrl + {{ item.key.toUpperCase() }}
                        </div>
                    </button>
                    <hr
                        v-else
                        class="
                            flex-none
                            w-full
                            my-1
                            border-sonolus-ui-text-disabled
                        "
                    />
                </template>
            </div>
        </button>
    </div>
    <div class="h-8" />

    <div
        v-if="openedIndex !== undefined"
        class="fixed z-40 w-full h-full"
        @click="close()"
    />
</template>
