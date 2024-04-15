<script setup lang="ts">
import { useView } from '../../composables/view'
import { Particle } from '../../core/particle'
import MyField from '../ui/MyField.vue'
import MyNumberInput from '../ui/MyNumberInput.vue'
import MySection from '../ui/MySection.vue'

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
    <MySection header="Execute">
        <MyField title="Count">
            <MyNumberInput v-model="v.count" placeholder="Enter execute count..." validate />
        </MyField>
    </MySection>
</template>
