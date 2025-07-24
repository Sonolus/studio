<script setup lang="ts">
import { computed, ref } from 'vue'
import { expressionToEquation } from '../../core/expression'
import {
    type TransformExpression,
    equationToTransformExpression,
} from '../../core/transform-expression'
import IconCheck from '../../icons/check-solid.svg?component'
import IconEdit from '../../icons/edit-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import MyTextInput from '../ui/MyTextInput.vue'
import ModalBase from './ModalBase.vue'

const props = defineProps<{
    data: {
        title: string
        defaultValue: TransformExpression
    }
}>()

const emit = defineEmits<{
    close: [result?: TransformExpression]
}>()

const value = ref(expressionToEquation(props.data.defaultValue))

const validator = (equation: string) => !!equationToTransformExpression(equation)

const isError = computed(() => !validator(value.value))

function close(isSuccess?: boolean) {
    emit('close', isSuccess ? equationToTransformExpression(value.value) : undefined)
}

function tryClose() {
    if (isError.value) return

    close(true)
}
</script>

<template>
    <ModalBase :icon="IconEdit" :title="data.title">
        <MyTextInput
            v-model="value"
            placeholder="Enter transform expression equation..."
            validate
            :validator="validator"
            auto-focus
            @enter="tryClose()"
            @escape="close()"
        />

        <template #actions>
            <MyButton :icon="IconTimes" text="Cancel" class="w-24" @click="close()" />
            <MyButton
                :icon="IconCheck"
                text="Confirm"
                :disabled="isError"
                class="ml-4 w-24"
                @click="tryClose()"
            />
        </template>
    </ModalBase>
</template>
