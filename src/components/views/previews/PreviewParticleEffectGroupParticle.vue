<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import { computed, watchPostEffect } from 'vue'
import { useParticlePreview } from '../../../composables/particle-preview'
import { type Particle } from '../../../core/particle'
import { renderParticle } from '../../../core/particle-renderer'
import { getParticleState } from '../../../core/particle-state'
import { getPropertyExpressionRandom } from '../../../core/property-expression'
import { getImageInfo } from '../../../core/utils'
import ParticlePreview from './ParticlePreview.vue'

const props = defineProps<{
    sprites: Particle['data']['sprites']
    particle: Particle['data']['effects'][number]['groups'][number]['particles'][number]
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

const random = computed(() => (randomize.value, { c: 1, ...getPropertyExpressionRandom() }))

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

    for (const [i, [x, y]] of rect.value.entries()) {
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
    try {
        return {
            [props.particle.spriteId]: await getImageInfo(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                props.sprites.find(({ id }) => id === props.particle.spriteId)!.texture,
            ),
        }
    } catch {
        return {}
    }
}, {})

const state = computed(() => getParticleState(props.particle, imageInfos.value, random.value))

watchPostEffect(() => {
    const ctx = ctxBack.value
    if (!ctx) return

    const w = canvasWidth.value
    const h = canvasHeight.value
    ctx.setTransform(w / 2, 0, 0, -h / 2, w / 2, h / 2)
    ctx.clearRect(-1, -1, 2, 2)

    if (!state.value) return

    renderParticle(ctx, state.value, rect.value, loop.value, progress.value)
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
