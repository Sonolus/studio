<script setup lang="ts">
import { ref, watch } from 'vue'
import { useParticlePreviewOptions } from '../../../composables/particle-preview'
import IconRotate from '../../../icons/rotate.svg?component'
import MyButton from '../../ui/MyButton.vue'
import MyColorInput from '../../ui/MyColorInput.vue'
import MyField from '../../ui/MyField.vue'
import MyNumberInput from '../../ui/MyNumberInput.vue'
import MyToggle from '../../ui/MyToggle.vue'

defineProps<{
    elBack: HTMLCanvasElement | undefined
    elTop: HTMLCanvasElement | undefined
    randomize: number
    canvasWidth: number
    canvasHeight: number
    draggingIndex: number | undefined
}>()

const emit = defineEmits<{
    'update:elBack': [value: HTMLCanvasElement | undefined]
    'update:elTop': [value: HTMLCanvasElement | undefined]
    'update:randomize': [value: number]
}>()

const { backgroundColor, duration, loop } = useParticlePreviewOptions()

const elBackRef = ref<HTMLCanvasElement>()
const elTopRef = ref<HTMLCanvasElement>()

watch(elBackRef, () => {
    emit('update:elBack', elBackRef.value)
})
watch(elTopRef, () => {
    emit('update:elTop', elTopRef.value)
})
</script>

<template>
    <MyField title="Background Color">
        <MyColorInput
            v-model="backgroundColor"
            default-value="#000"
            placeholder="Enter preview background color..."
            validate
        />
    </MyField>
    <MyField title="Duration">
        <MyNumberInput v-model="duration" placeholder="Enter duration..." validate />
    </MyField>
    <MyField title="Loop">
        <MyToggle v-model="loop" :default-value="true" />
    </MyField>

    <div class="mx-auto my-4 max-w-sm border-4 border-sonolus-ui-text-normal">
        <div class="relative h-0 overflow-hidden pt-[100%]" :style="{ backgroundColor }">
            <canvas
                ref="elBackRef"
                class="absolute left-0 top-0 h-full w-full"
                :class="{ 'opacity-50': draggingIndex !== undefined }"
                :width="canvasWidth"
                :height="canvasHeight"
            />
            <canvas
                ref="elTopRef"
                class="absolute left-0 top-0 h-full w-full select-none opacity-50 hover:opacity-100"
                :style="{ touchAction: 'none' }"
                :width="canvasWidth"
                :height="canvasHeight"
            />
        </div>
    </div>

    <MyButton
        class="mx-auto mt-4"
        :icon="IconRotate"
        text="Randomize"
        @click="$emit('update:randomize', randomize + 1)"
    />
</template>
