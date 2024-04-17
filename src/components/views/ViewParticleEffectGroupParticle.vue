<script setup lang="ts">
import { computed } from 'vue'
import { useView } from '../../composables/view'
import { easings } from '../../core/ease'
import { Particle } from '../../core/particle'
import MyCellNumberInput from '../ui/MyCellNumberInput.vue'
import MyColorInput from '../ui/MyColorInput.vue'
import MyField from '../ui/MyField.vue'
import MyNumberInput from '../ui/MyNumberInput.vue'
import MySection from '../ui/MySection.vue'
import MyTextSelect from '../ui/MyTextSelect.vue'

const props = defineProps<{
    data: Particle
}>()

const v = useView(
    props,
    'particles',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (v, view) =>
        v.value.data.effects.find(({ name }) => name === view.value[3])!.groups[+view.value[5]]
            .particles[+view.value[7]],
)

const spriteOptions = computed(() =>
    Object.fromEntries(
        props.data.data.sprites.map(({ id }, index) => [`Sprite #${index + 1}`, id]),
    ),
)

const easeOptions = Object.fromEntries(Object.keys(easings).map((k) => [k, k]))

const properties = ['x', 'y', 'w', 'h', 'r', 'a'] as const

const types = ['from', 'to'] as const

const cols = [
    'c',
    'r1',
    'r2',
    'r3',
    'r4',
    'r5',
    'r6',
    'r7',
    'r8',
    'sinr1',
    'sinr2',
    'sinr3',
    'sinr4',
    'sinr5',
    'sinr6',
    'sinr7',
    'sinr8',
    'cosr1',
    'cosr2',
    'cosr3',
    'cosr4',
    'cosr5',
    'cosr6',
    'cosr7',
    'cosr8',
] as const
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
                    <th v-for="c in cols" :key="c" class="p-0 text-lg font-semibold">
                        {{ c }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <template v-for="p in properties" :key="p">
                    <tr v-for="t in types" :key="t" class="h-8">
                        <td class="px-2 py-0 text-lg font-semibold">{{ p }}.{{ t }}</td>
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
</template>
