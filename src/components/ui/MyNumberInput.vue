<script setup lang="ts">
import { useMounted } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
import { validate, Validator } from '../../core/validation'
import IconKeyboard from '../../icons/keyboard-solid.svg?component'
import IconUndo from '../../icons/undo-alt-solid.svg?component'

const props = defineProps<{
    modelValue: number
    defaultValue?: number
    placeholder: string
    validate?: boolean
    validator?: Validator<number>
    autoFocus?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void
    (e: 'enter'): void
    (e: 'escape'): void
}>()

const el = ref<HTMLInputElement>()
const mounted = useMounted()
watchEffect(() => {
    if (!props.autoFocus) return
    if (!el.value) return
    if (!mounted.value) return

    el.value.focus()
})

const value = computed({
    get: () => props.modelValue.toString(),
    set: (value) => emit('update:modelValue', +value || 0),
})

const isError = computed(() => !validate(props, () => true))

function selectAll() {
    if (!el.value) return
    el.value.select()
}

function reset() {
    if (props.defaultValue === undefined) return
    value.value = props.defaultValue.toFixed(4)
}
</script>

<template>
    <div
        class="relative flex h-8 items-center"
        :class="{ 'ring-1 ring-sonolus-warning': isError }"
    >
        <input
            ref="el"
            v-model="value"
            type="number"
            inputmode="decimal"
            class="reset clickable h-full w-full flex-grow pl-8 pr-2 text-center outline-none"
            :placeholder="placeholder"
            @focus="selectAll()"
            @keydown.enter="$emit('enter')"
            @keydown.escape="$emit('escape')"
        />
        <IconKeyboard class="icon pointer-events-none absolute top-2 left-2" />
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
