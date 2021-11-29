<script setup lang="ts">
import { useView } from '../../composables/view'
import { Skin } from '../../core/skin'

const props = defineProps<{
    data: Skin
}>()

const v = useView(props, 'skins', (v, view) => {
    const index = props.data.data.sprites.findIndex(
        ({ id }) => id === +view.value[3]
    )
    return v.value.data.sprites[index]
})
</script>

<template>
    {{ v.id }}
</template>
