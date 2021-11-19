<script setup lang="ts">
defineProps<{
    title: string
}>()
</script>

<template>
    <div class="my-4 sm:flex sm:items-start">
        <div
            class="
                flex-none
                font-semibold
                sm:w-24
                md:w-36
                lg:w-48
                text-lg
                sm:py-[0.125rem]
            "
        >
            {{ title }}
        </div>
        <div class="flex-grow mt-1 sm:mt-0 sm:ml-2 min-h-[2rem]">
            <slot />
        </div>
    </div>
</template>
