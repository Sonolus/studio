<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useModals } from '../../composables/modal'
import { loadFile } from '../../core/storage'
import { getAudioInfo } from '../../core/utils'
import { validate } from '../../core/validation'
import IconExclamation from '../../icons/exclamation-circle-solid.svg?component'
import IconFileAudio from '../../icons/file-audio-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import ModalAudio from '../modals/ModalAudio.vue'

const props = defineProps<{
    modelValue: string
    validate?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const el = ref<HTMLInputElement>()

const audioInfo = ref<string | false>()
watchEffect(async () => {
    audioInfo.value = undefined
    try {
        const { duration } = await getAudioInfo(props.modelValue)
        const minutes = Math.floor(duration / 60)
            .toString()
            .padStart(2, '0')
        const seconds = (duration % 60).toFixed(2).padStart(5, '0')
        audioInfo.value = `${minutes}:${seconds}`
    } catch (error) {
        audioInfo.value = false
    }
})

const isError = computed(
    () => !validate(props, () => audioInfo.value !== false)
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

    emit('update:modelValue', loadFile(file))
}

const { show } = useModals()

function open() {
    show(ModalAudio, { src: props.modelValue })
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
                <component
                    :is="audioInfo === false ? IconExclamation : IconFileAudio"
                    class="icon"
                />
                <div class="flex-grow ml-2 text-center">
                    {{
                        audioInfo === undefined
                            ? 'Loading...'
                            : audioInfo === false
                            ? 'Error'
                            : audioInfo
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
                <IconFileAudio class="flex-none icon" />
                <div class="flex-grow ml-2 text-center">Select Audio...</div>
            </button>
        </template>

        <input ref="el" class="hidden" type="file" @input="onFileInput()" />
    </div>
</template>
