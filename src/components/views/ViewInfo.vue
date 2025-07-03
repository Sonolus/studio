<script setup lang="ts">
import { computed } from 'vue'
import { push, useState } from '../../composables/state'
import MyField from '../ui/MyField.vue'
import MyImageInput from '../ui/MyImageInput.vue'
import MySection from '../ui/MySection.vue'
import MyTextArea from '../ui/MyTextArea.vue'
import MyTextInput from '../ui/MyTextInput.vue'

defineProps<{ data: unknown }>()

const { project, view } = useState()

const update = (key: 'title' | 'description' | 'banner', value: string) => {
    push(
        {
            ...project.value,
            [key]: value,
            view: view.value,
        },
        key,
    )
}

const title = computed({
    get: () => project.value.title,
    set: (value) => update('title', value),
})

const description = computed({
    get: () => project.value.description,
    set: (value) => update('description', value),
})

const banner = computed({
    get: () => project.value.banner,
    set: (value) => update('banner', value),
})
</script>

<template>
    <MySection header="Info">
        <MyField title="Title">
            <MyTextInput v-model="title" placeholder="Enter title..." validate />
        </MyField>
        <MyField title="Description">
            <MyTextArea v-model="description" placeholder="Enter description..." />
        </MyField>
        <MyField title="Banner">
            <MyImageInput v-model="banner" fill />
        </MyField>
    </MySection>
</template>
