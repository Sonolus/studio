<script setup lang="ts">
import { useView } from '../../composables/view'
import { Skin } from '../../core/skin'
import MyField from '../ui/MyField.vue'
import MyImageInput from '../ui/MyImageInput.vue'
import MyNumberInput from '../ui/MyNumberInput.vue'
import MySection from '../ui/MySection.vue'
import MyToggle from '../ui/MyToggle.vue'

const props = defineProps<{
    data: Skin
}>()

const v = useView(
    props,
    'skins',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (v, view) => v.value.data.sprites.find(({ id }) => id === +view.value[3])!,
    (path) => (path.includes('transform') ? 0 : undefined)
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

    <MySection header="Transformation">
        <MyField title="x1.x1">
            <MyNumberInput
                v-model="v.transform.x1.x1"
                placeholder="Enter transformation x1.x1..."
            />
        </MyField>
    </MySection>

    {{ props.data }}
</template>
