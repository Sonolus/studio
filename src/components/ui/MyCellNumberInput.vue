<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
    modelValue: number
    placeholder: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void
    (e: 'enter'): void
    (e: 'escape'): void
}>()

const el = ref<HTMLInputElement>()

const value = computed({
    get: () => props.modelValue.toString(),
    set: (value) => emit('update:modelValue', +value || 0),
})

function selectAll() {
    if (!el.value) return
    el.value.select()
}
</script>

<template>
    <input
        ref="el"
        v-model="value"
        type="number"
        inputmode="decimal"
        class="w-full h-8 px-2 text-center reset clickable"
        :placeholder="placeholder"
        @focus="selectAll()"
        @keydown.enter="$emit('enter')"
        @keydown.escape="$emit('escape')"
    />
</template>

<style scoped>
::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
    @apply hidden;
}
</style>
