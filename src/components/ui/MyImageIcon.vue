<script setup lang="ts">
import { ref, watch, type Component } from 'vue'
import IconExclamation from '../../icons/exclamation-circle-solid.svg?component'

const props = defineProps<{
    src: string
    fallback?: Component
    fill?: boolean
}>()

const isError = ref(false)

watch(
    () => props.src,
    () => (isError.value = false),
)

function onError() {
    isError.value = true
}
</script>

<template>
    <div v-if="!isError">
        <img
            :key="src"
            :src="src"
            class="h-full w-full"
            :class="fill ? 'object-fill' : 'object-contain'"
            @error="onError()"
        />
    </div>
    <component :is="fallback || IconExclamation" v-else class="fill-current" />
</template>
