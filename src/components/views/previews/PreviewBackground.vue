<script setup lang="ts">
import { useElementBounding, useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { Background } from '../../../core/background'
import MyField from '../../ui/MyField.vue'
import MyTextSelect from '../../ui/MyTextSelect.vue'

const props = defineProps<{
    data: Background
}>()

const aspectRatio = useLocalStorage('preview.background.aspectRatio', '16:9')
const aspectRatioValue = computed(
    () =>
        ({
            '4:3': 4 / 3,
            '16:9': 16 / 9,
            '18:9': 18 / 9,
            '21:9': 21 / 9,
        }[aspectRatio.value] || 16 / 9)
)

const width = computed(() => {
    const inverse = props.data.data.aspectRatio / aspectRatioValue.value
    const isLarger = props.data.data.aspectRatio >= aspectRatioValue.value
    switch (props.data.data.fit) {
        case 'width':
            return 1
        case 'height':
            return inverse
        case 'contain':
            return isLarger ? 1 : inverse
        case 'cover':
            return isLarger ? inverse : 1
        default:
            throw 'Unexpected fit'
    }
})

const el = ref<HTMLDivElement>()
const { height } = useElementBounding(el)
const blurRadius = computed(
    () => height.value * props.data.configuration.blur * 0.1
)
</script>

<template>
    <MyField title="Aspect Ratio">
        <MyTextSelect
            v-model="aspectRatio"
            default-value="16:9"
            :options="{
                '4:3': '4:3',
                '16:9': '16:9',
                '18:9': '18:9',
                '21:9': '21:9',
            }"
        />
    </MyField>

    <div class="my-4 border-4 border-sonolus-ui-text-normal">
        <div
            ref="el"
            class="relative h-0 overflow-hidden"
            :style="{
                backgroundColor: data.data.color,
                paddingTop: `calc(100% / ${aspectRatioValue})`,
            }"
        >
            <div
                class="absolute top-0 h-full -translate-x-1/2 left-1/2"
                :style="{ width: `calc(100% * ${width})` }"
            >
                <div
                    class="
                        relative
                        h-0
                        overflow-hidden
                        -translate-y-1/2
                        top-1/2
                    "
                    :style="{
                        paddingTop: `calc(100% / ${data.data.aspectRatio})`,
                    }"
                >
                    <img
                        class="absolute top-0 left-0 w-full h-full"
                        :style="{ filter: `blur(${blurRadius}px)` }"
                        :src="data.image"
                    />
                </div>
            </div>
            <div
                class="absolute top-0 left-0 w-full h-full"
                :style="{ backgroundColor: data.configuration.mask }"
            />
        </div>
    </div>
</template>
