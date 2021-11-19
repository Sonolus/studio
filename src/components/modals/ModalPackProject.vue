<script setup lang="ts">
import { saveAs } from 'file-saver'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useModals } from '../../composables/modal'
import { useState } from '../../composables/state'
import { packProject } from '../../core/project'
import IconSpinner from '../../icons/spinner-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import ModalBase from './ModalBase.vue'
import ModalErrorCancelVue from './ModalErrorCancel.vue'

defineProps<{
    data: null
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const description = ref<string>()
const aborted = ref(false)

const { project } = useState()
const { show } = useModals()

onMounted(async () => {
    const { tasks, finish } = packProject(project.value)

    try {
        let i = 0
        for (const task of tasks) {
            i++
            description.value = `${task.description} (${i}/${tasks.length})`
            await nextTick()
            await task.execute()

            if (aborted.value) return
        }

        description.value = 'Completed.'
        await nextTick()

        saveAs(await finish(), 'project.scp')
    } catch (error) {
        show(ModalErrorCancelVue, { message: error })
    }
    emit('close')
})

onUnmounted(() => (aborted.value = true))
</script>

<template>
    <ModalBase :icon="IconSpinner" title="Packing Project">
        {{ description }}

        <template #actions>
            <MyButton
                class="w-24"
                :icon="IconTimes"
                text="Cancel"
                auto-focus
                @click="$emit('close')"
            />
        </template>
    </ModalBase>
</template>
