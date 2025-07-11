/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                xs: ['0.8125rem', { lineHeight: '1.25rem' }], // Increased from 0.75rem
                sm: ['0.9375rem', { lineHeight: '1.375rem' }], // Increased from 0.875rem
                base: ['1.0625rem', { lineHeight: '1.5rem' }], // Increased from 1rem
                lg: ['1.1875rem', { lineHeight: '1.75rem' }], // Increased from 1.125rem
                xl: ['1.3125rem', { lineHeight: '1.75rem' }], // Increased from 1.25rem
                '2xl': ['1.5625rem', { lineHeight: '2rem' }], // Increased from 1.5rem
                '3xl': ['1.9375rem', { lineHeight: '2.25rem' }], // Increased from 1.875rem
                '4xl': ['2.4375rem', { lineHeight: '2.5rem' }], // Increased from 2.25rem
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--border))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(0 84% 60%)',
                    foreground: 'hsl(0 0% 100%)',
                },
                muted: {
                    DEFAULT: 'hsl(210 40% 96%)',
                    foreground: 'hsl(215 16% 47%)',
                },
                popover: {
                    DEFAULT: 'hsl(0 0% 100%)',
                    foreground: 'hsl(var(--foreground))',
                },
                card: {
                    DEFAULT: 'hsl(0 0% 100%)',
                    foreground: 'hsl(var(--foreground))',
                },
            },
            spacing: {
                '18': '4.75rem', // Added new spacing
                '22': '5.75rem', // Added new spacing
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'bounce-gentle': 'bounceGentle 2s infinite',
                'float': 'float 3s ease-in-out infinite',
                'gradient-shift': 'gradientShift 15s ease infinite',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(22px)' }, // Increased from 20px
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    from: { opacity: '0', transform: 'scale(0.94)' }, // Decreased from 0.95
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                bounceGentle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-11px)' }, // Increased from -10px
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-22px)' }, // Increased from -20px
                },
                gradientShift: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            lineClamp: {
                1: '1',
                2: '2',
                3: '3',
                4: '4',
                5: '5',
                6: '6',
            },
        },
    },
    plugins: [
        function ({ addUtilities }) {
            const newUtilities = {
                '.line-clamp-1': {
                    display: '-webkit-box',
                    '-webkit-line-clamp': '1',
                    '-webkit-box-orient': 'vertical',
                    overflow: 'hidden',
                },
                '.line-clamp-2': {
                    display: '-webkit-box',
                    '-webkit-line-clamp': '2',
                    '-webkit-box-orient': 'vertical',
                    overflow: 'hidden',
                },
                '.line-clamp-3': {
                    display: '-webkit-box',
                    '-webkit-line-clamp': '3',
                    '-webkit-box-orient': 'vertical',
                    overflow: 'hidden',
                },
                '.line-clamp-4': {
                    display: '-webkit-box',
                    '-webkit-line-clamp': '4',
                    '-webkit-box-orient': 'vertical',
                    overflow: 'hidden',
                },
                '.line-clamp-5': {
                    display: '-webkit-box',
                    '-webkit-line-clamp': '5',
                    '-webkit-box-orient': 'vertical',
                    overflow: 'hidden',
                },
                '.line-clamp-6': {
                    display: '-webkit-box',
                    '-webkit-line-clamp': '6',
                    '-webkit-box-orient': 'vertical',
                    overflow: 'hidden',
                },
            }
            addUtilities(newUtilities, ['responsive'])
        },
    ],
}