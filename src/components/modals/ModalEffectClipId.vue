<script setup lang="ts">
import { customEffectClip, EffectClip } from 'sonolus-core'
import { Component, computed, ref } from 'vue'
import { Validator } from '../../core/validation'
import IconCheck from '../../icons/check-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import MyField from '../ui/MyField.vue'
import MyNumberInput from '../ui/MyNumberInput.vue'
import MyNumberSelect from '../ui/MyNumberSelect.vue'
import MyTextSelect from '../ui/MyTextSelect.vue'
import ModalBase from './ModalBase.vue'

const props = defineProps<{
    data: {
        icon: Component
        title: string
        defaultValue: number
        validator: Validator<number>
    }
}>()

const emit = defineEmits<{
    (e: 'close', result?: number): void
}>()

const effectClipOptions = Object.fromEntries(
    Object.entries(EffectClip).filter(
        (kvp): kvp is [string, number] => typeof kvp[1] === 'number'
    )
)

const type = ref<'general' | 'engine' | 'custom'>('general')
const generalClipId = ref<number>(0)
const engineId = ref<number>(0)
const engineClipId = ref<number>(0)
const customId = ref<number>(0)

const value = computed(() => {
    switch (type.value) {
        case 'general':
            return generalClipId.value
        case 'engine':
            return customEffectClip(engineId.value, engineClipId.value)
        case 'custom':
            return customId.value
        default:
            throw 'Unexpected type'
    }
})

const isError = computed(() => !props.data.validator(value.value))
const validator = () => !isError.value

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
        <MyField title="Type">
            <MyTextSelect
                v-model="type"
                :options="{
                    General: 'general',
                    Engine: 'engine',
                    Custom: 'custom',
                }"
                auto-focus
            />
        </MyField>

        <template v-if="type === 'general'">
            <MyField title="Clip Type">
                <MyNumberSelect
                    v-model="generalClipId"
                    :options="effectClipOptions"
                    validate
                    :validator="validator"
                />
            </MyField>
        </template>

        <template v-else-if="type === 'engine'">
            <MyField title="Engine ID">
                <MyNumberInput
                    v-model="engineId"
                    placeholder="Enter engine ID..."
                />
            </MyField>
            <MyField title="Clip ID">
                <MyNumberInput
                    v-model="engineClipId"
                    placeholder="Enter clip ID..."
                    validate
                    :validator="validator"
                />
            </MyField>
        </template>

        <template v-else-if="type === 'custom'">
            <MyField title="Clip ID">
                <MyNumberInput
                    v-model="customId"
                    placeholder="Enter clip ID..."
                    validate
                    :validator="validator"
                />
            </MyField>
        </template>

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
