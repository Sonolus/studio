<script setup lang="ts">
import { useView } from '../../composables/view'
import { type Effect } from '../../core/effect'
import MyAudioInput from '../ui/MyAudioInput.vue'
import MyField from '../ui/MyField.vue'
import MySection from '../ui/MySection.vue'

const props = defineProps<{
    data: Effect
}>()

const v = useView(
    props,
    'effects',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (v, view) => v.value.data.clips.find(({ name }) => name === view.value[3])!,
)
</script>

<template>
    <MySection header="Clip">
        <MyField title="Clip">
            <MyAudioInput v-model="v.url" validate />
        </MyField>
    </MySection>
</template>
