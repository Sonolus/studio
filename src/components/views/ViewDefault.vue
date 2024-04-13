<script setup lang="ts">
import { version } from '@sonolus/core'
import IconList from '../../icons/list-solid.svg?component'

const appVersion = VITE_APP_VERSION
</script>

<template>
    <div class="flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center text-center">
        <div class="text-2xl font-semibold">Sonolus Studio</div>
        <div>Version {{ appVersion }}</div>
        <div class="text-xs">For Sonolus {{ version.sonolus }}</div>
        <div class="mt-16">
            Use
            <IconList class="icon my-2 ml-2 mr-1 inline-block sm:hidden" />
            Project Explorer to get started.
        </div>
        <div class="mt-16 text-xs text-sonolus-ui-text-disabled sm:hidden">
            For iOS users, please use Sonolus Studio in Safari.
        </div>
    </div>
</template>
