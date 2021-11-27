<script setup lang="ts">
import { computed, markRaw, watch } from 'vue'
import { useState } from '../composables/state'
import { hasEffectClip } from '../core/effect'
import { Project } from '../core/project'
import ViewBackground from './views/ViewBackground.vue'
import ViewDefault from './views/ViewDefault.vue'
import ViewEffect from './views/ViewEffect.vue'
import ViewEffectClip from './views/ViewEffectClip.vue'

const { project, clearUpdater, view } = useState()

watch(view, () => {
    clearUpdater()
    window.scrollTo({ top: 0 })
})

const viewInfo = computed(() => resolveViewInfo(project.value, view.value))
</script>

<script lang="ts">
export function resolveViewInfo(project: Project, view: string[]) {
    switch (view[0]) {
        case 'backgrounds': {
            const data = project[view[0]].get(view[1])
            if (!data) return

            return { component: markRaw(ViewBackground), data }
        }
        case 'effects': {
            const data = project[view[0]].get(view[1])
            if (!data) return

            switch (view.length) {
                case 2:
                    return { component: markRaw(ViewEffect), data }
                case 4:
                    if (!hasEffectClip(data, +view[3])) return
                    return { component: markRaw(ViewEffectClip), data }
                default:
                    return
            }
        }
    }
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
