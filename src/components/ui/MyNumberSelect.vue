<script setup lang="ts">
import { computed, ref } from 'vue'
import { Validator, validateInput } from '../../core/validation'
import IconStream from '../../icons/stream-solid.svg?component'
import IconUndo from '../../icons/undo-alt-solid.svg?component'

const props = defineProps<{
    modelValue: number
    defaultValue?: number
    options: Record<string, number>
    validate?: boolean
    validator?: Validator<number>
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void
}>()

const el = ref<HTMLSelectElement>()

const value = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
})

const isError = computed(() => !validateInput(props, () => true))

function reset() {
    if (props.defaultValue === undefined) return
    value.value = props.defaultValue
}
</script>

<template>
    <div class="flex h-8 items-center" :class="{ 'ring-1 ring-sonolus-warning': isError }">
        <div class="relative h-full w-full flex-grow">
            <select
                ref="el"
                v-model="value"
                class="clickable h-full w-full border-none px-8 py-0 text-center"
            >
                <option
                    v-for="(option, description) in options"
                    :key="option"
                    class="bg-sonolus-ui-surface"
                    :value="option"
                >
                    {{ description }}
                </option>
            </select>
            <IconStream class="icon pointer-events-none absolute left-2 top-2" />
        </div>
        <button
            v-if="defaultValue !== undefined"
            class="clickable h-full flex-none px-2"
            tabindex="-1"
            @click="reset()"
        >
            <IconUndo class="icon" />
        </button>
    </div>
</template>
