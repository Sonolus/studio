import { ParticleEffectName } from '@sonolus/core'
import { markRaw } from 'vue'
import { ExplorerItem, isOpened, onClone, onDelete, onDeleteAll, onNew, onRename } from '.'
import ModalName from '../../components/modals/ModalName.vue'
import { newId } from '../../core/id'
import {
    formatParticleEffectName,
    newParticle,
    newParticleEffect,
    newParticleEffectGroup,
    newParticleEffectGroupParticle,
    newParticleSprite,
} from '../../core/particle'
import { clone } from '../../core/utils'
import IconClone from '../../icons/clone-solid.svg?component'
import IconFileImage from '../../icons/file-image-solid.svg?component'
import IconFolder from '../../icons/folder-solid.svg?component'
import IconParticle from '../../icons/particle.svg?component'
import IconPlus from '../../icons/plus-solid.svg?component'
import { show } from '../modal'
import { UseStateReturn, push } from '../state'

export function addParticleItems(state: UseStateReturn, items: ExplorerItem[]) {
    items.push({
        level: 0,
        path: ['particles'],
        hasChildren: true,
        icon: IconParticle,
        title: `Particles (${state.project.value.particles.size})`,
        onNew: () =>
            onNew(state, 'particles', 'New Particle', 'Enter particle name...', newParticle()),
        onDelete: () => onDeleteAll(state, 'particles'),
    })

    if (!isOpened(['particles'])) return
    state.project.value.particles.forEach((particle, name) => {
        items.push({
            level: 1,
            path: ['particles', name],
            hasChildren: true,
            icon: particle.thumbnail,
            title: name,
            onRename: () =>
                onRename(state, 'particles', 'Rename Particle', 'Enter new particle name...', name),
            onClone: () =>
                onClone(state, 'particles', 'Clone Particle', 'Enter new particle name...', name),
            onDelete: () => onDelete(state, 'particles', name),
        })

        if (!isOpened(['particles', name])) return

        items.push({
            level: 2,
            path: ['particles', name, 'sprites'],
            hasChildren: true,
            icon: IconFolder,
            title: `Sprites (${particle.data.sprites.length})`,
            onNew: () => onNewParticleSprite(state, name),
            onDelete: () => onDeleteParticleSprites(state, name),
        })
        if (isOpened(['particles', name, 'sprites'])) {
            particle.data.sprites.forEach(({ id: spriteId, texture }, index) => {
                items.push({
                    level: 3,
                    path: ['particles', name, 'sprites', spriteId],
                    hasChildren: false,
                    icon: texture,
                    fallback: IconFileImage,
                    title: `Sprite #${index + 1}`,
                    onDelete: () => onDeleteParticleSprite(state, name, spriteId),
                })
            })
        }

        items.push({
            level: 2,
            path: ['particles', name, 'effects'],
            hasChildren: true,
            icon: IconFolder,
            title: `Effects (${particle.data.effects.length})`,
            onNew: () => onNewParticleEffect(state, name),
            onDelete: () => onDeleteParticleEffects(state, name),
        })
        if (isOpened(['particles', name, 'effects'])) {
            particle.data.effects.forEach(({ name: effectName, groups }) => {
                items.push({
                    level: 3,
                    path: ['particles', name, 'effects', effectName],
                    hasChildren: true,
                    icon: IconParticle,
                    fallback: IconFileImage,
                    title: formatParticleEffectName(effectName),
                    onNew: () => onNewParticleEffectGroup(state, name, effectName),
                    onRename: () => onRenameParticleEffect(state, name, effectName),
                    onClone: () => onCloneParticleEffect(state, name, effectName),
                    onDelete: () => onDeleteParticleEffect(state, name, effectName),
                })

                if (!isOpened(['particles', name, 'effects', effectName])) return
                groups.forEach(({ particles }, groupIndex) => {
                    items.push({
                        level: 4,
                        path: ['particles', name, 'effects', effectName, 'groups', `${groupIndex}`],
                        hasChildren: true,
                        icon: IconFolder,
                        title: `Group #${groupIndex}`,
                        onNew: () =>
                            onNewParticleEffectGroupParticle(state, name, effectName, groupIndex),
                        onClone: () =>
                            onCloneParticleEffectGroup(state, name, effectName, groupIndex),
                        onDelete: () =>
                            onDeleteParticleEffectGroup(state, name, effectName, groupIndex),
                    })

                    if (
                        !isOpened([
                            'particles',
                            name,
                            'effects',
                            effectName,
                            'groups',
                            `${groupIndex}`,
                        ])
                    )
                        return
                    particles.forEach(({ spriteId }, particleIndex) => {
                        items.push({
                            level: 5,
                            path: [
                                'particles',
                                name,
                                'effects',
                                effectName,
                                'groups',
                                `${groupIndex}`,
                                'particles',
                                `${particleIndex}`,
                            ],
                            hasChildren: false,
                            icon:
                                particle.data.sprites.find(({ id }) => id === spriteId)?.texture ??
                                '',
                            fallback: IconFileImage,
                            title: `Particle #${particleIndex}`,
                            onClone: () =>
                                onCloneParticleEffectGroupParticle(
                                    state,
                                    name,
                                    effectName,
                                    groupIndex,
                                    particleIndex,
                                ),
                            onDelete: () =>
                                onDeleteParticleEffectGroupParticle(
                                    state,
                                    name,
                                    effectName,
                                    groupIndex,
                                    particleIndex,
                                ),
                        })
                    })
                })
            })
        }
    })
}

async function onNewParticleSprite({ project }: UseStateReturn, name: string) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const spriteId = newId()

    const newParticle = clone(particle)
    newParticle.data.sprites.push(newParticleSprite(spriteId))

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view: ['particles', name, 'sprites', spriteId],
        particles,
    })
}

async function onNewParticleEffect({ project, isExplorerOpened }: UseStateReturn, name: string) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const effectName = await show(ModalName, {
        icon: markRaw(IconPlus),
        title: 'New Particle Effect',
        names: ParticleEffectName,
        defaultValue: ParticleEffectName.LaneLinear,
        validator: (value) => !!value && !particle.data.effects.some(({ name }) => name === value),
    })
    if (!effectName) return

    const newParticle = clone(particle)
    newParticle.data.effects.push(newParticleEffect(effectName))

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view: ['particles', name, 'effects', effectName],
        particles,
    })

    isExplorerOpened.value = false
}

async function onNewParticleEffectGroup(
    { project }: UseStateReturn,
    name: string,
    effectName: string,
) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const effect = particle.data.effects.find(({ name }) => name === effectName)
    if (!effect) throw 'Particle Effect not found'

    const newEffect = clone(effect)
    newEffect.groups.push(newParticleEffectGroup())

    const newParticle = clone(particle)
    newParticle.data.effects = newParticle.data.effects.map((effect) =>
        effect.name === effectName ? newEffect : effect,
    )

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view: ['particles', name, 'effects', effectName, 'groups', `${effect.groups.length}`],
        particles,
    })
}

async function onNewParticleEffectGroupParticle(
    { project }: UseStateReturn,
    name: string,
    effectName: string,
    groupIndex: number,
) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const effect = particle.data.effects.find(({ name }) => name === effectName)
    if (!effect) throw 'Particle Effect not found'

    const group = effect.groups[groupIndex]
    if (!group) throw 'Particle Effect Group not found'

    const newGroup = clone(group)
    newGroup.particles.push(newParticleEffectGroupParticle())

    const newEffect = clone(effect)
    newEffect.groups[groupIndex] = newGroup

    const newParticle = clone(particle)
    newParticle.data.effects = newParticle.data.effects.map((effect) =>
        effect.name === effectName ? newEffect : effect,
    )

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view: [
            'particles',
            name,
            'effects',
            effectName,
            'groups',
            `${groupIndex}`,
            'particles',
            `${group.particles.length}`,
        ],
        particles,
    })
}

async function onDeleteParticleSprites({ project }: UseStateReturn, name: string) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'
    if (!particle.data.sprites.length) return

    const newParticle = clone(particle)
    newParticle.data.sprites = []
    newParticle.data.effects.forEach((effect) => {
        effect.groups.forEach((group) => {
            group.particles.forEach((particle) => {
                particle.spriteId = ''
            })
        })
    })

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view: [],
        particles,
    })
}

async function onDeleteParticleSprite({ project }: UseStateReturn, name: string, spriteId: string) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const newParticle = clone(particle)
    newParticle.data.sprites = newParticle.data.sprites.filter(({ id }) => id !== spriteId)
    newParticle.data.effects.forEach((effect) => {
        effect.groups.forEach((group) => {
            group.particles.forEach((particle) => {
                if (particle.spriteId === spriteId) {
                    particle.spriteId = ''
                }
            })
        })
    })

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view: [],
        particles,
    })
}

async function onDeleteParticleEffects({ project }: UseStateReturn, name: string) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'
    if (!particle.data.effects.length) return

    const newParticle = clone(particle)
    newParticle.data.effects = []

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view: [],
        particles,
    })
}

async function onDeleteParticleEffect(
    { project }: UseStateReturn,
    name: string,
    effectName: string,
) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const newParticle = clone(particle)
    newParticle.data.effects = newParticle.data.effects.filter(({ name }) => name !== effectName)

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view: [],
        particles,
    })
}

async function onDeleteParticleEffectGroup(
    { project }: UseStateReturn,
    name: string,
    effectName: string,
    groupIndex: number,
) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const effect = particle.data.effects.find(({ name }) => name === effectName)
    if (!effect) throw 'Particle Effect not found'

    const newEffect = clone(effect)
    newEffect.groups.splice(groupIndex, 1)

    const newParticle = clone(particle)
    newParticle.data.effects = newParticle.data.effects.map((effect) =>
        effect.name === effectName ? newEffect : effect,
    )

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view: [],
        particles,
    })
}

async function onDeleteParticleEffectGroupParticle(
    { project }: UseStateReturn,
    name: string,
    effectName: string,
    groupIndex: number,
    particleIndex: number,
) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const effect = particle.data.effects.find(({ name }) => name === effectName)
    if (!effect) throw 'Particle Effect not found'

    const group = effect.groups[groupIndex]
    if (!group) throw 'Particle Effect Group not found'

    const newGroup = clone(group)
    newGroup.particles.splice(particleIndex, 1)

    const newEffect = clone(effect)
    newEffect.groups[groupIndex] = newGroup

    const newParticle = clone(particle)
    newParticle.data.effects = newParticle.data.effects.map((effect) =>
        effect.name === effectName ? newEffect : effect,
    )

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view: [],
        particles,
    })
}

async function onRenameParticleEffect(
    { project, view }: UseStateReturn,
    name: string,
    effectName: string,
) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const effect = particle.data.effects.find(({ name }) => name === effectName)
    if (!effect) throw 'Particle Effect not found'

    const newName = await show(ModalName, {
        icon: markRaw(IconPlus),
        title: 'Rename Particle Effect',
        names: ParticleEffectName,
        defaultValue: effectName,
        validator: (value) => !!value && !particle.data.effects.some(({ name }) => name === value),
    })
    if (!newName) return

    const newEffect = clone(effect)
    newEffect.name = newName

    const newParticle = clone(particle)
    newParticle.data.effects = newParticle.data.effects.map((effect) =>
        effect.name === effectName ? newEffect : effect,
    )

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view:
            view.value[0] === 'particles' &&
            view.value[1] === name &&
            view.value[2] === 'effects' &&
            view.value[3] === effectName
                ? ['particles', name, 'effects', newName, ...view.value.slice(4)]
                : view.value,
        particles,
    })
}

async function onCloneParticleEffect(
    { project, view }: UseStateReturn,
    name: string,
    effectName: string,
) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const effect = particle.data.effects.find(({ name }) => name === effectName)
    if (!effect) throw 'Particle Effect not found'

    const newName = await show(ModalName, {
        icon: markRaw(IconClone),
        title: 'Clone Particle Effect',
        names: ParticleEffectName,
        defaultValue: effectName,
        validator: (value) => !!value && !particle.data.effects.some(({ name }) => name === value),
    })
    if (!newName) return

    const newEffect = clone(effect)
    newEffect.name = newName

    const newParticle = clone(particle)
    newParticle.data.effects.push(newEffect)

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view:
            view.value[0] === 'particles' &&
            view.value[1] === name &&
            view.value[2] === 'effects' &&
            view.value[3] === effectName
                ? ['particles', name, 'effects', newName, ...view.value.slice(4)]
                : view.value,
        particles,
    })
}

async function onCloneParticleEffectGroup(
    { project, view }: UseStateReturn,
    name: string,
    effectName: string,
    groupIndex: number,
) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const effect = particle.data.effects.find(({ name }) => name === effectName)
    if (!effect) throw 'Particle Effect not found'

    const group = effect.groups[groupIndex]
    if (!group) throw 'Particle Effect Group not found'

    const newGroup = clone(group)

    const newEffect = clone(effect)
    newEffect.groups.push(newGroup)

    const newParticle = clone(particle)
    newParticle.data.effects = newParticle.data.effects.map((effect) =>
        effect.name === effectName ? newEffect : effect,
    )

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view:
            view.value[0] === 'particles' &&
            view.value[1] === name &&
            view.value[2] === 'effects' &&
            view.value[3] === effectName &&
            view.value[4] === 'groups' &&
            view.value[5] === `${groupIndex}`
                ? [
                      'particles',
                      name,
                      'effects',
                      effectName,
                      'groups',
                      `${effect.groups.length}`,
                      ...view.value.slice(5),
                  ]
                : view.value,
        particles,
    })
}

async function onCloneParticleEffectGroupParticle(
    { project, view }: UseStateReturn,
    name: string,
    effectName: string,
    groupIndex: number,
    particleIndex: number,
) {
    const particle = project.value.particles.get(name)
    if (!particle) throw 'Particle not found'

    const effect = particle.data.effects.find(({ name }) => name === effectName)
    if (!effect) throw 'Particle Effect not found'

    const group = effect.groups[groupIndex]
    if (!group) throw 'Particle Effect Group not found'

    const groupParticle = group.particles[particleIndex]
    if (!groupParticle) throw 'Particle Effect Group Particle not found'

    const newGroupParticle = clone(groupParticle)

    const newGroup = clone(group)
    newGroup.particles.push(newGroupParticle)

    const newEffect = clone(effect)
    newEffect.groups[groupIndex] = newGroup

    const newParticle = clone(particle)
    newParticle.data.effects = newParticle.data.effects.map((effect) =>
        effect.name === effectName ? newEffect : effect,
    )

    const particles = new Map(project.value.particles)
    particles.set(name, newParticle)

    push({
        ...project.value,
        view:
            view.value[0] === 'particles' &&
            view.value[1] === name &&
            view.value[2] === 'effects' &&
            view.value[3] === effectName &&
            view.value[4] === 'groups' &&
            view.value[5] === `${groupIndex}` &&
            view.value[6] === 'particles' &&
            view.value[7] === `${particleIndex}`
                ? [
                      'particles',
                      name,
                      'effects',
                      effectName,
                      'groups',
                      `${groupIndex}`,
                      'particles',
                      `${group.particles.length}`,
                      ...view.value.slice(6),
                  ]
                : view.value,
        particles,
    })
}
