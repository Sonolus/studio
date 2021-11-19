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
    (e: 'close'): void
}>()
</script>

<template>
    <ModalBase :icon="IconExclamation" title="Error">
        {{ data.message }}

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
