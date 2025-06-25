import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [react()], // Make sure to include this import if you don't import react in the code files
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './setupTests.ts',
	},
})
