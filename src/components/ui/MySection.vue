<script setup lang="ts">
defineProps<{
    header: string
}>()
</script>

<template>
    <div class="my-6 text-3xl font-semibold">{{ header }}</div>
    <div class="mb-12">
        <slot />
    </div>
</template>
