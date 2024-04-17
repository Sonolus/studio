<script setup lang="ts">
import { show } from '../../composables/modal'
import { useView } from '../../composables/view'
import { Particle } from '../../core/particle'
import { TransformExpression, allZero } from '../../core/transform-expression'
import IconEdit from '../../icons/edit-solid.svg?component'
import ModalTransformExpressionEquation from '../modals/ModalTransformExpressionEquation.vue'
import MyButton from '../ui/MyButton.vue'
import MyCellNumberInput from '../ui/MyCellNumberInput.vue'
import MySection from '../ui/MySection.vue'
import PreviewParticleEffect from './previews/PreviewParticleEffect.vue'

const props = defineProps<{
    data: Particle
}>()

const v = useView(
    props,
    'particles',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (v, view) => v.value.data.effects.find(({ name }) => name === view.value[3])!,
)

const rows = ['x1', 'x2', 'x3', 'x4', 'y1', 'y2', 'y3', 'y4'] as const

const cols = Object.keys(allZero) as (keyof TransformExpression)[]

async function editEquation(r: (typeof rows)[number]) {
    const result = await show(ModalTransformExpressionEquation, {
        title: `${r}`,
        defaultValue: v.value.transform[r],
    })
    if (!result) return

    v.value.transform[r] = result
}
</script>

<template>
    <MySection header="Transformation">
        <table class="mx-auto block max-w-min overflow-x-auto text-center">
            <thead>
                <tr class="h-8">
                    <th class="p-0" />
                    <th class="p-0">Equation</th>
                    <th v-for="c in cols" :key="c" class="p-0 text-lg font-semibold">
                        {{ c }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="r in rows" :key="r" class="h-8">
                    <td class="px-2 py-0 text-lg font-semibold">{{ r }}</td>
                    <td class="p-0">
                        <MyButton :icon="IconEdit" text="Edit" @click="editEquation(r)" />
                    </td>
                    <td v-for="c in cols" :key="c" class="p-0">
                        <MyCellNumberInput
                            v-model="v.transform[r][c]"
                            class="w-16"
                            :placeholder="`${r}.${c}`"
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    </MySection>

    <MySection header="Preview">
        <PreviewParticleEffect
            :particle="data"
            :effect="v"
            :interpolation="data.data.interpolation"
        />
    </MySection>
</template>
