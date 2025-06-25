import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

const rootElement = document.getElementById('root')

if (rootElement) {
	createRoot(rootElement).render(
		// Remember that in StrictMode, components are rendered twice in DEVELOPMENT mode
		// to help identify side effects. This is normal and expected. Comment out the StrictMode
		// if that annoys you.
		<StrictMode>
			<App />
		</StrictMode>,
	)
}
