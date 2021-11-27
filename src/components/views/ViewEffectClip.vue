<script setup lang="ts">
import { useView } from '../../composables/view'
import { Effect } from '../../core/effect'

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
    {{ v.id }}
    {{ v.clip }}
</template>
