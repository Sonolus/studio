<script setup lang="ts">
import { useView } from '../../composables/view'
import { Particle, varName, ease } from '../../core/particle'
import MyColorInput from '../ui/MyColorInput.vue';
import MyField from '../ui/MyField.vue'
import MyImageInput from '../ui/MyImageInput.vue';
import MyNumberInput from '../ui/MyNumberInput.vue';
import MySection from '../ui/MySection.vue'
import MyTextInput from '../ui/MyTextInput.vue';
import MyTextSelect from '../ui/MyTextSelect.vue';

const props = defineProps<{
    data: Particle
}>()

const v = useView(
    props,
    'particles',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (v, view) => v.value.data.effects.find(({ name }) => name === view.value[3])
        ?.groups[Number(view.value[4].substr("Group #".length))]
        .particles[Number(view.value[5].substr("Sprite #".length))]!
)

const validator = (value: string) => {
    let seperator = /\+|-/;
    let arr = value.split(seperator);
    for (let i = 0; i < arr.length; i++) {
        let arr2 = arr[i].split('*');
        let nan = 0;
        for (let j = 0; j < arr2.length; j++) {
            if (isNaN(Number(arr2[j]))) {
                nan++;
                console.log(arr2[j])
                if (varName.includes(arr2[j]) == false) return false;
            }
        }
        if (nan > 1) return false;
    }
    return true;
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

    <MySection header="X Coordinate">
        <MyField title="From">
            <MyTextInput v-model="v.x.from" placeholder="Enter sprite x coordinate from expression..." validate :validator="validator" />
        </MyField>
        <MyField title="To">
            <MyTextInput v-model="v.x.to" placeholder="Enter sprite x coordinate to expression..." validate :validator="validator" />
        </MyField>
        <MyField title="Ease">
            <MyTextSelect v-model="v.x.ease" :options="ease" :default-value="v.x.ease" validate />
        </MyField>
    </MySection>
    <MySection header="Y Coordinate">
        <MyField title="From">
            <MyTextInput v-model="v.y.from" placeholder="Enter sprite y coordinate from expression..." validate :validator="validator" />
        </MyField>
        <MyField title="To">
            <MyTextInput v-model="v.y.to" placeholder="Enter sprite y coordinate to expression..." validate :validator="validator" />
        </MyField>
        <MyField title="Ease">
            <MyTextSelect v-model="v.y.ease" :options="ease" :default-value="v.y.ease" validate />
        </MyField>
    </MySection>
    <MySection header="Width">
        <MyField title="From">
            <MyTextInput v-model="v.w.from" placeholder="Enter sprite width from expression..." validate :validator="validator" />
        </MyField>
        <MyField title="To">
            <MyTextInput v-model="v.w.to" placeholder="Enter sprite width to expression..." validate :validator="validator" />
        </MyField>
        <MyField title="Ease">
            <MyTextSelect v-model="v.w.ease" :options="ease" :default-value="v.w.ease" validate />
        </MyField>
    </MySection>
    <MySection header="Height">
        <MyField title="From">
            <MyTextInput v-model="v.h.from" placeholder="Enter sprite height from expression..." validate :validator="validator" />
        </MyField>
        <MyField title="To">
            <MyTextInput v-model="v.h.to" placeholder="Enter sprite height to expression..." validate :validator="validator" />
        </MyField>
        <MyField title="Ease">
            <MyTextSelect v-model="v.h.ease" :options="ease" :default-value="v.h.ease" validate />
        </MyField>
    </MySection>
    <MySection header="Rotation">
        <MyField title="From">
            <MyTextInput v-model="v.r.from" placeholder="Enter sprite rotation from expression..." validate :validator="validator" />
        </MyField>
        <MyField title="To">
            <MyTextInput v-model="v.r.to" placeholder="Enter sprite rotation to expression..." validate :validator="validator" />
        </MyField>
        <MyField title="Ease">
            <MyTextSelect v-model="v.r.ease" :options="ease" :default-value="v.r.ease" validate />
        </MyField>
    </MySection>
    <MySection header="Alpha">
        <MyField title="From">
            <MyTextInput v-model="v.a.from" placeholder="Enter sprite alpha from expression..." validate :validator="validator" />
        </MyField>
        <MyField title="To">
            <MyTextInput v-model="v.a.to" placeholder="Enter sprite alpha to expression..." validate :validator="validator" />
        </MyField>
        <MyField title="Ease">
            <MyTextSelect v-model="v.a.ease" :options="ease" :default-value="v.a.ease" validate />
        </MyField>
    </MySection>
</template>