/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {},
	},
	daisyui: {
		themes: [
			{
				night: {
					...require('daisyui/src/theming/themes')['night'],
					'base-100': '#0b1020',
					'base-200': '#0f172a',
					'base-300': '#1f2937',
				}
			},
			{
				corporate: {
					...require('daisyui/src/theming/themes')['corporate'],
					'base-100': '#ffffff',
					'base-200': '#f3f6fb',
					'base-300': '#d9e3f8',
				}
			}
		],
	},
};


