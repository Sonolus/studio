<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
    icon: Component
    title: string
}>()
</script>

<template>
    <div class="bg-sonolus-ui-surface">
        <div class="flex h-12 items-center px-2">
            <component :is="icon" class="h-6 w-6 flex-none fill-current" />
            <div
                class="mr-6 w-full flex-grow text-center text-xl font-semibold"
            >
                {{ title }}
            </div>
        </div>

        <div class="my-8 px-4 text-center sm:px-8">
            <slot />
        </div>

        <div class="flex h-12 items-center justify-center px-2">
            <slot name="actions" />
        </div>
    </div>
</template>
