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
            colors: {
                border: 'hsl(214 32% 91%)',
                input: 'hsl(214 32% 91%)',
                ring: 'hsl(221 83% 53%)',
                background: 'hsl(0 0% 100%)',
                foreground: 'hsl(222 84% 5%)',
                primary: {
                    DEFAULT: 'hsl(221 83% 53%)',
                    foreground: 'hsl(210 40% 98%)',
                },
                secondary: {
                    DEFAULT: 'hsl(210 40% 96%)',
                    foreground: 'hsl(222 84% 5%)',
                },
                destructive: {
                    DEFAULT: 'hsl(0 84% 60%)',
                    foreground: 'hsl(210 40% 98%)',
                },
                muted: {
                    DEFAULT: 'hsl(210 40% 96%)',
                    foreground: 'hsl(215 16% 47%)',
                },
                accent: {
                    DEFAULT: 'hsl(210 40% 96%)',
                    foreground: 'hsl(222 84% 5%)',
                },
                popover: {
                    DEFAULT: 'hsl(0 0% 100%)',
                    foreground: 'hsl(222 84% 5%)',
                },
                card: {
                    DEFAULT: 'hsl(0 0% 100%)',
                    foreground: 'hsl(222 84% 5%)',
                },
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
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    from: { opacity: '0', transform: 'scale(0.95)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                bounceGentle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
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