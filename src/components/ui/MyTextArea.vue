<script setup lang="ts">
import { useMounted } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
import { validateInput, Validator } from '../../core/validation'

const props = defineProps<{
    modelValue: string
    placeholder: string
    validate?: boolean
    validator?: Validator<string>
    autoFocus?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
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

const isError = computed(() => !validateInput(props, (value) => !!value.length))
</script>

<template>
    <textarea
        v-model="value"
        class="clickable scrollbar w-full resize-none overflow-y-scroll border-none p-2"
        :class="{ 'ring-1 ring-sonolus-warning': isError }"
        :placeholder="placeholder"
        rows="4"
    />
</template>
