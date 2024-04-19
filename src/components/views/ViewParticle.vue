<script setup lang="ts">
import { useView } from '../../composables/view'
import { Particle } from '../../core/particle'
import MyField from '../ui/MyField.vue'
import MyImageInput from '../ui/MyImageInput.vue'
import MySection from '../ui/MySection.vue'
import MyTextArea from '../ui/MyTextArea.vue'
import MyTextInput from '../ui/MyTextInput.vue'
import MyToggle from '../ui/MyToggle.vue'

const props = defineProps<{
    data: Particle
}>()

const v = useView(props, 'particles')
</script>

<template>
    <MySection header="Info">
        <MyField title="Title">
            <MyTextInput v-model="v.title" placeholder="Enter particle title..." validate />
        </MyField>
        <MyField title="Subtitle">
            <MyTextInput v-model="v.subtitle" placeholder="Enter particle subtitle..." validate />
        </MyField>
        <MyField title="Author">
            <MyTextInput v-model="v.author" placeholder="Enter particle author..." validate />
        </MyField>
        <MyField title="Description">
            <MyTextArea
                v-model="v.description"
                placeholder="Enter particle description..."
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
