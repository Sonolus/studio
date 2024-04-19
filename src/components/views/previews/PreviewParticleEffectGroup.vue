<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import { computed, watchPostEffect } from 'vue'
import { useParticlePreview } from '../../../composables/particle-preview'
import { Particle } from '../../../core/particle'
import { renderParticle } from '../../../core/particle-renderer'
import { ParticleState, getParticleState } from '../../../core/particle-state'
import { getPropertyExpressionRandom } from '../../../core/property-expression'
import { ImageInfo, getImageInfo } from '../../../core/utils'
import ParticlePreview from './ParticlePreview.vue'

const props = defineProps<{
    sprites: Particle['data']['sprites']
    group: Particle['data']['effects'][number]['groups'][number]
}>()

const {
    loop,
    progress,

    elBack,
    elTop,
    rect,
    canvasWidth,
    canvasHeight,
    draggingIndex,
    hoverIndex,

    ctxBack,
    ctxTop,

    randomize,
} = useParticlePreview()

const randoms = computed(
    () => (randomize.value, [...Array(props.group.count).keys()].map(getPropertyExpressionRandom)),
)

watchPostEffect(() => {
    const ctx = ctxTop.value
    if (!ctx) return

    const w = canvasWidth.value
    const h = canvasHeight.value
    ctx.setTransform(w / 2, 0, 0, -h / 2, w / 2, h / 2)
    ctx.clearRect(-1, -1, 2, 2)

    const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = rect.value

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.lineTo(x4, y4)
    ctx.lineTo(x1, y1)
    ctx.closePath()
    ctx.lineWidth = 4 / w
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.stroke()

    for (let i = 0; i < rect.value.length; i++) {
        const [x, y] = rect.value[i]
        ctx.beginPath()
        ctx.arc(x, y, 0.02, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fillStyle = getFillStyle(i)
        ctx.fill()
    }

    function getFillStyle(index: number) {
        if (draggingIndex.value === index) return 'rgba(255, 255, 255, 0.75)'
        if (draggingIndex.value === undefined && hoverIndex.value === index)
            return 'rgba(255, 255, 255, 1)'

        return 'rgba(255, 255, 255, 0.5)'
    }
})

const imageInfos = computedAsync(async () => {
    const result: Record<string, ImageInfo> = {}

    for (const spriteId of new Set(props.group.particles.map((particle) => particle.spriteId))) {
        try {
            result[spriteId] = await getImageInfo(
                props.sprites.find(({ id }) => id === spriteId)!.texture,
            )
        } catch {
            // ignore
        }
    }

    return result
}, {})

const states = computed(() => {
    const states: ParticleState[] = []

    for (let i = 0; i < props.group.count; i++) {
        const values = { c: 1, ...randoms.value[i] }

        for (const particle of props.group.particles) {
            const state = getParticleState(particle, imageInfos.value, values)
            if (!state) continue

            states.push(state)
        }
    }

    return states
})

watchPostEffect(() => {
    const ctx = ctxBack.value
    if (!ctx) return

    const w = canvasWidth.value
    const h = canvasHeight.value
    ctx.setTransform(w / 2, 0, 0, -h / 2, w / 2, h / 2)
    ctx.clearRect(-1, -1, 2, 2)

    for (const state of states.value) {
        renderParticle(ctx, state, rect.value, loop.value, progress.value)
    }
})
</script>

<template>
    <ParticlePreview
        v-model:el-back="elBack"
        v-model:el-top="elTop"
        v-model:randomize="randomize"
        :canvas-width="canvasWidth"
        :canvas-height="canvasHeight"
        :dragging-index="draggingIndex"
    />
</template>
