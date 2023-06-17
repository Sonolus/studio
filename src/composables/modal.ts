import { computed, markRaw, reactive } from 'vue'

type ModalComponent<T, U> = new () => {
    $props: { data: T }
    $emit: (event: 'close', result: U) => void
}

const modals = reactive<
    {
        component: unknown
        data: unknown
        resolve: (result?: unknown) => void
    }[]
>([])

export function useModal() {
    const modal = computed(() => modals[0])

    return {
        modal,
    }
}

export function show<T, U>(component: ModalComponent<T, U>, data: T) {
    return new Promise<U | undefined>((resolve) => {
        const modal = {
            component: markRaw(component),
            data,
            resolve(result?: unknown) {
                modals.splice(modals.indexOf(modal), 1)
                resolve(result as U)
            },
        }
        modals.push(modal)
    })
}
