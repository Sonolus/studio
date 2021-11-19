<script setup lang="ts">
import { useModals } from '../composables/modal'

const { modals } = useModals()
</script>

<template>
    <template v-for="(modal, index) in modals" :key="index">
        <div class="fixed top-0 left-0 z-50 w-full h-full">
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
    </template>
</template>
