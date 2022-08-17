<script setup lang="ts">
import { useMounted } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
import IconAngleDown from '../../icons/angle-down-solid.svg?component'
import IconStream from '../../icons/stream-solid.svg?component'
import IconUndo from '../../icons/undo-alt-solid.svg?component'

const props = defineProps<{
    modelValue: string
    defaultValue?: string
    options: Record<string, string>
    autoFocus?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const el = ref<HTMLSelectElement>()
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
    if (props.defaultValue === undefined) return
    value.value = props.defaultValue
}
</script>

<template>
    <div class="flex h-8 items-center">
        <div class="relative h-full w-full flex-grow">
            <select
                ref="el"
                v-model="value"
                class="reset clickable h-full w-full px-8 text-center"
            >
                <IconUndo class="icon" />
                <option
                    v-for="(option, description) in options"
                    :key="option"
                    class="bg-sonolus-ui-surface"
                    :value="option"
                >
                    {{ description }}
                </option>
            </select>
            <IconStream
                class="icon pointer-events-none absolute top-2 left-2"
            />
            <IconAngleDown
                class="icon pointer-events-none absolute top-2 right-2"
            />
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
