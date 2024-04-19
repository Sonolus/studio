<script setup lang="ts">
import { useView } from '../../composables/view'
import { Particle } from '../../core/particle'
import MyField from '../ui/MyField.vue'
import MyNumberInput from '../ui/MyNumberInput.vue'
import MySection from '../ui/MySection.vue'
import PreviewParticleEffectGroup from './previews/PreviewParticleEffectGroup.vue'

const props = defineProps<{
    data: Particle
}>()

const v = useView(
    props,
    'particles',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (v, view) =>
        v.value.data.effects.find(({ name }) => name === view.value[3])!.groups[+view.value[5]],
)
</script>

<template>
    <MySection header="Group">
        <MyField title="Count">
            <MyNumberInput v-model="v.count" placeholder="Enter group count..." validate />
        </MyField>
    </MySection>

    <MySection header="Preview">
        <PreviewParticleEffectGroup :sprites="data.data.sprites" :group="v" />
    </MySection>
</template>
