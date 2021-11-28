<script setup lang="ts">
import IconCheck from '../../icons/check-solid.svg?component'
import IconQuestion from '../../icons/question-circle-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import ModalBase from './ModalBase.vue'

defineProps<{
    data: {
        message: string
    }
}>()

defineEmits<{
    (e: 'close', result?: boolean): void
}>()
</script>

<template>
    <ModalBase :icon="IconQuestion" title="Confirmation">
        {{ data.message }}

        <template #actions>
            <MyButton
                class="w-24"
                :icon="IconTimes"
                text="Cancel"
                @click="$emit('close', false)"
            />
            <MyButton
                class="w-24 ml-4"
                :icon="IconCheck"
                text="Confirm"
                auto-focus
                @click="$emit('close', true)"
            />
        </template>
    </ModalBase>
</template>
