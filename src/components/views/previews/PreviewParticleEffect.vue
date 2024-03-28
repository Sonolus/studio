<script setup lang="ts">
import {
    useDevicePixelRatio,
    useLocalStorage,
    useMouseInElement,
    useMousePressed,
} from '@vueuse/core'
import { computed, ref, watch, watchEffect, watchPostEffect, onUnmounted } from 'vue'
import { inverseBilinear } from '../../../core/bilinear-interpolation'
import { sample } from '../../../core/sampling'
import { Particle, Expression, stringToParticleExpression, varName } from '../../../core/particle'
import { getImageBuffer, getImageInfo } from '../../../core/utils'
import { EaseFunction } from '../../../core/ease'
import MyColorInput from '../../ui/MyColorInput.vue'
import MyField from '../../ui/MyField.vue'
import MyTextInput from '../../ui/MyTextInput.vue'

const props = defineProps<{
    effect: Particle["data"]["effects"][number]
    interpolation: boolean
}>()

const backgroundColor = useLocalStorage('preview.particleEffect.backgroundColor', '#000000')
const executionTime = useLocalStorage('preview.particleEffect.executionTime', '1')

const elBack = ref<HTMLCanvasElement>()
const elTop = ref<HTMLCanvasElement>()
const elBuffer = ref<HTMLCanvasElement>()
const { elementX, elementY, elementWidth, elementHeight } = useMouseInElement(elTop)
const { pressed } = useMousePressed({ target: elTop })
const { pixelRatio } = useDevicePixelRatio()

const ctxBack = computed(() => elBack.value?.getContext('2d'))
const ctxTop = computed(() => elTop.value?.getContext('2d'))
const position = computed<Point>(() => [
    (elementX.value * 2) / elementWidth.value - 1,
    1 - (elementY.value * 2) / elementHeight.value,
])
const canvasWidth = computed(() => elementWidth.value * pixelRatio.value)
const canvasHeight = computed(() => elementHeight.value * pixelRatio.value)

type Point = [number, number]
type Rect = [Point, Point, Point, Point]
let animationReq: number = 0;

const rect = ref<Rect>([
    [-0.5, -0.5],
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.5, -0.5],
])

const rectTransformed = computed<Rect>(() => {
    const { x1, x2, x3, x4, y1, y2, y3, y4 } = props.effect.transform
    return [
        [t(x1), t(y1)],
        [t(x2), t(y2)],
        [t(x3), t(y3)],
        [t(x4), t(y4)],
    ]

    function t(expression: Expression) {
        const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = rect.value
        return (
            x1 * (expression.x1 || 0) +
            x2 * (expression.x2 || 0) +
            x3 * (expression.x3 || 0) +
            x4 * (expression.x4 || 0) +
            y1 * (expression.y1 || 0) +
            y2 * (expression.y2 || 0) +
            y3 * (expression.y3 || 0) +
            y4 * (expression.y4 || 0)
        )
    }
})

type imageInfo = {
    img: HTMLImageElement
    width: number
    height: number
};

let images: {
	error: number,
	info?: imageInfo,
	buffer?: ReturnType<typeof getImageBuffer>,
	color: string,
	start: number,
	duration: number,
	groupId: number,
	x: {
        from: string,
        to: string,
        ease: string
    }
    y: {
        from: string,
        to: string,
        ease: string
    }
    w: {
        from: string,
        to: string,
        ease: string
    }
    h: {
        from: string,
        to: string,
        ease: string
    }
    r: {
        from: string,
        to: string,
        ease: string
    }
    a: {
        from: string,
        to: string,
        ease: string
    }
}[] = [];

type Ease = {
	[i in typeof varName[number]]?: number
};
let randomValues: Ease[] = [];

watchEffect(async () => {
	images.length = 0; let cnt = 0;
	for (var i = 0; i < props.effect.groups.length; i++) {
		for (var k = 0; k < props.effect.groups[i].count; k++) {
			let g = props.effect.groups[i]; cnt++;
			for (var j = 0; j < g.particles.length; j++) {
				images.push({
					error: 0,
					color: "",
					start: 0,
					duration: 1,
					groupId: 0,
					x: {
				        from: "",
				        to: "",
				        ease: "Linear"
				    },
				    y: {
				        from: "",
				        to: "",
				        ease: "Linear"
				    },
				    w: {
				        from: "",
				        to: "",
				        ease: "Linear"
				    },
				    h: {
				        from: "",
				        to: "",
				        ease: "Linear"
				    },
				    r: {
				        from: "",
				        to: "",
				        ease: "Linear"
				    },
				    a: {
				        from: "",
				        to: "",
				        ease: "Linear"
				    }
				});
			    try {
			        images[images.length - 1].info = await getImageInfo(g.particles[j].sprite);
				    let canvas: HTMLCanvasElement = document.createElement("canvas");
				    images[images.length - 1].buffer = getImageBuffer(images[images.length - 1].info as imageInfo, canvas);
				    images[images.length - 1].color = g.particles[j].color;
				    images[images.length - 1].start = g.particles[j].start;
				    images[images.length - 1].duration = g.particles[j].duration;
				    images[images.length - 1].groupId = cnt - 1;
				    images[images.length - 1].x = g.particles[j].x;
				    images[images.length - 1].y = g.particles[j].y;
				    images[images.length - 1].w = g.particles[j].w;
				    images[images.length - 1].h = g.particles[j].h;
				    images[images.length - 1].r = g.particles[j].r;
				    images[images.length - 1].a = g.particles[j].a;
			    } catch (error) {
			        images[images.length - 1].error = 1;
			    }
		    }
			let values: typeof randomValues[number] = {};
			values.c = 1;
			values.r1 = Math.random(); values.sinr1 = Math.sin(2 * Math.PI * values.r1); values.cosr1 = Math.cos(2 * Math.PI * values.r1);
			values.r2 = Math.random(); values.sinr2 = Math.sin(2 * Math.PI * values.r2); values.cosr2 = Math.cos(2 * Math.PI * values.r2);
			values.r3 = Math.random(); values.sinr3 = Math.sin(2 * Math.PI * values.r3); values.cosr3 = Math.cos(2 * Math.PI * values.r3);
			values.r4 = Math.random(); values.sinr4 = Math.sin(2 * Math.PI * values.r4); values.cosr4 = Math.cos(2 * Math.PI * values.r4);
			values.r5 = Math.random(); values.sinr5 = Math.sin(2 * Math.PI * values.r5); values.cosr5 = Math.cos(2 * Math.PI * values.r5);
			values.r6 = Math.random(); values.sinr6 = Math.sin(2 * Math.PI * values.r6); values.cosr6 = Math.cos(2 * Math.PI * values.r6);
			values.r7 = Math.random(); values.sinr7 = Math.sin(2 * Math.PI * values.r7); values.cosr7 = Math.cos(2 * Math.PI * values.r7);
			values.r8 = Math.random(); values.sinr8 = Math.sin(2 * Math.PI * values.r8); values.cosr8 = Math.cos(2 * Math.PI * values.r8);
			randomValues.push(values);
		}
    }
    animationReq = window.requestAnimationFrame(draw);
})

const draggingIndex = ref<number>()
const hoverIndex = computed(() => {
    const [tx, ty] = position.value

    const distances = rect.value
        .map(([x, y], i) => [i, Math.hypot(tx - x, ty - y)])
        .sort(([, a], [, b]) => a - b)

    if (distances[0][1] > 20 / elementWidth.value) return

    return distances[0][0]
})

watch(pressed, (value) => {
    if (!value) {
        draggingIndex.value = undefined
        return
    }

    draggingIndex.value = hoverIndex.value
})

watchEffect(() => {
    if (draggingIndex.value === undefined) return

    rect.value[draggingIndex.value] = position.value
})


// Because the time complexity of alogrithm is much higher than I expected.
// The sampling feature was disabled by me. 
// -- @LittleYang0531
/*watchPostEffect(() => {
    const ctx = ctxTop.value
    if (!ctx) return

    const w = canvasWidth.value
    const h = canvasHeight.value
    ctx.setTransform(w / 2, 0, 0, -h / 2, w / 2, h / 2)
    ctx.clearRect(-1, -1, 2, 2)

    drawRect(ctx, rectTransformed.value, 'rgba(255, 255, 255, 0.25)')
    drawRect(ctx, rect.value, 'rgba(255, 255, 255, 0.5)')

    for (let i = 0; i < rect.value.length; i++) {
        const [x, y] = rect.value[i]
        ctx.beginPath()
        ctx.arc(x, y, 0.02, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fillStyle = getFillStyle(i)
        ctx.fill()
    }

    function drawRect(ctx: CanvasRenderingContext2D, rect: Rect, color: string) {
        const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = rect

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.lineTo(x4, y4)
        ctx.lineTo(x1, y1)
        ctx.closePath()
        ctx.lineWidth = 4 / w
        ctx.strokeStyle = color
        ctx.stroke()
    }

    function getFillStyle(index: number) {
        if (draggingIndex.value === index) return 'rgba(255, 255, 255, 0.75)'
        if (draggingIndex.value === undefined && hoverIndex.value === index)
            return 'rgba(255, 255, 255, 1)'

        return 'rgba(255, 255, 255, 0.5)'
    }
})*/

function expressionToValue(exp: string | undefined, groupId: number) {
	if (exp == undefined) return 0;
	let expression = stringToParticleExpression(exp);
	let val = 0;
	for (let name in expression) val += expression[name as keyof Ease]! * randomValues[groupId][name as keyof Ease]!;
	return val;
}

function hex2rgb(str: string) {
	if (str.length == 4) return [ parseInt(str[1], 16) * 16, parseInt(str[2], 16) * 16, parseInt(str[3], 16) * 16];
	else return [
		parseInt(str.substr(1, 2), 16),
		parseInt(str.substr(3, 2), 16),
		parseInt(str.substr(5, 2), 16)
	];
}

function draw() {
    if (draggingIndex.value !== undefined) return

    const rect = rectTransformed.value
    const canvasW = canvasWidth.value
    const canvasH = canvasHeight.value

    const ctx = ctxBack.value
    if (!ctx) return
    ctx.clearRect(0, 0, canvasW, canvasH)

	for (var i = 0; i < images.length; i++) {
		let t = Date.now() / Number(executionTime.value) / 1000; t -= Math.floor(t);
		if (t < images[i].start || t > images[i].start + images[i].duration) continue;
		let percent = (t - images[i].start) / images[i].duration;
	    const { buffer, width, height } = images[i].buffer as ReturnType<typeof getImageBuffer>;

	    const data = images[i].info!.img;

	    // Color Overlay
	    let tmpImg = document.createElement("canvas");
	    tmpImg.height = height; tmpImg.width = width;
	    let tmpctx = tmpImg.getContext("2d");
	    if (tmpctx == null) continue;
	    tmpctx.drawImage(data, 0, 0, width, height);
	    let tmpImgData = tmpctx.getImageData(0, 0, width, height);
	    let rgb = hex2rgb(images[i].color);
	    for (var j = 0; j < tmpImgData.data.length; j += 4) {
	    	tmpImgData.data[j] = tmpImgData.data[j] / 255 * rgb[0]; // red
	    	tmpImgData.data[j + 1] = tmpImgData.data[j + 1] / 255 * rgb[1]; // green
	    	tmpImgData.data[j + 2] = tmpImgData.data[j + 2] / 255 * rgb[2]; // blue
	   	} tmpctx.putImageData(tmpImgData, 0, 0);

	    let xfrom = expressionToValue(images[i].x.from, images[i].groupId);
	    let xto = expressionToValue(images[i].x.to, images[i].groupId);
	    let yfrom = expressionToValue(images[i].y.from, images[i].groupId);
	    let yto = expressionToValue(images[i].y.to, images[i].groupId);
	    let wfrom = expressionToValue(images[i].w.from, images[i].groupId);
	    let wto = expressionToValue(images[i].w.to, images[i].groupId);
	    let hfrom = expressionToValue(images[i].h.from, images[i].groupId);
	    let hto = expressionToValue(images[i].w.to, images[i].groupId);
	    let rfrom = expressionToValue(images[i].r.from, images[i].groupId);
	    let rto = expressionToValue(images[i].r.to, images[i].groupId);
	    let afrom = expressionToValue(images[i].a.from, images[i].groupId);
	    let ato = expressionToValue(images[i].a.to, images[i].groupId);

	    let x = EaseFunction[images[i].x.ease as keyof typeof EaseFunction](percent) * (xto - xfrom) + xfrom; x = -x;
	    let y = EaseFunction[images[i].y.ease as keyof typeof EaseFunction](percent) * (yto - yfrom) + yfrom; y = -y;
	    let w = EaseFunction[images[i].w.ease as keyof typeof EaseFunction](percent) * (wto - wfrom) + wfrom;
	    let h = EaseFunction[images[i].h.ease as keyof typeof EaseFunction](percent) * (hto - hfrom) + hfrom;
	    let r = EaseFunction[images[i].r.ease as keyof typeof EaseFunction](percent) * (rto - rfrom) + rfrom;
	    let a = EaseFunction[images[i].a.ease as keyof typeof EaseFunction](percent) * (ato - afrom) + afrom;
	    x = (x + 1) / 2 * canvasW, y = (y + 1) / 2 * canvasH;
	    w = w / 2 * canvasW, h = h / 2 * canvasH;

		ctx.globalAlpha = a;
		ctx.translate(x, y); ctx.rotate(r);
		ctx.drawImage(tmpImg, -w / 2, -h / 2, w, h)
		ctx.rotate(Math.PI * 2 - r); ctx.translate(-x, -y);
		ctx.globalAlpha = 1;
    }

	// Because the time complexity of alogrithm is much higher than I expected.
	// The sampling feature was disabled by me. 
	// -- @LittleYang0531
    /* let originImg = ctx.getImageData(0, 0, canvasW, canvasH);
    ctx.clearRect(0, 0, canvasW, canvasH);

    for (let i = 0; i < canvasW; i++) {
        const x = ((i + 0.5) / canvasW) * 2 - 1
        for (let j = 0; j < canvasH; j++) {	
            const y = (((j + 0.5) / canvasH) * 2 - 1) * -1

            const [u, v] = inverseBilinear([x, y], rect)
            if (u < 0 || v < 0 || u > 1 || v > 1) continue

            const [r, g, b, a] = sample(originImg.data, canvasW, canvasH, u, v, props.interpolation)

            const dIndex = (j * canvasW + i) * 4
            originImg.data[dIndex + 0] = r
            originImg.data[dIndex + 1] = g
            originImg.data[dIndex + 2] = b
            originImg.data[dIndex + 3] = a
        }
    }

    ctx.putImageData(originImg, 0, 0) */

    animationReq = window.requestAnimationFrame(draw);
}

onUnmounted(() => window.cancelAnimationFrame(animationReq));
</script>

<template>
    <MyField title="Background Color">
        <MyColorInput
            v-model="backgroundColor"
            default-value="#000"
            placeholder="Enter preview background color..."
            validate
        />
    </MyField>
    <MyField title="Execution Time">
        <MyTextInput
        	v-model="executionTime"
            placeholder="Enter particle execution time..."
            validate
        />
    </MyField>

    <div class="mx-auto my-4 max-w-sm border-4 border-sonolus-ui-text-normal">
        <div class="relative h-0 overflow-hidden pt-[100%]" :style="{ backgroundColor }">
            <canvas
                ref="elBack"
                class="absolute left-0 top-0 h-full w-full"
                :class="{ 'opacity-50': draggingIndex !== undefined }"
                :width="canvasWidth"
                :height="canvasHeight"
            />
            <canvas
                ref="elTop"
                class="absolute left-0 top-0 h-full w-full select-none opacity-50 hover:opacity-100"
                :style="{ touchAction: 'none' }"
                :width="canvasWidth"
                :height="canvasHeight"
            />
        </div>
    </div>

    <canvas ref="elBuffer" class="hidden" />
</template>
