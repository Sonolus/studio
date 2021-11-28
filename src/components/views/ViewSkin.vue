<script setup lang="ts">
import { useView } from '../../composables/view'
import { Skin } from '../../core/skin'
import MyField from '../ui/MyField.vue'
import MyImageInput from '../ui/MyImageInput.vue'
import MySection from '../ui/MySection.vue'
import MyTextArea from '../ui/MyTextArea.vue'
import MyTextInput from '../ui/MyTextInput.vue'
import MyToggle from '../ui/MyToggle.vue'

const props = defineProps<{
    data: Skin
}>()

const v = useView(props, 'skins')
</script>

<template>
    <MySection header="Info">
        <MyField title="Title">
            <MyTextInput
                v-model="v.title"
                placeholder="Enter skin title..."
                validate
            />
        </MyField>
        <MyField title="Subtitle">
            <MyTextInput
                v-model="v.subtitle"
                placeholder="Enter skin subtitle..."
                validate
            />
        </MyField>
        <MyField title="Author">
            <MyTextInput
                v-model="v.author"
                placeholder="Enter skin author..."
                validate
            />
        </MyField>
        <MyField title="Description">
            <MyTextArea
                v-model="v.description"
                placeholder="Enter skin description..."
                validate
            />
        </MyField>
    </MySection>

    <MySection header="Thumbnail">
        <MyField title="Thumbnail">
            <MyImageInput v-model="v.thumbnail" fill validate />
        </MyField>
    </MySection>

    <MySection header="Data">
        <MyField title="Interpolation">
            <MyToggle v-model="v.data.interpolation" :default-value="true" />
        </MyField>
    </MySection>
</template>
