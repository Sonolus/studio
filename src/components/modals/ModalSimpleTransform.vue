<script setup lang="ts">
import { ref } from 'vue'
import { getSimpleTransform } from '../../core/simple-transform'
import { type Transform } from '../../core/skin'
import IconCheck from '../../icons/check-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import IconVectorSquare from '../../icons/vector-square-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import MyField from '../ui/MyField.vue'
import MyNumberInput from '../ui/MyNumberInput.vue'
import ModalBase from './ModalBase.vue'

defineProps<{
    data: null
}>()

const emit = defineEmits<{
    close: [result?: Transform]
}>()

const left = ref(0)
const right = ref(0)
const top = ref(0)
const bottom = ref(0)

function close(isSuccess?: boolean) {
    emit(
        'close',
        isSuccess
            ? getSimpleTransform(left.value, right.value, top.value, bottom.value)
            : undefined,
    )
}
</script>

<template>
    <ModalBase :icon="IconVectorSquare" title="Simple Transform">
        <MyField title="Left">
            <MyNumberInput
                v-model="left"
                placeholder="Enter left cutoff (0 to 1)..."
                auto-focus
                @enter="close(true)"
                @escape="close()"
            />
        </MyField>

        <MyField title="Right">
            <MyNumberInput
                v-model="right"
                placeholder="Enter right cutoff (0 to 1)..."
                @enter="close(true)"
                @escape="close()"
            />
        </MyField>

        <MyField title="Top">
            <MyNumberInput
                v-model="top"
                placeholder="Enter top cutoff (0 to 1)..."
                @enter="close(true)"
                @escape="close()"
            />
        </MyField>

        <MyField title="Bottom">
            <MyNumberInput
                v-model="bottom"
                placeholder="Enter bottom cutoff (0 to 1)..."
                @enter="close(true)"
                @escape="close()"
            />
        </MyField>

        <template #actions>
            <MyButton class="w-24" :icon="IconTimes" text="Cancel" @click="close()" />
            <MyButton :icon="IconCheck" text="Confirm" class="ml-4 w-24" @click="close(true)" />
        </template>
    </ModalBase>
</template>
