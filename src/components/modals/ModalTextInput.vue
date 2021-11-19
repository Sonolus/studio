<script setup lang="ts">
import { Component, computed, ref } from 'vue'
import { Validator } from '../../core/validation'
import IconCheck from '../../icons/check-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import MyTextInput from '../ui/MyTextInput.vue'
import ModalBase from './ModalBase.vue'

const props = defineProps<{
    data: {
        icon: Component
        title: string
        defaultValue: string
        placeholder: string
        validator: Validator<string>
    }
}>()

const emit = defineEmits<{
    (e: 'close', result?: string): void
}>()

const value = ref(props.data.defaultValue)

const isError = computed(() => !props.data.validator(value.value))

function close(isSuccess?: boolean) {
    emit('close', isSuccess ? value.value : undefined)
}

function tryClose() {
    if (isError.value) return

    close(true)
}
</script>

<template>
    <ModalBase :icon="data.icon" :title="data.title">
        <MyTextInput
            v-model="value"
            :placeholder="data.placeholder"
            validate
            :validator="data.validator"
            auto-focus
            @enter="tryClose()"
            @escape="close()"
        />

        <template #actions>
            <MyButton
                :icon="IconTimes"
                text="Cancel"
                class="w-24"
                @click="close()"
            />
            <MyButton
                :icon="IconCheck"
                text="Confirm"
                :disabled="isError"
                class="w-24 ml-4"
                @click="tryClose()"
            />
        </template>
    </ModalBase>
</template>
