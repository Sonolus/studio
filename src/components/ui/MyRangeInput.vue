<script setup lang="ts">
import { computed, ref } from 'vue'
import IconCaretLeft from '../../icons/caret-left-solid.svg?component'
import IconCaretRight from '../../icons/caret-right-solid.svg?component'
import IconUndo from '../../icons/undo-alt-solid.svg?component'

const props = defineProps<{
    modelValue: number
    defaultValue?: number
    min: number
    max: number
    step: number
    percentage?: boolean
    digits?: number
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void
}>()

const el = ref<HTMLDivElement>()

const value = computed({
    get: () => props.modelValue,
    set: (value) =>
        emit(
            'update:modelValue',
            Math.max(
                props.min,
                Math.min(
                    props.max,
                    props.min +
                        Math.round((value - props.min) / props.step) *
                            props.step
                )
            )
        ),
})

function increase() {
    value.value += props.step
}

function decrease() {
    value.value -= props.step
}

function onDown(e: MouseEvent) {
    if (e.buttons !== 1 && e.buttons !== 0) return

    set(e)
}

function onMove(e: MouseEvent) {
    if (e.buttons !== 1) return

    set(e)
}

function set(e: MouseEvent) {
    if (!el.value) return

    const rect = el.value.getBoundingClientRect()
    const v = (e.clientX - rect.left) / rect.width
    value.value = v * (props.max - props.min) + props.min
}

function reset() {
    if (props.defaultValue === undefined) return
    value.value = props.defaultValue
}
</script>

<template>
    <div class="relative flex h-8 items-center">
        <div class="w-16 flex-shrink-0 text-center">
            {{
                percentage
                    ? `${(value * 100).toFixed(digits || 0)}%`
                    : value.toFixed(digits || 0)
            }}
        </div>
        <button class="clickable h-full flex-none px-2" @click="decrease()">
            <IconCaretLeft class="icon" />
        </button>
        <button
            class="clickable h-full w-full flex-grow p-2"
            tabindex="-1"
            @mousedown="onDown"
            @mousemove="onMove"
        >
            <div class="h-full w-full bg-[rgba(0,0,0,0.25)] p-1">
                <div ref="el" class="h-full w-full">
                    <div
                        class="h-full w-full origin-left transform bg-sonolus-ui-text-normal transition-transform duration-100"
                        :style="`--tw-scale-x: ${(value - min) / (max - min)}`"
                    />
                </div>
            </div>
        </button>
        <button class="clickable h-full flex-none px-2" @click="increase()">
            <IconCaretRight class="icon" />
        </button>
        <button
            v-if="defaultValue !== undefined"
            class="clickable h-full flex-none px-2"
            tabindex="-1"
            @click="reset()"
        >
            <IconUndo class="icon" />
        </button>
    </div>
</template>
