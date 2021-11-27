<script setup lang="ts">
import { useView } from '../../composables/view'
import { Effect } from '../../core/effect'
import MyAudioInput from '../ui/MyAudioInput.vue'
import MyField from '../ui/MyField.vue'
import MySection from '../ui/MySection.vue'

const props = defineProps<{
    data: Effect
}>()

const v = useView(props, 'effects', (v, view) => {
    const index = props.data.data.clips.findIndex(
        ({ id }) => id === +view.value[3]
    )
    return v.value.data.clips[index]
})
</script>

<template>
    <MySection header="Clip">
        <MyField title="Clip">
            <MyAudioInput v-model="v.clip" validate />
        </MyField>
    </MySection>
</template>
