<script setup lang="ts">
import { useMounted } from '@vueuse/core'
import type { Component } from 'vue'
import { ref, watchEffect } from 'vue'

const props = defineProps<{
    icon: Component
    text: string
    autoFocus?: boolean
}>()

const el = ref<HTMLButtonElement>()
const mounted = useMounted()
watchEffect(() => {
    if (!props.autoFocus) return
    if (!el.value) return
    if (!mounted.value) return

    el.value.focus()
})
</script>

<template>
    <button ref="el" class="flex items-center h-8 px-2 clickable">
        <component :is="icon" class="flex-none icon" />
        <div class="flex-grow ml-2 text-center">{{ text }}</div>
    </button>
</template>
