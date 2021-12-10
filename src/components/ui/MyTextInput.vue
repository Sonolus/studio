<script setup lang="ts">
import { useMounted } from '@vueuse/core'
import { computed, nextTick, ref, watchEffect } from 'vue'
import { validate, Validator } from '../../core/validation'
import IconKeyboard from '../../icons/keyboard-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import IconUndo from '../../icons/undo-alt-solid.svg?component'

const props = defineProps<{
    modelValue: string
    defaultValue?: string
    placeholder: string
    validate?: boolean
    validator?: Validator<string>
    autoFocus?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
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
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
})

const isError = computed(() => !validate(props, (value) => !!value.length))

function selectAll() {
    if (!el.value) return
    el.value.select()
}

function reset() {
    if (props.defaultValue === undefined) return
    value.value = props.defaultValue
}

async function clear() {
    value.value = ''

    await nextTick()
    if (!el.value) return
    el.value.focus()
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
        <IconKeyboard class="absolute pointer-events-none icon top-2 left-2" />
        <button
            v-if="defaultValue !== undefined"
            class="flex-none h-full px-2 clickable"
            tabindex="-1"
            @click="reset()"
        >
            <IconUndo class="icon" />
        </button>
        <button
            class="flex-none h-full px-2 clickable"
            tabindex="-1"
            @click="clear()"
        >
            <IconTimes class="icon" />
        </button>
    </div>
</template>
