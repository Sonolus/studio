import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'
import { version } from './package.json'

export default defineConfig({
    plugins: [vue(), svgLoader()],
    define: {
        VITE_APP_VERSION: JSON.stringify(version),
    },
})
