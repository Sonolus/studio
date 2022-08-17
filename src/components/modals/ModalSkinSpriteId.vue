<script setup lang="ts">
import { customSkinSprite, SkinSprite } from 'sonolus-core'
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

const skinSpriteOptions = Object.fromEntries(
    Object.entries(SkinSprite).filter(
        (kvp): kvp is [string, number] => typeof kvp[1] === 'number'
    )
)

const type = ref<'general' | 'engine' | 'custom'>('general')
const generalSpriteId = ref(SkinSprite.NoteHeadNeutral)
const engineId = ref(0)
const engineSpriteId = ref(0)
const customId = ref(0)

const value = computed(() => {
    switch (type.value) {
        case 'general':
            return generalSpriteId.value
        case 'engine':
            return customSkinSprite(engineId.value, engineSpriteId.value)
        case 'custom':
            return customId.value
        default:
            throw 'Unexpected type'
    }
})

const isError = computed(() => !props.data.validator(value.value))
const validator = () => !isError.value

initDefaultValue()

function initDefaultValue() {
    const id = props.data.defaultValue

    if (SkinSprite[id]) {
        type.value = 'general'
        generalSpriteId.value = id
    } else if (id >= 100000 && id < 200000) {
        type.value = 'engine'
        engineId.value = Math.floor(id / 100 - 1000)
        engineSpriteId.value = id % 100
    } else {
        type.value = 'custom'
        customId.value = id
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
                    Engine: 'engine',
                    Custom: 'custom',
                }"
                auto-focus
            />
        </MyField>

        <template v-if="type === 'general'">
            <MyField title="Sprite Type">
                <MyNumberSelect
                    v-model="generalSpriteId"
                    :options="skinSpriteOptions"
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
            <MyField title="Sprite ID">
                <MyNumberInput
                    v-model="engineSpriteId"
                    placeholder="Enter sprite ID..."
                    validate
                    :validator="validator"
                />
            </MyField>
        </template>

        <template v-else-if="type === 'custom'">
            <MyField title="Sprite ID">
                <MyNumberInput
                    v-model="customId"
                    placeholder="Enter sprite ID..."
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
                class="ml-4 w-24"
                @click="tryClose()"
            />
        </template>
    </ModalBase>
</template>
