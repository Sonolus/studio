import { markRaw } from 'vue'
import { hasEffectClip } from '../core/effect'
import {
    hasParticleEffect,
    hasParticleEffectGroup,
    hasParticleEffectGroupParticle,
    hasParticleSprite,
} from '../core/particle'
import { type Project } from '../core/project'
import { hasSkinSprite } from '../core/skin'
import ViewBackground from './views/ViewBackground.vue'
import ViewEffect from './views/ViewEffect.vue'
import ViewEffectClip from './views/ViewEffectClip.vue'
import ViewInfo from './views/ViewInfo.vue'
import ViewParticle from './views/ViewParticle.vue'
import ViewParticleEffect from './views/ViewParticleEffect.vue'
import ViewParticleEffectGroup from './views/ViewParticleEffectGroup.vue'
import ViewParticleEffectGroupParticle from './views/ViewParticleEffectGroupParticle.vue'
import ViewParticleSprite from './views/ViewParticleSprite.vue'
import ViewSkin from './views/ViewSkin.vue'
import ViewSkinSprite from './views/ViewSkinSprite.vue'

export function resolveViewInfo(project: Project, view: string[]) {
    switch (view[0]) {
        case 'info': {
            return { component: markRaw(ViewInfo) }
        }
        case 'skins': {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const data = project[view[0]].get(view[1]!)
            if (!data) return

            switch (view.length) {
                case 2:
                    return { component: markRaw(ViewSkin), data }
                case 4:
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    if (!hasSkinSprite(data, view[3]!)) return
                    return { component: markRaw(ViewSkinSprite), data }
                default:
                    return
            }
        }
        case 'backgrounds': {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const data = project[view[0]].get(view[1]!)
            if (!data) return

            return { component: markRaw(ViewBackground), data }
        }
        case 'effects': {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const data = project[view[0]].get(view[1]!)
            if (!data) return

            switch (view.length) {
                case 2:
                    return { component: markRaw(ViewEffect), data }
                case 4:
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    if (!hasEffectClip(data, view[3]!)) return
                    return { component: markRaw(ViewEffectClip), data }
                default:
                    return
            }
        }
        case 'particles': {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const data = project[view[0]].get(view[1]!)
            if (!data) return

            switch (view.length) {
                case 2:
                    return { component: markRaw(ViewParticle), data }
                case 4:
                    if (view[2] === 'sprites') {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        if (!hasParticleSprite(data, view[3]!)) return
                        return { component: markRaw(ViewParticleSprite), data }
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        if (!hasParticleEffect(data, view[3]!)) return
                        return { component: markRaw(ViewParticleEffect), data }
                    }
                case 6:
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    if (!hasParticleEffectGroup(data, view[3]!, +view[5]!)) return
                    return { component: markRaw(ViewParticleEffectGroup), data }
                case 8:
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    if (!hasParticleEffectGroupParticle(data, view[3]!, +view[5]!, +view[7]!))
                        return
                    return { component: markRaw(ViewParticleEffectGroupParticle), data }
                default:
                    return
            }
        }
        case undefined:
            return
    }
}
