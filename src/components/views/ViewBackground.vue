<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useView } from '../../composables/view'
import { type Background } from '../../core/background'
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
import MyToggle from '../ui/MyToggle.vue'
import PreviewBackground from './previews/PreviewBackground.vue'

const props = defineProps<{
    data: Background
}>()

const v = useView(props, 'backgrounds')

const imageAspectRatio = ref<number>()
// eslint-disable-next-line @typescript-eslint/no-misused-promises
watchEffect(async () => {
    try {
        const { width, height } = await getImageInfo(props.data.image)
        imageAspectRatio.value = width / height || undefined
    } catch {
        imageAspectRatio.value = undefined
    }
})

const useNaturalAspectRatio = computed({
    get: () => v.value.data.aspectRatio === undefined,
    set: (value) => (v.value.data.aspectRatio = value ? undefined : imageAspectRatio.value),
})
</script>

<template>
    <MySection header="Info">
        <MyField title="Title">
            <MyTextInput v-model="v.title" placeholder="Enter background title..." validate />
        </MyField>
        <MyField title="Subtitle">
            <MyTextInput v-model="v.subtitle" placeholder="Enter background subtitle..." validate />
        </MyField>
        <MyField title="Author">
            <MyTextInput v-model="v.author" placeholder="Enter background author..." validate />
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
        <MyField title="Use Natural Aspect Ratio">
            <MyToggle v-model="useNaturalAspectRatio" :default-value="true" />
        </MyField>
        <MyField v-if="v.data.aspectRatio !== undefined" title="Aspect Ratio">
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
                    Height: 'height',
                    Width: 'width',
                    Contain: 'contain',
                    Cover: 'cover',
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
        <MyField title="Scope">
            <MyTextInput v-model="v.configuration.scope" placeholder="Enter background scope..." />
        </MyField>
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
        <PreviewBackground :background="data" />
    </MySection>
</template>
