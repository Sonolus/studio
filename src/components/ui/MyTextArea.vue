<script setup lang="ts">
import { useMounted } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
import { validate, Validator } from '../../core/validation'

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

const isError = computed(() => !validate(props, (value) => !!value.length))
</script>

<template>
    <textarea
        v-model="value"
        class="
            w-full
            p-2
            overflow-y-scroll
            resize-none
            reset
            clickable
            scrollbar
        "
        :class="{ 'ring-1 ring-sonolus-warning': isError }"
        :placeholder="placeholder"
        rows="4"
    />
</template>
