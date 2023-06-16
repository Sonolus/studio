<script setup lang="ts">
defineProps<{
    title: string
}>()
</script>

<template>
    <div class="my-4 sm:flex sm:items-start">
        <div class="flex-1 flex-grow text-left text-lg font-semibold sm:py-0.5">
            {{ title }}
        </div>
        <div class="mt-1 flex-1 flex-grow-[2] sm:ml-2 sm:mt-0">
            <slot />
        </div>
    </div>
</template>
