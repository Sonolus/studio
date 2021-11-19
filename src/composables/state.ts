import { computed, reactive, toRef, watchEffect } from 'vue'
import { addProjectToWhitelist, newProject, Project } from '../core/project'
import { purge } from '../core/storage'

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

function updateView() {
    state.view = state.history[state.index].view
}

export function useState() {
    const project = computed(() => state.history[state.index])
    const canUndo = computed(() => state.index > 0)
    const canRedo = computed(() => state.index < state.history.length - 1)

    function clearUpdater() {
        state.updater = ''
    }

    function push(project: Project, updater = '') {
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

    function undo() {
        if (!canUndo.value) return

        updateView()
        state.index--
        clearUpdater()
    }

    function redo() {
        if (!canRedo.value) return

        state.index++
        updateView()
        clearUpdater()
    }

    const view = toRef(state, 'view')
    const isExplorerOpened = toRef(state, 'isExplorerOpened')

    return {
        project,
        canUndo,
        canRedo,

        clearUpdater,
        push,
        undo,
        redo,

        view,
        isExplorerOpened,
    }
}
