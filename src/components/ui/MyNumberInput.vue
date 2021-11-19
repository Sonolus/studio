<script setup lang="ts">
import { computed, ref } from 'vue'
import IconKeyboard from '../../icons/keyboard-solid.svg?component'
import IconUndo from '../../icons/undo-alt-solid.svg?component'

const props = defineProps<{
    modelValue: number
    defaultValue?: number
    placeholder: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void
    (e: 'enter'): void
    (e: 'escape'): void
}>()

const el = ref<HTMLInputElement>()

const value = computed({
    get: () => props.modelValue.toString(),
    set: (value) => emit('update:modelValue', +value || 0),
})

function selectAll() {
    if (!el.value) return
    el.value.select()
}

function reset() {
    if (props.defaultValue === undefined) return
    value.value = props.defaultValue.toFixed(4)
}
</script>

<template>
    <div class="relative flex items-center h-8">
        <input
            ref="el"
            v-model="value"
            type="number"
            class="
                flex-grow
                w-full
                h-full
                pl-8
                pr-2
                text-center
                reset
                clickable
            "
            :placeholder="placeholder"
            @focus="selectAll()"
            @keydown.enter="$emit('enter')"
            @keydown.escape="$emit('escape')"
        />
        <IconKeyboard class="absolute pointer-events-none icon top-2 left-2" />
        <button
            v-if="defaultValue !== undefined"
            class="flex-none h-full px-2 clickable"
            tabindex="-1"
            @click="reset()"
        >
            <IconUndo class="icon" />
        </button>
    </div>
</template>
