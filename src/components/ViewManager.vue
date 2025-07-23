<script setup lang="ts">
import { computed, watch } from 'vue'
import { type ExplorerItem, useExplorer } from '../composables/explorer'
import { clearUpdater, useState } from '../composables/state'
import { resolveViewInfo } from './ViewManager'
import ViewDefault from './views/ViewDefault.vue'

const { project, view } = useState()
const { tree } = useExplorer()

watch(view, () => {
    clearUpdater()
    window.scrollTo({ top: 0 })
})

const path = computed(() =>
    tree.value
        .filter((item) => item.path.every((part, index) => part === view.value[index]))
        .sort((a, b) => a.path.length - b.path.length),
)

const viewInfo = computed(() => resolveViewInfo(project.value, view.value))

function isPathCurrentView(path: string[]) {
    return (
        path.length === view.value.length && path.every((part, index) => part === view.value[index])
    )
}

function onClick(item: ExplorerItem) {
    if (!resolveViewInfo(project.value, item.path) || isPathCurrentView(item.path)) return

    view.value = item.path
}
</script>

<template>
    <Transition
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        enter-active-class="transition-opacity duration-200"
        leave-from-class="hidden"
        leave-to-class="hidden"
    >
        <div :key="view.join('/')" class="lg:ml-100 sm:ml-60 md:ml-80">
            <nav class="sticky top-8 z-10 bg-sonolus-main p-2 text-sm">
                <template v-for="(item, index) in path" :key="item.path.join('/')">
                    <span v-if="index" class="mx-1 text-sonolus-ui-text-disabled">/</span>
                    <button
                        class="px-1 text-sonolus-ui-text-soften transition-colors duration-200 hover:bg-sonolus-ui-button-highlighted hover:text-sonolus-ui-text-normal active:bg-sonolus-ui-button-pressed"
                        @click="onClick(item)"
                    >
                        {{ item.title }}
                    </button>
                </template>
            </nav>
            <div class="mx-auto max-w-3xl px-6 pb-6">
                <component
                    :is="viewInfo.component"
                    v-if="viewInfo"
                    :data="viewInfo.data as never"
                />
                <ViewDefault v-else />
            </div>
        </div>
    </Transition>
</template>
