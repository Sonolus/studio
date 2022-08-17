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
    <button ref="el" class="clickable flex h-8 items-center px-2">
        <component :is="icon" class="icon flex-none" />
        <div class="ml-2 flex-grow text-center">{{ text }}</div>
    </button>
</template>
