<script setup lang="ts">
import { useView } from '../../composables/view'
import { Particle } from '../../core/particle'
import MyField from '../ui/MyField.vue'
import MyImageInput from '../ui/MyImageInput.vue'
import MySection from '../ui/MySection.vue'
import MyToggle from '../ui/MyToggle.vue'

const props = defineProps<{
    data: Particle
}>()

const v = useView(
    props,
    'particles',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (v, view) => v.value.data.sprites.find(({ id }) => id === view.value[3])!,
)
</script>

<template>
    <MySection header="Texture">
        <MyField title="Texture">
            <MyImageInput v-model="v.texture" validate />
        </MyField>
    </MySection>

    <MySection header="Padding">
        <MyField title="Left">
            <MyToggle v-model="v.padding.left" :default-value="true" />
        </MyField>
        <MyField title="Right">
            <MyToggle v-model="v.padding.right" :default-value="true" />
        </MyField>
        <MyField title="Top">
            <MyToggle v-model="v.padding.top" :default-value="true" />
        </MyField>
        <MyField title="Bottom">
            <MyToggle v-model="v.padding.bottom" :default-value="true" />
        </MyField>
    </MySection>
</template>
