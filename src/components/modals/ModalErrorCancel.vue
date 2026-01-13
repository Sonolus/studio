<script setup lang="ts">
import IconExclamation from '../../icons/exclamation-circle-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import ModalBase from './ModalBase.vue'

defineProps<{
    data: {
        message: string
    }
}>()

defineEmits<{
    close: []
}>()
</script>

<template>
    <ModalBase :icon="IconExclamation" title="Error">
        <div class="whitespace-pre-wrap">{{ data.message }}</div>

        <template #actions>
            <MyButton
                class="w-24"
                :icon="IconTimes"
                text="Cancel"
                auto-focus
                @click="$emit('close')"
            />
        </template>
    </ModalBase>
</template>
