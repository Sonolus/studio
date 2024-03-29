<script setup lang="ts">
import {
    useDevicePixelRatio,
    useLocalStorage,
    useMouseInElement,
    useMousePressed,
} from '@vueuse/core'
import { SkinDataExpression } from 'sonolus-core'
import { computed, ref, watch, watchEffect, watchPostEffect } from 'vue'
import { inverseBilinear } from '../../../core/bilinear-interpolation'
import { sample } from '../../../core/sampling'
import { Skin } from '../../../core/skin'
import { getImageBuffer, getImageInfo } from '../../../core/utils'
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
const { elementX, elementY, elementWidth, elementHeight } = useMouseInElement(elTop)
const { pressed } = useMousePressed({ target: elTop })
const { pixelRatio } = useDevicePixelRatio()

const ctxBack = computed(() => elBack.value?.getContext('2d'))
const ctxTop = computed(() => elTop.value?.getContext('2d'))
const position = computed<Point>(() => [
    (elementX.value * 2) / elementWidth.value - 1,
    1 - (elementY.value * 2) / elementHeight.value,
])
const canvasWidth = computed(() => elementWidth.value * pixelRatio.value)
const canvasHeight = computed(() => elementHeight.value * pixelRatio.value)

type Point = [number, number]
type Rect = [Point, Point, Point, Point]

const rect = ref<Rect>([
    [-0.5, -0.5],
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.5, -0.5],
])

const rectTransformed = computed<Rect>(() => {
    const { x1, x2, x3, x4, y1, y2, y3, y4 } = props.sprite.transform
    return [
        [t(x1), t(y1)],
        [t(x2), t(y2)],
        [t(x3), t(y3)],
        [t(x4), t(y4)],
    ]

    function t(expression: SkinDataExpression) {
        const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = rect.value
        return (
            x1 * (expression.x1 || 0) +
            x2 * (expression.x2 || 0) +
            x3 * (expression.x3 || 0) +
            x4 * (expression.x4 || 0) +
            y1 * (expression.y1 || 0) +
            y2 * (expression.y2 || 0) +
            y3 * (expression.y3 || 0) +
            y4 * (expression.y4 || 0)
        )
    }
})

const imageInfo = ref<{
    img: HTMLImageElement
    width: number
    height: number
}>()

watchEffect(async () => {
    imageInfo.value = undefined

    try {
        imageInfo.value = await getImageInfo(props.sprite.texture)
    } catch (error) {
        imageInfo.value = undefined
    }
})

const imageBuffer = computed(() => {
    if (!imageInfo.value) return
    if (!elBuffer.value) return

    return getImageBuffer(imageInfo.value, elBuffer.value)
})

const draggingIndex = ref<number>()
const hoverIndex = computed(() => {
    const [tx, ty] = position.value

    const distances = rect.value
        .map(([x, y], i) => [i, Math.hypot(tx - x, ty - y)])
        .sort(([, a], [, b]) => a - b)

    if (distances[0][1] > 20 / elementWidth.value) return

    return distances[0][0]
})

watch(pressed, (value) => {
    if (!value) {
        draggingIndex.value = undefined
        return
    }

    draggingIndex.value = hoverIndex.value
})

watchEffect(() => {
    if (draggingIndex.value === undefined) return

    rect.value[draggingIndex.value] = position.value
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
