import { Skin } from './skin'
import { getImageInfo } from './utils'

export async function tryCalculateLayout(skin: Skin) {
    let size = 128
    while (size <= 4096) {
        try {
            return {
                size,
                layouts: await calculateLayout(skin, size),
            }
        } catch (e) {
            size *= 2
        }
    }
    throw 'Maximum texture size (4096x4096) exceeded'
}

async function calculateLayout(skin: Skin, size: number) {
    const sprites: {
        name: string
        w: number
        h: number
        width: number
        height: number
    }[] = []

    for (const { name, texture, padding } of skin.data.sprites) {
        const { width, height } = await getImageInfo(texture)

        sprites.push({
            name,
            w: width,
            h: height,
            width: width + (padding.left ? 1 : 0) + (padding.right ? 1 : 0),
            height: height + (padding.top ? 1 : 0) + (padding.bottom ? 1 : 0),
        })
    }

    const spaces = [{ x: 0, y: 0, width: size, height: size }]

    return sprites
        .sort(
            (a, b) =>
                b.width * b.height - a.width * a.height ||
                b.width + b.height - (a.width + a.height),
        )
        .map(({ name, w, h, width, height }) => {
            const spaceIndex = spaces.findIndex(
                (space) => space.width >= width && space.height >= height,
            )
            if (spaceIndex == -1) throw 'Insufficient size'

            const space = spaces[spaceIndex]
            spaces.splice(spaceIndex, 1)

            if (space.height > height) {
                spaces.unshift({
                    x: space.x,
                    y: space.y + height,
                    width: space.width,
                    height: space.height - height,
                })
            }

            if (space.width > width) {
                spaces.unshift({
                    x: space.x + width,
                    y: space.y,
                    width: space.width - width,
                    height: height,
                })
            }

            return {
                name,
                x: space.x,
                y: space.y,
                w,
                h,
            }
        })
}

export async function bakeSprite(
    { texture, padding }: Skin['data']['sprites'][number],
    x: number,
    y: number,
    w: number,
    h: number,
    ctx: CanvasRenderingContext2D,
) {
    const { img } = await getImageInfo(texture)

    const l = padding.left ? 1 : 0
    const t = padding.top ? 1 : 0

    ctx.drawImage(img, x + l, y + t)

    if (padding.left) {
        ctx.drawImage(img, 0, 0, 1, h, x, y + t, 1, h)
    }

    if (padding.right) {
        ctx.drawImage(img, w - 1, 0, 1, h, x + w + l, y + t, 1, h)
    }

    if (padding.top) {
        ctx.drawImage(img, 0, 0, w, 1, x + l, y, w, 1)
    }

    if (padding.bottom) {
        ctx.drawImage(img, 0, h - 1, w, 1, x + l, y + h + t, w, 1)
    }

    if (padding.left && padding.top) {
        ctx.drawImage(img, 0, 0, 1, 1, x, y, 1, 1)
    }

    if (padding.left && padding.bottom) {
        ctx.drawImage(img, 0, h - 1, 1, 1, x, y + h + t, 1, 1)
    }

    if (padding.right && padding.top) {
        ctx.drawImage(img, w - 1, 0, 1, 1, x + w + l, y, 1, 1)
    }

    if (padding.right && padding.bottom) {
        ctx.drawImage(img, w - 1, h - 1, 1, 1, x + w + l, y + h + t, 1, 1)
    }
}
