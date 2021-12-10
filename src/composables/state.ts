import { computed, reactive, toRef, watchEffect } from 'vue'
import { addProjectToWhitelist, newProject, Project } from '../core/project'
import { purge } from '../core/storage'

export type UseStateReturn = ReturnType<typeof useState>

const state = reactive({
    index: 0,
    history: [newProject()],

    updater: '',
    updaterTime: Number.NEGATIVE_INFINITY,

    view: [] as string[],
    isExplorerOpened: false,
})

watchEffect(() => {
    const whitelist = new Set<string>()
    state.history.forEach((project) =>
        addProjectToWhitelist(project, whitelist)
    )
    purge(whitelist)
})

export function useState() {
    const project = computed(() => state.history[state.index])
    const canUndo = computed(() => state.index > 0)
    const canRedo = computed(() => state.index < state.history.length - 1)

    const view = toRef(state, 'view')
    const isExplorerOpened = toRef(state, 'isExplorerOpened')

    return {
        project,
        canUndo,
        canRedo,

        view,
        isExplorerOpened,
    }
}

export function clearUpdater() {
    state.updater = ''
}

export function push(project: Project, updater = '') {
    state.history.length = state.index + 1

    const now = Date.now().valueOf()
    if (
        updater &&
        state.updater === updater &&
        now - state.updaterTime < 2000
    ) {
        state.history[state.index] = project
    } else {
        if (state.history.length > 50) state.history.shift()

        state.history.push(project)
        state.index = state.history.length - 1
    }

    updateView()
    state.updater = updater
    state.updaterTime = now
}

export function replace(project: Project) {
    state.history.length = 0
    state.history.push(project)
    state.index = 0

    state.view = []
    clearUpdater()
}

export function undo() {
    if (state.index <= 0) return

    updateView()
    state.index--
    clearUpdater()
}

export function redo() {
    if (state.index >= state.history.length - 1) return

    state.index++
    updateView()
    clearUpdater()
}

function updateView() {
    state.view = state.history[state.index].view
}
