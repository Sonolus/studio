import { useLocalStorage, useNow } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useCanvas } from './canvas'

export function useParticlePreviewOptions() {
    const backgroundColor = useLocalStorage('preview.particleEffect.backgroundColor', '#000')
    const duration = useLocalStorage('preview.particleEffect.duration', 1)
    const loop = useLocalStorage('preview.particleEffect.loop', false)

    return {
        backgroundColor,
        duration,
        loop,
    }
}

export function useParticlePreview() {
    const { duration, loop } = useParticlePreviewOptions()

    const now = useNow()
    const progress = computed(() => (now.value.valueOf() / 1000 / duration.value) % 1)

    const elBack = ref<HTMLCanvasElement>()
    const elTop = ref<HTMLCanvasElement>()
    const { rect, canvasWidth, canvasHeight, draggingIndex, hoverIndex } = useCanvas(elTop)

    const ctxBack = computed(() => elBack.value?.getContext('2d'))
    const ctxTop = computed(() => elTop.value?.getContext('2d'))

    const randomize = ref(0)

    return {
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
    }
}
