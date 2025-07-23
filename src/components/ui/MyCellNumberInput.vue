<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
    modelValue: number
    placeholder: string
}>()

const emit = defineEmits<{
    'update:modelValue': [value: number]
    enter: []
    escape: []
}>()

const el = ref<HTMLInputElement>()

const value = computed({
    get: () => props.modelValue.toString(),
    set: (value) => {
        emit('update:modelValue', +value || 0)
    },
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
        class="clickable h-8 border-none px-2 text-center"
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
