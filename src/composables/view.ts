import { toRef } from 'vue'
import { ProjectItemTypeOf } from '../core/project'
import { useState } from './state'

export function useView<T>(props: { data: T }, type: ProjectItemTypeOf<T>) {
    const { project, push, view } = useState()

    return toRef(bind(props), 'data')

    function bind<T extends Record<string, unknown>>(
        data: T,
        path = [] as string[]
    ) {
        const output = {}
        for (const key in data) {
            const keyPath = [...path, key]
            Object.defineProperty(output, key, {
                get: () => {
                    const value = data[key]
                    return typeof value === 'object'
                        ? bind(value as Record<string, unknown>, keyPath)
                        : value
                },
                set: (value) => {
                    const oldValue = data[key]
                    if (oldValue === value) return

                    update(keyPath, value)
                },
            })
        }
        return output as T
    }

    function update(path: string[], value: unknown) {
        const newProps = JSON.parse(JSON.stringify(props))
        path.reduce(
            (data, key, index) =>
                index === path.length - 1 ? (data[key] = value) : data[key],
            newProps
        )

        const items = new Map(project.value[type])
        items.set(view.value[1], newProps.data)

        push(
            {
                ...project.value,
                view: view.value,
                [type]: items,
            },
            path.join('.')
        )
    }
}
