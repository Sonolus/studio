<script setup lang="ts">
import { useModals } from '../composables/modal'

const { modal } = useModals()
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
        <div v-if="modal" class="fixed top-0 left-0 z-50 w-full h-full">
            <div class="absolute w-full h-full bg-sonolus-main opacity-90" />
            <div
                class="
                    absolute
                    flex flex-col
                    items-center
                    justify-center
                    w-full
                    h-full
                    p-4
                "
                @click.self="modal.resolve()"
            >
                <component
                    :is="modal.component"
                    class="flex-none w-full sm:w-96"
                    :data="modal.data"
                    @close="modal.resolve"
                />
            </div>
        </div>
    </Transition>
</template>
