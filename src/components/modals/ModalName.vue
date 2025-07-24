<script setup lang="ts">
import { type Component, computed, ref } from 'vue'
import { formatNameKey } from '../../core/names'
import { type Validator } from '../../core/validation'
import IconCheck from '../../icons/check-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import MyField from '../ui/MyField.vue'
import MyTextInput from '../ui/MyTextInput.vue'
import MyTextSelect from '../ui/MyTextSelect.vue'
import ModalBase from './ModalBase.vue'

const props = defineProps<{
    data: {
        icon: Component
        title: string
        names: Record<string, string>
        defaultValue: string
        validator: Validator<string>
    }
}>()

const emit = defineEmits<{
    close: [result?: string]
}>()

const options = computed(() =>
    Object.fromEntries(Object.entries(props.data.names).map(([k, v]) => [formatNameKey(k), v])),
)

const type = ref<'general' | 'custom'>('general')
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const generalName = ref(Object.values(options.value)[0]!)
const customName = ref('')

const value = computed(() => {
    switch (type.value) {
        case 'general':
            return generalName.value
        case 'custom':
            return customName.value
        default:
            throw new Error('Unexpected type')
    }
})

const isError = computed(() => !props.data.validator(value.value))
const validator = () => !isError.value

initDefaultValue()

function initDefaultValue() {
    const name = props.data.defaultValue

    if (Object.values(options.value).includes(name)) {
        type.value = 'general'
        generalName.value = name
    } else {
        type.value = 'custom'
        customName.value = name
    }
}

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
                    Custom: 'custom',
                }"
                auto-focus
            />
        </MyField>

        <template v-if="type === 'general'">
            <MyField title="Name">
                <MyTextSelect
                    v-model="generalName"
                    :options="options"
                    validate
                    :validator="validator"
                />
            </MyField>
        </template>

        <template v-else-if="type === 'custom'">
            <MyField title="Name">
                <MyTextInput
                    v-model="customName"
                    placeholder="Enter name..."
                    validate
                    :validator="validator"
                    @enter="tryClose()"
                    @escape="close()"
                />
            </MyField>
        </template>

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
