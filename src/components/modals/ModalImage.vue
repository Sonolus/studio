<script setup lang="ts">
import IconImage from '../../icons/image-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import ModalBase from './ModalBase.vue'

defineProps<{
    data: {
        src: string
    }
}>()

defineEmits<{
    (e: 'close'): void
}>()
</script>

<template>
    <ModalBase :icon="IconImage" title="Image">
        <img class="h-auto w-full" :src="data.src" />

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
