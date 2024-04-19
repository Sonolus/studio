import { useDevicePixelRatio, useMouseInElement, useMousePressed } from '@vueuse/core'
import { Ref, computed, ref, watch, watchEffect } from 'vue'
import { Point, Rect } from '../core/utils'

export function useCanvas(target: Ref<HTMLElement | undefined>) {
    const { elementX, elementY, elementWidth, elementHeight } = useMouseInElement(target)
    const { pressed } = useMousePressed({ target })
    const { pixelRatio } = useDevicePixelRatio()

    const position = computed<Point>(() => [
        (elementX.value * 2) / elementWidth.value - 1,
        1 - (elementY.value * 2) / elementHeight.value,
    ])
    const canvasWidth = computed(() => elementWidth.value * pixelRatio.value)
    const canvasHeight = computed(() => elementHeight.value * pixelRatio.value)

    const rect = ref<Rect>([
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

    return {
        rect,
        canvasWidth,
        canvasHeight,
        draggingIndex,
        hoverIndex,
    }
}
