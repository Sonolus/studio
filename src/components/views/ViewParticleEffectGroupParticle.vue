<script setup lang="ts">
import { computed } from 'vue'
import { show } from '../../composables/modal'
import { useView } from '../../composables/view'
import { easings } from '../../core/ease'
import { type Particle } from '../../core/particle'
import { type PropertyExpression, allZero } from '../../core/property-expression'
import IconEdit from '../../icons/edit-solid.svg?component'
import ModalPropertyExpressionEquation from '../modals/ModalPropertyExpressionEquation.vue'
import MyButton from '../ui/MyButton.vue'
import MyCellNumberInput from '../ui/MyCellNumberInput.vue'
import MyColorInput from '../ui/MyColorInput.vue'
import MyField from '../ui/MyField.vue'
import MyNumberInput from '../ui/MyNumberInput.vue'
import MySection from '../ui/MySection.vue'
import MyTextSelect from '../ui/MyTextSelect.vue'
import PreviewParticleEffectGroupParticle from './previews/PreviewParticleEffectGroupParticle.vue'

const props = defineProps<{
    data: Particle
}>()

const v = useView(props, 'particles', (v, view) => {
    const effect = v.value.data.effects.find(({ name }) => name === view.value[3])

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return effect!.groups[+view.value[5]!]!.particles[+view.value[7]!]!
})

const spriteOptions = computed(() =>
    Object.fromEntries(
        props.data.data.sprites.map(({ id }, index) => [`Sprite #${index + 1}`, id]),
    ),
)

const easeOptions = Object.fromEntries(Object.keys(easings).map((k) => [k, k]))

const properties = ['x', 'y', 'w', 'h', 'r', 'a'] as const

const types = ['from', 'to'] as const

const cols = Object.keys(allZero) as (keyof PropertyExpression)[]

async function editEquation(p: (typeof properties)[number], t: (typeof types)[number]) {
    const result = await show(ModalPropertyExpressionEquation, {
        title: `${p}.${t}`,
        defaultValue: v.value[p][t],
    })
    if (!result) return

    v.value[p][t] = result
}
</script>

<template>
    <MySection header="Texture">
        <MyField title="Sprite">
            <MyTextSelect v-model="v.spriteId" :options="spriteOptions" />
        </MyField>
        <MyField title="Color">
            <MyColorInput
                v-model="v.color"
                default-value="#000000"
                placeholder="Enter sprite color..."
                validate
            />
        </MyField>
    </MySection>

    <MySection header="Time">
        <MyField title="Start">
            <MyNumberInput v-model="v.start" placeholder="Enter sprite start time..." validate />
        </MyField>
        <MyField title="Duration">
            <MyNumberInput v-model="v.duration" placeholder="Enter sprite duration..." validate />
        </MyField>
    </MySection>

    <MySection header="Property">
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
                <template v-for="p in properties" :key="p">
                    <tr v-for="t in types" :key="t" class="h-8">
                        <td class="px-2 py-0 text-lg font-semibold">{{ p }}.{{ t }}</td>
                        <td class="p-0">
                            <MyButton :icon="IconEdit" text="Edit" @click="editEquation(p, t)" />
                        </td>
                        <td v-for="c in cols" :key="c" class="p-0">
                            <MyCellNumberInput
                                v-model="v[p][t][c]"
                                class="w-16"
                                :placeholder="`${p}.${t}.${c}`"
                            />
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </MySection>

    <MySection header="Ease">
        <MyField v-for="p in properties" :key="p" :title="p">
            <MyTextSelect
                v-model="v[p].ease"
                :options="easeOptions"
                default-value="linear"
                validate
            />
        </MyField>
    </MySection>

    <MySection header="Preview">
        <PreviewParticleEffectGroupParticle :sprites="data.data.sprites" :particle="v" />
    </MySection>
</template>
