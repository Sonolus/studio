module.exports = {
    mode: 'jit',
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    darkMode: false,
    theme: {
        extend: {
            colors: {
                'sonolus-main': 'rgba(0, 0, 32, 1)',
                'sonolus-alternative-0': 'rgba(13, 0, 31, 1)',
                'sonolus-alternative-1': 'rgba(0, 17, 29, 1)',
                'sonolus-glow': 'rgba(255, 255, 255, 1)',
                'sonolus-ui-surface': 'rgba(0, 0, 0, 1)',
                'sonolus-ui-text-normal': 'rgba(255, 255, 255, 1)',
                'sonolus-ui-text-disabled': 'rgba(255, 255, 255, 0.25)',
                'sonolus-ui-button-normal': 'rgba(255, 255, 255, 0.125)',
                'sonolus-ui-button-highlighted': 'rgba(255, 255, 255, 0.25)',
                'sonolus-ui-button-pressed': 'rgba(255, 255, 255, 0.0625)',
                'sonolus-ui-button-disabled': 'rgba(255, 255, 255, 0.03125)',
                'sonolus-success': 'rgba(72, 199, 142, 1)',
                'sonolus-warning': 'rgba(241, 70, 104, 1)',
            },
        },
    },
}
