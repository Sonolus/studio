<script setup lang="ts">
import IconFileAudio from '../../icons/file-audio-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import ModalBase from './ModalBase.vue'

defineProps<{
    data: {
        src: string
    }
}>()

defineEmits<{
    close: []
}>()
</script>

<template>
    <ModalBase :icon="IconFileAudio" title="Audio">
        <audio class="h-8 w-full" :src="data.src" controls autoplay />

        <template #actions>
            <MyButton
                class="w-24"
                :icon="IconTimes"
                text="Close"
                auto-focus
                @click="$emit('close')"
            />
        </template>
    </ModalBase>
</template>
