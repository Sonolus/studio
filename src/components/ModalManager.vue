<script setup lang="ts">
import { useModal } from '../composables/modal'

const { modal } = useModal()
</script>

<template>
    <Transition
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        enter-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        leave-active-class="transition-opacity duration-200 pointer-events-none mt-1"
    >
        <div v-if="modal" class="fixed left-0 top-0 z-50 h-full w-full">
            <div class="absolute h-full w-full bg-sonolus-main opacity-90" />
            <div
                class="absolute flex h-full w-full flex-col items-center justify-center p-4"
                @click.self="modal.resolve()"
            >
                <component
                    :is="modal.component"
                    class="w-full flex-none sm:w-96"
                    :data="modal.data"
                    @close="modal.resolve"
                />
            </div>
        </div>
    </Transition>
</template>
