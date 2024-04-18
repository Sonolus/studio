<script setup lang="ts">
import { computedAsync, useLocalStorage, useNow } from '@vueuse/core'
import { computed, ref, watchPostEffect } from 'vue'
import { useCanvas } from '../../../composables/canvas'
import { Ease, easings } from '../../../core/ease'
import { execute } from '../../../core/expression'
import { Particle } from '../../../core/particle'
import { ImageInfo, Rect, getImageInfo, lerp, lerpPoint, unlerp } from '../../../core/utils'
import IconRotate from '../../../icons/rotate.svg?component'
import MyButton from '../../ui/MyButton.vue'
import MyColorInput from '../../ui/MyColorInput.vue'
import MyField from '../../ui/MyField.vue'
import MyNumberInput from '../../ui/MyNumberInput.vue'
import MyToggle from '../../ui/MyToggle.vue'

const props = defineProps<{
    sprites: Particle['data']['sprites']
    effect: Particle['data']['effects'][number]
}>()

const backgroundColor = useLocalStorage('preview.particleEffect.backgroundColor', '#000')
const duration = useLocalStorage('preview.particleEffect.duration', 1)
const loop = useLocalStorage('preview.particleEffect.loop', false)

const now = useNow()
const progress = computed(() => (now.value.valueOf() / 1000 / duration.value) % 1)

const elBack = ref<HTMLCanvasElement>()
const elTop = ref<HTMLCanvasElement>()
const { rect, canvasWidth, canvasHeight, draggingIndex, hoverIndex } = useCanvas(elTop)

const ctxBack = computed(() => elBack.value?.getContext('2d'))
const ctxTop = computed(() => elTop.value?.getContext('2d'))

const randomize = ref(0)
const randoms = computed(
    () => (
        randomize.value,
        [...Array(props.effect.groups.reduce((sum, group) => sum + group.count, 1)).keys()].map(
            random,
        )
    ),
)

function random() {
    return Object.fromEntries(
        [...Array(8).keys()].flatMap((i) => {
            const value = Math.random()
            return [
                [`r${i + 1}`, value],
                [`sinr${i + 1}`, Math.sin(2 * Math.PI * value)],
                [`cosr${i + 1}`, Math.cos(2 * Math.PI * value)],
            ]
        }),
    ) as Record<`${'r' | 'sinr' | 'cosr'}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`, number>
}

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
    const states: {
        texture: OffscreenCanvas
        start: number
        end: number
        x: { from: number; to: number; ease: Ease }
        y: { from: number; to: number; ease: Ease }
        w: { from: number; to: number; ease: Ease }
        h: { from: number; to: number; ease: Ease }
        r: { from: number; to: number; ease: Ease }
        a: { from: number; to: number; ease: Ease }
    }[] = []

    let index = 0
    for (const group of props.effect.groups) {
        for (let i = 0; i < group.count; i++) {
            index++
            const values = { c: 1, ...randoms.value[index] }

            for (const { spriteId, color, start, duration, x, y, w, h, r, a } of group.particles) {
                const imageInfo = imageInfos.value[spriteId]
                if (!imageInfo) continue

                const texture = new OffscreenCanvas(imageInfo.width, imageInfo.height)

                const ctx = texture.getContext('2d')
                if (!ctx) continue

                ctx.fillStyle = color
                ctx.fillRect(0, 0, imageInfo.width, imageInfo.height)

                ctx.globalCompositeOperation = 'destination-in'
                ctx.drawImage(imageInfo.img, 0, 0)

                ctx.globalCompositeOperation = 'multiply'
                ctx.drawImage(imageInfo.img, 0, 0)

                states.push({
                    texture,
                    start,
                    end: start + duration,
                    x: {
                        from: execute(x.from, values),
                        to: execute(x.to, values),
                        ease: x.ease,
                    },
                    y: {
                        from: execute(y.from, values),
                        to: execute(y.to, values),
                        ease: y.ease,
                    },
                    w: {
                        from: execute(w.from, values),
                        to: execute(w.to, values),
                        ease: w.ease,
                    },
                    h: {
                        from: execute(h.from, values),
                        to: execute(h.to, values),
                        ease: h.ease,
                    },
                    r: {
                        from: execute(r.from, values),
                        to: execute(r.to, values),
                        ease: r.ease,
                    },
                    a: {
                        from: execute(a.from, values),
                        to: execute(a.to, values),
                        ease: a.ease,
                    },
                })
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
        let t = progress.value
        if (loop.value && t < state.start) t++
        if (t < state.start || t > state.end) continue

        const p = unlerp(state.start, state.end, t)

        const x = execute(state.x, p)
        const y = execute(state.y, p)
        const w = execute(state.w, p)
        const h = execute(state.h, p)
        const r = execute(state.r, p)
        const a = execute(state.a, p)

        const cosr = Math.cos(r)
        const sinr = Math.sin(r)

        const rect: Rect = [
            getPoint(x, y, w, h, cosr, sinr, 0),
            getPoint(x, y, w, h, cosr, sinr, 1),
            getPoint(x, y, w, h, cosr, sinr, 2),
            getPoint(x, y, w, h, cosr, sinr, 3),
        ]

        ctx.globalAlpha = a

        ctx.save()

        ctx.transform(
            rect[3][0] - rect[0][0],
            rect[3][1] - rect[0][1],
            rect[0][0] - rect[1][0],
            rect[0][1] - rect[1][1],
            rect[1][0],
            rect[1][1],
        )

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, 1)
        ctx.lineTo(1, 1)
        ctx.lineTo(0, 0)
        ctx.closePath()

        ctx.clip()
        ctx.drawImage(state.texture, 0, 0, 1, 1)

        ctx.restore()

        ctx.save()

        ctx.transform(
            rect[2][0] - rect[1][0],
            rect[2][1] - rect[1][1],
            rect[3][0] - rect[2][0],
            rect[3][1] - rect[2][1],
            rect[1][0],
            rect[1][1],
        )

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(1, 0)
        ctx.lineTo(1, 1)
        ctx.lineTo(0, 0)
        ctx.closePath()

        ctx.clip()
        ctx.drawImage(state.texture, 0, 0, 1, 1)

        ctx.restore()
    }

    function execute({ from, to, ease }: { from: number; to: number; ease: Ease }, p: number) {
        return lerp(from, to, easings[ease](p))
    }

    function getPoint(
        x: number,
        y: number,
        w: number,
        h: number,
        cosr: number,
        sinr: number,
        n: number,
    ) {
        const sx = (n === 0 || n === 1 ? -1 : 1) * w
        const sy = (n === 0 || n === 3 ? -1 : 1) * h

        const dx = sx * cosr - sy * sinr
        const dy = sy * cosr + sx * sinr

        const px = (x + dx + 1) / 2
        const py = (y + dy + 1) / 2

        const b = lerpPoint(rectTransformed.value[0], rectTransformed.value[3], px)
        const t = lerpPoint(rectTransformed.value[1], rectTransformed.value[2], px)
        return lerpPoint(b, t, py)
    }
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
    <MyField title="Duration">
        <MyNumberInput v-model="duration" placeholder="Enter duration..." validate />
    </MyField>
    <MyField title="Loop">
        <MyToggle v-model="loop" :default-value="true" />
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

    <MyButton class="mx-auto mt-4" :icon="IconRotate" text="Randomize" @click="randomize++" />
</template>
