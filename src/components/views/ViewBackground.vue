<script setup lang="ts">
import { useElementBounding, useLocalStorage } from '@vueuse/core'
import { computed, ref, watchEffect } from 'vue'
import { useView } from '../../composables/view'
import { Background } from '../../core/background'
import { getImageInfo } from '../../core/utils'
import MyColorInput from '../ui/MyColorInput.vue'
import MyField from '../ui/MyField.vue'
import MyImageInput from '../ui/MyImageInput.vue'
import MyNumberInput from '../ui/MyNumberInput.vue'
import MyRangeInput from '../ui/MyRangeInput.vue'
import MySection from '../ui/MySection.vue'
import MyTextArea from '../ui/MyTextArea.vue'
import MyTextInput from '../ui/MyTextInput.vue'
import MyTextSelect from '../ui/MyTextSelect.vue'

const props = defineProps<{
    data: Background
}>()

const v = useView(props, 'backgrounds')

const imageAspectRatio = ref<number>()
watchEffect(async () => {
    try {
        const { width, height } = await getImageInfo(props.data.image)
        imageAspectRatio.value = width / height || undefined
    } catch (error) {
        imageAspectRatio.value = undefined
    }
})

const previewAspectRatio = useLocalStorage(
    'view.background.preview.aspectRatio',
    '16:9'
)
const previewAspectRatioValue = computed(
    () =>
        ({
            '4:3': 4 / 3,
            '16:9': 16 / 9,
            '18:9': 18 / 9,
            '21:9': 21 / 9,
        }[previewAspectRatio.value] || 16 / 9)
)

const previewWidth = computed(() => {
    const inverse = v.value.data.aspectRatio / previewAspectRatioValue.value
    const isLarger = v.value.data.aspectRatio >= previewAspectRatioValue.value
    switch (v.value.data.fit) {
        case 'width':
            return 1
        case 'height':
            return inverse
        case 'contain':
            return isLarger ? 1 : inverse
        case 'cover':
            return isLarger ? inverse : 1
        default:
            return 1
    }
})

const elPreview = ref<HTMLDivElement>()
const { height } = useElementBounding(elPreview)
const previewBlurRadius = computed(
    () => height.value * v.value.configuration.blur * 0.1
)
</script>

<template>
    <MySection header="Info">
        <MyField title="Title">
            <MyTextInput
                v-model="v.title"
                placeholder="Enter background title..."
                validate
            />
        </MyField>
        <MyField title="Subtitle">
            <MyTextInput
                v-model="v.subtitle"
                placeholder="Enter background subtitle..."
                validate
            />
        </MyField>
        <MyField title="Author">
            <MyTextInput
                v-model="v.author"
                placeholder="Enter background author..."
                validate
            />
        </MyField>
        <MyField title="Description">
            <MyTextArea
                v-model="v.description"
                placeholder="Enter background description..."
                validate
            />
        </MyField>
    </MySection>

    <MySection header="Thumbnail">
        <MyField title="Thumbnail">
            <MyImageInput v-model="v.thumbnail" fill validate />
        </MyField>
    </MySection>

    <MySection header="Image">
        <MyField title="Image">
            <MyImageInput v-model="v.image" validate />
        </MyField>
    </MySection>

    <MySection header="Data">
        <MyField title="Aspect Ratio">
            <MyNumberInput
                v-model="v.data.aspectRatio"
                :default-value="imageAspectRatio"
                placeholder="Enter background aspect ratio..."
            />
        </MyField>
        <MyField title="Fit">
            <MyTextSelect
                v-model="v.data.fit"
                default-value="height"
                :options="{
                    height: 'Height',
                    width: 'Width',
                    contain: 'Contain',
                    cover: 'Cover',
                }"
            />
        </MyField>
        <MyField title="Color">
            <MyColorInput
                v-model="v.data.color"
                default-value="#000"
                placeholder="Enter background color..."
                validate
            />
        </MyField>
    </MySection>

    <MySection header="Configuration">
        <MyField title="Blur">
            <MyRangeInput
                v-model="v.configuration.blur"
                :default-value="0"
                :min="0"
                :max="1"
                :step="0.05"
                percentage
            />
        </MyField>
        <MyField title="Mask">
            <MyColorInput
                v-model="v.configuration.mask"
                default-value="#0000"
                placeholder="Enter background mask..."
                alpha
                validate
            />
        </MyField>
    </MySection>

    <MySection header="Preview">
        <MyField title="Aspect Ratio">
            <MyTextSelect
                v-model="previewAspectRatio"
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
                ref="elPreview"
                class="relative h-0 overflow-hidden"
                :style="{
                    backgroundColor: v.data.color,
                    paddingTop: `calc(100% / ${previewAspectRatioValue})`,
                }"
            >
                <div
                    class="absolute top-0 h-full -translate-x-1/2 left-1/2"
                    :style="{ width: `calc(100% * ${previewWidth})` }"
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
                            paddingTop: `calc(100% / ${v.data.aspectRatio})`,
                        }"
                    >
                        <img
                            class="absolute top-0 left-0 w-full h-full"
                            :style="{ filter: `blur(${previewBlurRadius}px)` }"
                            :src="v.image"
                        />
                    </div>
                </div>
                <div
                    class="absolute top-0 left-0 w-full h-full"
                    :style="{ backgroundColor: v.configuration.mask }"
                />
            </div>
        </div>
    </MySection>
</template>
