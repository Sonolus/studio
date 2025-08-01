<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { show } from '../../composables/modal'
import { type Project, unpackPackage } from '../../core/project'
import IconSpinner from '../../icons/spinner-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import ModalBase from './ModalBase.vue'
import ModalErrorCancel from './ModalErrorCancel.vue'

const props = defineProps<{
    data: File
}>()

const emit = defineEmits<{
    close: [result?: Project]
}>()

const el = ref<HTMLCanvasElement>()
const description = ref<string>()
const aborted = ref(false)

onMounted(async () => {
    while (!el.value) {
        await nextTick()
    }

    const { project, tasks, finish } = unpackPackage(props.data, el.value)

    try {
        for (const [i, task] of tasks.entries()) {
            description.value = `${task.description} (${i + 1}/${tasks.length})`
            await nextTick()
            await task.execute()

            if (aborted.value) return
        }

        description.value = 'Completed.'
        await nextTick()

        await finish()
        emit('close', project)
    } catch (error) {
        void show(ModalErrorCancel, { message: error })
        emit('close')
    }
})

onUnmounted(() => (aborted.value = true))
</script>

<template>
    <ModalBase :icon="IconSpinner" title="Unpacking Package">
        {{ description }}

        <canvas ref="el" class="hidden" />

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
