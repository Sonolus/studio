<script setup lang="ts">
import type { Component } from 'vue'
import { ref, watch } from 'vue'

const props = defineProps<{
    icon: Component
    text: string
    autoFocus?: boolean
}>()

const el = ref<HTMLButtonElement>()
watch(el, (value) => {
    if (!value) return
    if (!props.autoFocus) return

    value.focus()
})
</script>

<template>
    <button ref="el" class="flex items-center h-8 px-2 clickable">
        <component :is="icon" class="flex-none icon" />
        <div class="flex-grow ml-2 text-center">{{ text }}</div>
    </button>
</template>
