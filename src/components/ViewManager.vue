<script setup lang="ts">
import { computed, markRaw, watch } from 'vue'
import { ExplorerItem, useExplorer } from '../composables/explorer'
import { clearUpdater, useState } from '../composables/state'
import { hasEffectClip } from '../core/effect'
import {
    hasParticleEffect,
    hasParticleEffectGroup,
    hasParticleEffectGroupParticle,
    hasParticleSprite,
} from '../core/particle'
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
import ViewParticleSprite from './views/ViewParticleSprite.vue'
import ViewSkin from './views/ViewSkin.vue'
import ViewSkinSprite from './views/ViewSkinSprite.vue'

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
                    if (view[2] === 'sprites') {
                        if (!hasParticleSprite(data, view[3])) return
                        return { component: markRaw(ViewParticleSprite), data }
                    } else {
                        if (!hasParticleEffect(data, view[3])) return
                        return { component: markRaw(ViewParticleEffect), data }
                    }
                case 6:
                    if (!hasParticleEffectGroup(data, view[3], +view[5])) return
                    return { component: markRaw(ViewParticleEffectGroup), data }
                case 8:
                    if (!hasParticleEffectGroupParticle(data, view[3], +view[5], +view[7])) return
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
            <nav class="text-sm p-2 sticky top-8 bg-sonolus-main z-10">
                <template v-for="(item, index) in path" :key="item.path.join('/')">
                    <span v-if="index" class="text-sonolus-ui-text-disabled mx-1">/</span>
                    <button
                        class="text-sonolus-ui-text-soften px-1 transition-colors duration-200 hover:text-sonolus-ui-text-normal hover:bg-sonolus-ui-button-highlighted active:bg-sonolus-ui-button-pressed"
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
