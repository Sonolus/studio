<script setup lang="ts">
import type { Component } from 'vue'
import { computed, markRaw, watch } from 'vue'
import { useState } from '../composables/state'
import { Project } from '../core/project'
import ViewBackground from './views/ViewBackground.vue'
import ViewDefault from './views/ViewDefault.vue'

const { project, clearUpdater, view } = useState()

watch(view, () => {
    clearUpdater()
    window.scrollTo({ top: 0 })
})

const viewInfo = computed(() => resolveViewInfo(project.value, view.value))
</script>

<script lang="ts">
export function resolveViewInfo(project: Project, view: string[]) {
    if (view.length < 2) return

    let component: Component
    switch (view[0]) {
        case 'backgrounds':
            component = ViewBackground
            break
        default:
            return
    }
    component = markRaw(component)

    const data = project[view[0]].get(view[1])
    if (!data) return

    return { component, data }
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
        <div :key="view.join('/')" class="sm:ml-48 md:ml-64 lg:ml-80">
            <div class="max-w-3xl px-6 pb-6 mx-auto">
                <component
                    :is="viewInfo.component"
                    v-if="viewInfo"
                    :data="viewInfo.data"
                />
                <ViewDefault v-else />
            </div>
        </div>
    </Transition>
</template>
