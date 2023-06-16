<script setup lang="ts">
import { useMounted } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
import IconUndo from '../../icons/undo-alt-solid.svg?component'

const props = defineProps<{
    modelValue: boolean
    defaultValue: boolean
    autoFocus?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const el = ref<HTMLButtonElement>()
const mounted = useMounted()
watchEffect(() => {
    if (!props.autoFocus) return
    if (!el.value) return
    if (!mounted.value) return

    el.value.focus()
})

const value = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
})

function reset() {
    value.value = props.defaultValue
}
</script>

<template>
    <div class="flex h-8 items-center">
        <div class="flex-grow" />
        <button ref="el" class="clickable h-full w-16 flex-none p-2" @click="value = !value">
            <div
                class="h-full w-1/2 transition-all duration-200"
                :class="value ? 'translate-x-full bg-sonolus-success' : 'bg-sonolus-warning'"
            />
        </button>
        <button class="clickable ml-2 h-full flex-none px-2" tabindex="-1" @click="reset()">
            <IconUndo class="icon" />
        </button>
    </div>
</template>
