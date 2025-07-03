<script setup lang="ts">
import { saveAs } from 'file-saver'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { show, useModal } from '../composables/modal'
import { push, redo, replace, undo, useState } from '../composables/state'
import { newProject } from '../core/project'
import IconList from '../icons/list-solid.svg?component'
import ModalConfirmation from './modals/ModalConfirmation.vue'
import ModalPackProject from './modals/ModalPackProject.vue'
import ModalUnpackPackage from './modals/ModalUnpackPackage.vue'

const { project, canUndo, canRedo, isModified, isExplorerOpened } = useState()
const { modal } = useModal()

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
                enabled: true,
                key: 'o',
                command: onOpenProject,
            },
            {
                title: 'Import',
                enabled: true,
                key: 'i',
                command: onImportProject,
            },
            null,
            {
                title: 'Save',
                enabled: true,
                key: 's',
                command: onSaveProject,
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
    if (isModified.value) {
        const result = await show(ModalConfirmation, {
            message: 'Creating a new project will cause current project to be closed. Continue?',
        })
        if (!result) return
    }

    replace(newProject())
}

const el = ref<HTMLInputElement>()
const onFileSelected = ref<(file: File) => void>()

function onFileInput() {
    if (!el.value) return

    const file = el.value.files?.[0]
    if (!file) return

    el.value.value = ''

    onFileSelected.value?.(file)
}

function selectFile(callback: (file: File) => void) {
    if (!el.value) return

    onFileSelected.value = callback
    el.value.click()
}

async function onOpenProject() {
    if (isModified.value) {
        const result = await show(ModalConfirmation, {
            message: 'Opening a project will cause current project to be closed. Continue?',
        })
        if (!result) return
    }

    selectFile(async (file) => {
        const selectedProject = await show(ModalUnpackPackage, file)
        if (!selectedProject) return

        replace(selectedProject)
    })
}

async function onImportProject() {
    selectFile(async (file) => {
        const selectedProject = await show(ModalUnpackPackage, file)
        if (!selectedProject) return

        const skins = await merge(
            project.value.skins,
            selectedProject.skins,
            (name) => `Skin "${name}" already exists. Overwrite?`,
        )
        const backgrounds = await merge(
            project.value.backgrounds,
            selectedProject.backgrounds,
            (name) => `Background "${name}" already exists. Overwrite?`,
        )
        const effects = await merge(
            project.value.effects,
            selectedProject.effects,
            (name) => `SFX "${name}" already exists. Overwrite?`,
        )
        const particles = await merge(
            project.value.particles,
            selectedProject.particles,
            (name) => `Particle "${name}" already exists. Overwrite?`,
        )

        push({
            view: project.value.view,
            title: project.value.title,
            description: project.value.description,
            banner: project.value.banner,
            skins,
            backgrounds,
            effects,
            particles,
        })

        async function merge<T>(
            source: Map<string, T>,
            target: Map<string, T>,
            message: (name: string) => string,
        ) {
            const output = new Map(source)

            for (const [name, item] of target) {
                if (output.has(name)) {
                    const result = await show(ModalConfirmation, {
                        message: message(name),
                    })
                    if (!result) continue
                }

                output.set(name, item)
            }

            return output
        }
    })
}

async function onSaveProject() {
    const result = await show(ModalPackProject, project.value)
    if (!result) return

    saveAs(result, 'project.scp')
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

onMounted(() => document.addEventListener('keydown', onKeyDown, { passive: false }))
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
        class="fixed top-0 z-40 flex h-8 w-full bg-sonolus-ui-surface text-sm"
        @click.self="close()"
    >
        <button
            class="transparent-clickable h-full flex-none px-2 sm:hidden"
            @click="toggleExplorer()"
        >
            <IconList class="icon" />
        </button>
        <button
            v-for="(menu, i) in menus"
            :key="i"
            class="transparent-clickable h-full flex-none px-3"
            :class="{ 'bg-sonolus-ui-button-highlighted': openedIndex === i }"
            @click.self="open(i)"
            @mouseover.self="switchTo(i)"
        >
            {{ menu.title }}
            <div
                v-if="openedIndex === i"
                class="absolute top-8 -ml-3 flex min-w-[8rem] cursor-default flex-col bg-sonolus-ui-surface py-1 sm:min-w-[12rem]"
            >
                <template v-for="(item, j) in menu.items" :key="j">
                    <button
                        v-if="item"
                        class="transparent-clickable flex w-full flex-none items-center px-3 py-1 text-left"
                        :disabled="!item.enabled"
                        @click="onClick(item)"
                    >
                        <div class="flex-grow">{{ item.title }}</div>
                        <div class="ml-8 hidden flex-shrink-0 text-xs sm:block">
                            Ctrl + {{ item.key.toUpperCase() }}
                        </div>
                    </button>
                    <hr v-else class="my-1 w-full flex-none border-sonolus-ui-text-disabled" />
                </template>
            </div>
        </button>
    </div>
    <div class="h-8" />

    <div v-if="openedIndex !== undefined" class="fixed z-30 h-full w-full" @click="close()" />

    <input ref="el" class="hidden" type="file" @input="onFileInput()" />
</template>
