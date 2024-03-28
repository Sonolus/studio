<script setup lang="ts">
import { computed, markRaw, watch } from 'vue'
import { clearUpdater, useState } from '../composables/state'
import { hasEffectClip } from '../core/effect'
import { Project } from '../core/project'
import { hasSkinSprite } from '../core/skin'
import ViewBackground from './views/ViewBackground.vue'
import ViewDefault from './views/ViewDefault.vue'
import ViewEffect from './views/ViewEffect.vue'
import ViewEffectClip from './views/ViewEffectClip.vue'
import ViewParticle from './views/ViewParticle.vue'
import ViewParticleEffect from './views/ViewParticleEffect.vue'
import ViewParticleEffectGroup from './views/ViewParticleEffectGroup.vue'
import ViewParticleEffectGroupParticle from './views/ViewParticleEffectGroupParticle.vue'
import ViewSkin from './views/ViewSkin.vue'
import ViewSkinSprite from './views/ViewSkinSprite.vue'

const { project, view } = useState()

watch(view, () => {
    clearUpdater()
    window.scrollTo({ top: 0 })
})

const viewInfo = computed(() => resolveViewInfo(project.value, view.value))
</script>

<script lang="ts">
export function resolveViewInfo(project: Project, view: string[]) {
    switch (view[0]) {
        case 'skins': {
            const data = project[view[0]].get(view[1])
            if (!data) return

            switch (view.length) {
                case 2:
                    return { component: markRaw(ViewSkin), data }
                case 4:
                    if (!hasSkinSprite(data, view[3])) return
                    return { component: markRaw(ViewSkinSprite), data }
                default:
                    return
            }
        }
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
                    if (!hasEffectClip(data, view[3])) return
                    return { component: markRaw(ViewEffectClip), data }
                default:
                    return
            }
        }
        case 'particles': {
            const data = project[view[0]].get(view[1])
            if (!data) return

            switch (view.length) {
                case 2:
                    return { component: markRaw(ViewParticle), data }
                case 4:
                    return { component: markRaw(ViewParticleEffect), data }
                case 5:
                    return { component: markRaw(ViewParticleEffectGroup), data }
                case 6:
                    return { component: markRaw(ViewParticleEffectGroupParticle), data }
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
        <div :key="view.join('/')" class="sm:ml-60 md:ml-80 lg:ml-100">
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
