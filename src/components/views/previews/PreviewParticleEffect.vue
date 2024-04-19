<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import { computed, watchPostEffect } from 'vue'
import { useParticlePreview } from '../../../composables/particle-preview'
import { execute } from '../../../core/expression'
import { Particle } from '../../../core/particle'
import { renderParticle } from '../../../core/particle-renderer'
import { ParticleState, getParticleState } from '../../../core/particle-state'
import { getPropertyExpressionRandom } from '../../../core/property-expression'
import { ImageInfo, Rect, getImageInfo } from '../../../core/utils'
import ParticlePreview from './ParticlePreview.vue'

const props = defineProps<{
    sprites: Particle['data']['sprites']
    effect: Particle['data']['effects'][number]
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
    () => (
        randomize.value,
        [...Array(props.effect.groups.reduce((sum, group) => sum + group.count, 1)).keys()].map(
            getPropertyExpressionRandom,
        )
    ),
)

const rectTransformed = computed<Rect>(() => {
    const { x1, x2, x3, x4, y1, y2, y3, y4 } = props.effect.transform
    const values = {
        c: 1,
        x1: rect.value[0][0],
        y1: rect.value[0][1],
        x2: rect.value[1][0],
        y2: rect.value[1][1],
        x3: rect.value[2][0],
        y3: rect.value[2][1],
        x4: rect.value[3][0],
        y4: rect.value[3][1],
        ...randoms.value[0],
    }

    return [
        [execute(x1, values), execute(y1, values)],
        [execute(x2, values), execute(y2, values)],
        [execute(x3, values), execute(y3, values)],
        [execute(x4, values), execute(y4, values)],
    ]
})

watchPostEffect(() => {
    const ctx = ctxTop.value
    if (!ctx) return

    const w = canvasWidth.value
    const h = canvasHeight.value
    ctx.setTransform(w / 2, 0, 0, -h / 2, w / 2, h / 2)
    ctx.clearRect(-1, -1, 2, 2)

    drawRect(ctx, rectTransformed.value, 'rgba(255, 255, 255, 0.25)')
    drawRect(ctx, rect.value, 'rgba(255, 255, 255, 0.5)')

    for (let i = 0; i < rect.value.length; i++) {
        const [x, y] = rect.value[i]
        ctx.beginPath()
        ctx.arc(x, y, 0.02, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fillStyle = getFillStyle(i)
        ctx.fill()
    }

    function drawRect(ctx: CanvasRenderingContext2D, rect: Rect, color: string) {
        const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = rect

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.lineTo(x4, y4)
        ctx.lineTo(x1, y1)
        ctx.closePath()
        ctx.lineWidth = 4 / w
        ctx.strokeStyle = color
        ctx.stroke()
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

    for (const spriteId of new Set(
        props.effect.groups.flatMap((group) =>
            group.particles.map((particle) => particle.spriteId),
        ),
    )) {
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

    let index = 0
    for (const group of props.effect.groups) {
        for (let i = 0; i < group.count; i++) {
            index++
            const values = { c: 1, ...randoms.value[index] }

            for (const particle of group.particles) {
                const state = getParticleState(particle, imageInfos.value, values)
                if (!state) continue

                states.push(state)
            }
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
        renderParticle(ctx, state, rectTransformed.value, loop.value, progress.value)
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
