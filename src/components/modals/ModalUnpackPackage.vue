<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useModals } from '../../composables/modal'
import { Project, unpackPackage } from '../../core/project'
import IconSpinner from '../../icons/spinner-solid.svg?component'
import IconTimes from '../../icons/times-solid.svg?component'
import MyButton from '../ui/MyButton.vue'
import ModalBase from './ModalBase.vue'
import ModalErrorCancel from './ModalErrorCancel.vue'

const props = defineProps<{
    data: File
}>()

const emit = defineEmits<{
    (e: 'close', result?: Project): void
}>()

const description = ref<string>()
const aborted = ref(false)

const { show } = useModals()

onMounted(async () => {
    const { project, tasks, finish } = unpackPackage(props.data)

    try {
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i]

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
        show(ModalErrorCancel, { message: error })
        emit('close')
    }
})

onUnmounted(() => (aborted.value = true))
</script>

<template>
    <ModalBase :icon="IconSpinner" title="Unpacking Package">
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