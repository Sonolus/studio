<script setup lang="ts">
import { show } from '../../composables/modal'
import { useView } from '../../composables/view'
import { Skin } from '../../core/skin'
import IconVectorSquare from '../../icons/vector-square-solid.svg?component'
import ModalSimpleTransform from '../modals/ModalSimpleTransform.vue'
import MyButton from '../ui/MyButton.vue'
import MyCellNumberInput from '../ui/MyCellNumberInput.vue'
import MyField from '../ui/MyField.vue'
import MyImageInput from '../ui/MyImageInput.vue'
import MySection from '../ui/MySection.vue'
import MyToggle from '../ui/MyToggle.vue'
import PreviewSkinSprite from './previews/PreviewSkinSprite.vue'

const props = defineProps<{
    data: Skin
}>()

const v = useView(
    props,
    'skins',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (v, view) => v.value.data.sprites.find(({ name }) => name === view.value[3])!,
)

const keys = ['x1', 'x2', 'x3', 'x4', 'y1', 'y2', 'y3', 'y4'] as const

async function onSetSimpleTransform() {
    const transform = await show(ModalSimpleTransform, null)
    if (!transform) return

    v.value.transform = transform
}
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
        <table class="mx-auto block max-w-min overflow-x-auto text-center">
            <thead>
                <tr class="h-8">
                    <th class="p-0" />
                    <th v-for="i in keys" :key="i" class="p-0 text-lg font-semibold">
                        {{ i }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="i in keys" :key="i" class="h-8">
                    <td class="px-2 py-0 text-lg font-semibold">{{ i }}</td>
                    <td v-for="j in keys" :key="j" class="p-0">
                        <MyCellNumberInput
                            v-model="v.transform[i][j]"
                            class="w-16"
                            :placeholder="`${i}.${j}`"
                        />
                    </td>
                </tr>
            </tbody>
        </table>

        <MyButton
            class="mx-auto mt-4"
            :icon="IconVectorSquare"
            text="Set Simple Transform"
            @click="onSetSimpleTransform()"
        />
    </MySection>

    <MySection header="Preview">
        <PreviewSkinSprite :sprite="v" :interpolation="data.data.interpolation" />
    </MySection>
</template>
