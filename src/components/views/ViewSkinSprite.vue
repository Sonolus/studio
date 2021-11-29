<script setup lang="ts">
import { useView } from '../../composables/view'
import { Skin } from '../../core/skin'
import MyField from '../ui/MyField.vue'
import MyImageInput from '../ui/MyImageInput.vue'
import MySection from '../ui/MySection.vue'

const props = defineProps<{
    data: Skin
}>()

const v = useView(props, 'skins', (v, view) => {
    const index = props.data.data.sprites.findIndex(
        ({ id }) => id === +view.value[3]
    )
    return v.value.data.sprites[index]
})
</script>

<template>
    <MySection header="Texture">
        <MyField title="Texture">
            <MyImageInput v-model="v.texture" validate />
        </MyField>
    </MySection>
</template>
