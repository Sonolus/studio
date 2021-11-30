<script setup lang="ts">
import {
    useDevicePixelRatio,
    useLocalStorage,
    useMouseInElement,
    useMousePressed,
} from '@vueuse/core'
import { computed, ref, watch, watchEffect } from 'vue'
import { Skin } from '../../../core/skin'
import MyColorInput from '../../ui/MyColorInput.vue'
import MyField from '../../ui/MyField.vue'

defineProps<{
    data: Skin['data']['sprites'][number]
}>()

const backgroundColor = useLocalStorage(
    'preview.skinSprite.backgroundColor',
    '#000'
)

const el = ref<HTMLCanvasElement>()
const { elementX, elementY, elementWidth, elementHeight } =
    useMouseInElement(el)
const { pressed } = useMousePressed({ target: el })
const { pixelRatio } = useDevicePixelRatio()

const context = computed(() => el.value?.getContext('2d'))
const position = computed<Point>(() => [
    (elementX.value * 2) / elementWidth.value - 1,
    1 - (elementY.value * 2) / elementHeight.value,
])
const canvasWidth = computed(() => elementWidth.value * pixelRatio.value)
const canvasHeight = computed(() => elementHeight.value * pixelRatio.value)

type Point = [number, number]

const rect = ref<[Point, Point, Point, Point]>([
    [-0.5, -0.5],
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.5, -0.5],
])

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

watchEffect(
    () => {
        const ctx = context.value
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.125)'
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
            if (draggingIndex.value === index)
                return 'rgba(255, 255, 255, 0.0625)'
            if (draggingIndex.value === undefined && hoverIndex.value === index)
                return 'rgba(255, 255, 255, 0.25)'

            return 'rgba(255, 255, 255, 0.125)'
        }
    },
    { flush: 'post' }
)
</script>

<template>
    <MyField title="Background Color">
        <MyColorInput
            v-model="backgroundColor"
            default-value="#000"
            placeholder="Enter preview background color..."
        />
    </MyField>

    <div class="max-w-sm mx-auto my-4 border-4 border-sonolus-ui-text-normal">
        <div class="relative h-0 pt-[100%] overflow-hidden">
            <canvas
                ref="el"
                class="absolute top-0 left-0 w-full h-full select-none"
                :style="{ backgroundColor, touchAction: 'none' }"
                :width="canvasWidth"
                :height="canvasHeight"
            />
        </div>
    </div>
</template>
