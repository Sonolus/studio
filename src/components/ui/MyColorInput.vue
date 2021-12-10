<script setup lang="ts">
import { computed, ref } from 'vue'
import { validate } from '../../core/validation'
import IconExclamation from '../../icons/exclamation-circle-solid.svg?component'
import IconPalette from '../../icons/palette-solid.svg?component'
import IconUndo from '../../icons/undo-alt-solid.svg?component'

const props = defineProps<{
    modelValue: string
    defaultValue?: string
    placeholder: string
    alpha?: boolean
    validate?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'enter'): void
    (e: 'escape'): void
}>()

const el = ref<HTMLInputElement>()

const value = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
})

const rgba = computed(() => {
    if (!(props.alpha ? [5, 9] : [4, 7]).includes(props.modelValue.length))
        return
    if (props.modelValue[0] !== '#') return

    const value = props.modelValue.slice(1).toLowerCase()
    if (!value.split('').every((c) => '0123456789abcdef'.includes(c))) return

    const rgb =
        value.length === (props.alpha ? 4 : 3)
            ? `${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`
            : value.slice(0, 6)

    const a = props.alpha
        ? value.length === 4
            ? `${value[3]}${value[3]}`
            : value.slice(6, 8)
        : '00'

    return { rgb, a }
})

const colorValue = computed({
    get: () => `#${rgba.value?.rgb || '000000'}`,
    set: (value) =>
        emit(
            'update:modelValue',
            props.alpha ? `${value}${rgba.value?.a || '00'}` : value
        ),
})

const isError = computed(() => !validate(props, () => !!rgba.value))

function selectAll() {
    if (!el.value) return
    el.value.select()
}

function reset() {
    if (props.defaultValue === undefined) return
    value.value = props.defaultValue
}
</script>

<template>
    <div
        class="relative flex items-center h-8"
        :class="{ 'ring-1 ring-sonolus-warning': isError }"
    >
        <input
            ref="el"
            v-model="value"
            type="text"
            class="
                flex-grow
                w-full
                h-full
                pl-8
                pr-2
                text-center
                outline-none
                reset
                clickable
            "
            :placeholder="placeholder"
            @focus="selectAll()"
            @keydown.enter="$emit('enter')"
            @keydown.escape="$emit('escape')"
        />
        <IconExclamation
            v-if="isError"
            class="absolute pointer-events-none icon top-2 left-2"
        />
        <div
            v-else
            class="absolute pointer-events-none icon top-2 left-2"
            :style="{ backgroundColor: modelValue }"
        />
        <div class="relative flex-none h-full clickable">
            <input
                v-model="colorValue"
                class="w-8 h-full opacity-0"
                type="color"
                tabindex="-1"
            />
            <IconPalette
                class="absolute pointer-events-none icon top-2 left-2"
            />
        </div>
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
