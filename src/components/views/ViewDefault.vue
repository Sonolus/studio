<script setup lang="ts">
import { version } from 'sonolus-core'
import IconList from '../../icons/list-solid.svg?component'
</script>

<template>
    <div
        class="
            h-[calc(100vh-3.5rem)]
            flex flex-col
            items-center
            justify-center
            text-center
        "
    >
        <div class="text-2xl font-semibold">Sonolus Studio</div>
        <div>Version 0.4.1</div>
        <div class="text-xs">For Sonolus {{ version.sonolus }}</div>
        <div class="mt-16">
            Use
            <IconList class="icon inline-block ml-2 mr-1 my-2 sm:hidden" />
            Project Explorer to get started.
        </div>
        <div class="mt-16 text-xs sm:hidden text-sonolus-ui-text-disabled">
            For iOS users, please use Sonolus Studio in Safari.
        </div>
    </div>
</template>
