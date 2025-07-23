import { computed, type Ref, toRef } from 'vue'
import { type ProjectItemTypeOf } from '../core/project'
import { clone } from '../core/utils'
import { push, useState } from './state'

export function useView<T, U = T>(
    props: { data: T },
    type: ProjectItemTypeOf<T>,
    getter?: (v: Ref<T>, view: Ref<string[]>) => U,
): Ref<U> {
    const { project, view } = useState()

    const v = toRef(bind(props), 'data')
    return getter ? computed(() => getter(v, view)) : (v as never)

    function bind<T extends Record<string, unknown>>(data: T, path = [] as string[]): T {
        return new Proxy(data, {
            get(target, prop, receiver) {
                const keyPath = [...path, prop as string]

                const value = Reflect.get(target, prop, receiver)

                return typeof value === 'object'
                    ? bind(value as Record<string, unknown>, keyPath)
                    : value
            },
            set(target, prop, value, receiver) {
                const oldValue = Reflect.get(target, prop, receiver)
                if (oldValue === value) return true

                update([...path, prop as string], value)
                return true
            },
        })
    }

    function update(path: string[], value: unknown) {
        const newProps = clone(props)
        path.reduce(
            (data, key, index) =>
                index === path.length - 1
                    ? (data[key as never] = value as never)
                    : data[key as never],
            newProps,
        )

        const items = new Map(project.value[type] as never)
        items.set(view.value[1], newProps.data)

        push(
            {
                ...project.value,
                view: view.value,
                [type]: items,
            },
            path.join('.'),
        )
    }
}
