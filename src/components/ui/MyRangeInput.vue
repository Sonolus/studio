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
    <div class="relative flex items-center h-8">
        <div class="flex-shrink-0 w-16 text-center">
            {{
                percentage
                    ? `${(value * 100).toFixed(digits || 0)}%`
                    : value.toFixed(digits || 0)
            }}
        </div>
        <button class="flex-none h-full px-2 clickable" @click="decrease()">
            <IconCaretLeft class="icon" />
        </button>
        <button
            class="flex-grow w-full h-full p-2 clickable"
            tabindex="-1"
            @mousedown="onDown"
            @mousemove="onMove"
        >
            <div class="w-full h-full bg-[rgba(0,0,0,0.25)] p-1">
                <div ref="el" class="w-full h-full">
                    <div
                        class="
                            w-full
                            h-full
                            transition-transform
                            duration-100
                            origin-left
                            transform
                            bg-sonolus-ui-text-normal
                        "
                        :style="`--tw-scale-x: ${(value - min) / (max - min)}`"
                    />
                </div>
            </div>
        </button>
        <button class="flex-none h-full px-2 clickable" @click="increase()">
            <IconCaretRight class="icon" />
        </button>
        <button
            v-if="defaultValue !== undefined"
            class="flex-none h-full px-2 clickable"
            tabindex="-1"
            @click="reset()"
        >
            <IconUndo class="icon" />
        </button>
    </div>
</template>
