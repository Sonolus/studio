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
    <div class="flex items-center h-8">
        <div class="flex-grow" />
        <button
            ref="el"
            class="flex-none w-16 h-full p-2 clickable"
            @click="value = !value"
        >
            <div
                class="w-1/2 h-full transition-all duration-200"
                :class="
                    value
                        ? 'bg-sonolus-success translate-x-full'
                        : 'bg-sonolus-warning'
                "
            />
        </button>
        <button
            class="flex-none h-full px-2 ml-2 clickable"
            tabindex="-1"
            @click="reset()"
        >
            <IconUndo class="icon" />
        </button>
    </div>
</template>
