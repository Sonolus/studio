<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useModals } from '../../composables/modal'
import { load } from '../../core/storage'
import { getImageInfo } from '../../core/utils'
import { validate } from '../../core/validation'
import IconImage from '../../icons/image-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import ModalImage from '../modals/ModalImage.vue'
import MyImageIcon from './MyImageIcon.vue'

const props = defineProps<{
    modelValue: string
    fill?: boolean
    validate?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const el = ref<HTMLInputElement>()

const imageInfo = ref<string | false>()
watchEffect(async () => {
    imageInfo.value = undefined
    try {
        const { width, height } = await getImageInfo(props.modelValue)
        imageInfo.value = `${width} x ${height}`
    } catch (error) {
        imageInfo.value = false
    }
})

const isError = computed(
    () => !validate(props, () => imageInfo.value !== false)
)

function select() {
    if (!el.value) return

    el.value.click()
}

function onFileInput() {
    if (!el.value) return

    const file = el.value.files?.[0]
    if (!file) return

    el.value.value = ''

    emit('update:modelValue', load(file))
}

const { show } = useModals()

function open() {
    show(ModalImage, { src: props.modelValue })
}

function clear() {
    emit('update:modelValue', '')
}
</script>

<template>
    <div
        class="relative flex items-center h-8"
        :class="{ 'ring-1 ring-sonolus-warning': isError }"
    >
        <template v-if="modelValue">
            <button
                class="flex items-center flex-grow w-full h-full px-2 clickable"
                @click="open()"
            >
                <MyImageIcon class="icon" :src="modelValue" :fill="fill" />
                <div class="flex-grow ml-2 text-center">
                    {{
                        imageInfo === undefined
                            ? 'Loading...'
                            : imageInfo === false
                            ? 'Error'
                            : imageInfo
                    }}
                </div>
            </button>
            <button
                class="flex-none h-full px-2 clickable"
                tabindex="-1"
                @click="clear()"
            >
                <IconTimes class="icon" />
            </button>
        </template>
        <template v-else>
            <button
                class="flex items-center flex-grow w-full h-full px-2 clickable"
                @click="select()"
            >
                <IconImage class="flex-none icon" />
                <div class="flex-grow ml-2 text-center">Select Image...</div>
            </button>
        </template>

        <input
            ref="el"
            class="hidden"
            type="file"
            accept="image/png, image/jpeg"
            @input="onFileInput()"
        />
    </div>
</template>
