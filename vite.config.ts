import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'
import { version } from './package.json'

export default defineConfig({
    css: {
        postcss: {
            plugins: [tailwind(), autoprefixer()],
        },
    },
    plugins: [vue(), svgLoader()],
    define: {
        VITE_APP_VERSION: JSON.stringify(version),
    },
})
