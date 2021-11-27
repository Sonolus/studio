<script setup lang="ts">
defineProps<{
    title: string
}>()
</script>

<template>
    <div class="my-4 sm:flex sm:items-start">
        <div class="flex-grow flex-1 text-lg font-semibold text-left sm:py-0.5">
            {{ title }}
        </div>
        <div class="flex-1 flex-grow-[2] mt-1 sm:mt-0 sm:ml-2">
            <slot />
        </div>
    </div>
</template>
