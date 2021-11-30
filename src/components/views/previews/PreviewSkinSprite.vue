<script setup lang="ts">
import {
    useDevicePixelRatio,
    useElementSize,
    useLocalStorage,
} from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
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
const { width, height } = useElementSize(el, { width: 300, height: 300 })
const { pixelRatio } = useDevicePixelRatio()

const context = computed(() => el.value?.getContext('2d'))
const canvasWidth = computed(() => width.value * pixelRatio.value)
const canvasHeight = computed(() => height.value * pixelRatio.value)

type Point = [number, number]

const rect = ref<[Point, Point, Point, Point]>([
    [-0.5, -0.5],
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.5, -0.5],
])

watchEffect(
    () => {
        const ctx = context.value
        if (!ctx) return

        const w = canvasWidth.value
        const h = canvasHeight.value
        ctx.setTransform(w / 2, 0, 0, h / 2, w / 2, h / 2)

        ctx.lineWidth = 4 / w
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.125)'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.125)'

        const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = rect.value

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.lineTo(x4, y4)
        ctx.lineTo(x1, y1)
        ctx.closePath()
        ctx.stroke()

        for (const [x, y] of rect.value) {
            ctx.beginPath()
            ctx.arc(x, y, 0.02, 0, 2 * Math.PI)
            ctx.closePath()
            ctx.fill()
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

    <div class="my-4 border-4 border-sonolus-ui-text-normal max-w-sm mx-auto">
        <div class="relative h-0 pt-[100%] overflow-hidden">
            <canvas
                ref="el"
                class="absolute top-0 left-0 w-full h-full"
                :style="{ backgroundColor }"
                :width="canvasWidth"
                :height="canvasHeight"
            />
        </div>
    </div>
</template>
