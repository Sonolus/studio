<script setup lang="ts">
import { computedAsync, useLocalStorage } from '@vueuse/core'
import { computed, ref, watchPostEffect } from 'vue'
import { useCanvas } from '../../../composables/canvas'
import { inverseBilinear } from '../../../core/bilinear-interpolation'
import { execute } from '../../../core/expression'
import { sample } from '../../../core/sampling'
import { type Skin } from '../../../core/skin'
import { type Rect, getImageBuffer, getImageInfo } from '../../../core/utils'
import MyColorInput from '../../ui/MyColorInput.vue'
import MyField from '../../ui/MyField.vue'

const props = defineProps<{
    sprite: Skin['data']['sprites'][number]
    interpolation: boolean
}>()

const backgroundColor = useLocalStorage('preview.skinSprite.backgroundColor', '#000')

const elBack = ref<HTMLCanvasElement>()
const elTop = ref<HTMLCanvasElement>()
const elBuffer = ref<HTMLCanvasElement>()
const { rect, canvasWidth, canvasHeight, draggingIndex, hoverIndex } = useCanvas(elTop)

const ctxBack = computed(() => elBack.value?.getContext('2d'))
const ctxTop = computed(() => elTop.value?.getContext('2d'))

const rectTransformed = computed<Rect>(() => {
    const { x1, x2, x3, x4, y1, y2, y3, y4 } = props.sprite.transform
    const values = {
        x1: rect.value[0][0],
        y1: rect.value[0][1],
        x2: rect.value[1][0],
        y2: rect.value[1][1],
        x3: rect.value[2][0],
        y3: rect.value[2][1],
        x4: rect.value[3][0],
        y4: rect.value[3][1],
    }

    return [
        [execute(x1, values), execute(y1, values)],
        [execute(x2, values), execute(y2, values)],
        [execute(x3, values), execute(y3, values)],
        [execute(x4, values), execute(y4, values)],
    ]
})

const imageInfo = computedAsync(() => getImageInfo(props.sprite.texture))

const imageBuffer = computed(() => {
    if (!imageInfo.value) return
    if (!elBuffer.value) return

    return getImageBuffer(imageInfo.value, elBuffer.value)
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

    for (const [i, [x, y]] of rect.value.entries()) {
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

watchPostEffect(() => {
    if (draggingIndex.value !== undefined) return

    const rect = rectTransformed.value
    const w = canvasWidth.value
    const h = canvasHeight.value

    const ctx = ctxBack.value
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)

    if (!imageBuffer.value) return
    const { buffer, width, height } = imageBuffer.value

    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data

    for (let i = 0; i < w; i++) {
        const x = ((i + 0.5) / w) * 2 - 1
        for (let j = 0; j < h; j++) {
            const y = (((j + 0.5) / w) * 2 - 1) * -1

            const [u, v] = inverseBilinear([x, y], rect)
            if (u < 0 || v < 0 || u > 1 || v > 1) continue

            const [r, g, b, a] = sample(buffer, width, height, u, v, props.interpolation)

            const dIndex = (j * w + i) * 4
            data[dIndex + 0] = r
            data[dIndex + 1] = g
            data[dIndex + 2] = b
            data[dIndex + 3] = a
        }
    }

    ctx.putImageData(imageData, 0, 0)
})
</script>

<template>
    <MyField title="Background Color">
        <MyColorInput
            v-model="backgroundColor"
            default-value="#000"
            placeholder="Enter preview background color..."
            validate
        />
    </MyField>

    <div class="mx-auto my-4 max-w-sm border-4 border-sonolus-ui-text-normal">
        <div class="relative h-0 overflow-hidden pt-[100%]" :style="{ backgroundColor }">
            <canvas
                ref="elBack"
                class="absolute left-0 top-0 h-full w-full"
                :class="{ 'opacity-50': draggingIndex !== undefined }"
                :width="canvasWidth"
                :height="canvasHeight"
            />
            <canvas
                ref="elTop"
                class="absolute left-0 top-0 h-full w-full select-none opacity-50 hover:opacity-100"
                :style="{ touchAction: 'none' }"
                :width="canvasWidth"
                :height="canvasHeight"
            />
        </div>
    </div>

    <canvas ref="elBuffer" class="hidden" />
</template>
