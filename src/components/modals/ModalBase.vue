<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
    icon: Component
    title: string
}>()
</script>

<template>
    <div class="bg-sonolus-ui-surface">
        <div class="flex items-center h-12 px-2">
            <component :is="icon" class="flex-none w-6 h-6 fill-current" />
            <div
                class="flex-grow w-full mr-6 text-xl font-semibold text-center"
            >
                {{ title }}
            </div>
        </div>

        <div class="px-4 my-8 text-center sm:px-8">
            <slot />
        </div>

        <div class="flex items-center justify-center h-12 px-2">
            <slot name="actions" />
        </div>
    </div>
</template>
