<script setup lang="ts">
import { useView } from '../../composables/view'
import { Particle } from '../../core/particle'
import { Validator } from '../../core/validation'
import MyColorInput from '../ui/MyColorInput.vue';
import MyField from '../ui/MyField.vue'
import MyImageInput from '../ui/MyImageInput.vue';
import MyNumberInput from '../ui/MyNumberInput.vue';
import MySection from '../ui/MySection.vue'
import MyTextInput from '../ui/MyTextInput.vue';

const props = defineProps<{
    data: Particle
}>()

const v = useView(
    props,
    'particles',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (v, view) => v.value.data.effects.find(({ name }) => name === view.value[3])
        ?.groups[Number(view.value[4].substr("Group #".length + 1))]
        .particles[Number(view.value[5].substr("Sprite #".length + 1))]!,
)

const expressionValidator = (value: string) => {
    console.log(value)
    return false;
}
</script>

<template>
    <MySection header="Texture">
        <MyField title="Texture">
            <MyImageInput v-model="v.sprite" validate />
        </MyField>
        <MyField title="Color">
            <MyColorInput v-model="v.color" default-value="#000000" placeholder="Enter sprite color..." validate/>
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

    <MySection header="Expression">
        <h1 style="font-size: 25px; font-weight: 1000;">X</h1>
        <MyField title="From">
            <MyTextInput v-model="v.x.from" placeholder="Enter sprite x from expression..." validate v-validator=expressionValidator(v.x.from) />
        </MyField>
        <MyField title="To">
            <MyTextInput v-model="v.x.to" placeholder="Enter sprite x to expression..." validate v-validator=expressionValidator(v.x.to) />
        </MyField>
    </MySection>
</template>