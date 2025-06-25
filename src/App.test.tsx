// @testing-library/jest-dom needed for custom matchers not included in Vitest or Testing Library.
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import App, { Home, Products } from './App'

// Mock products json response from dummyjson API
const mockProducts = {
	products: [
		{ id: 1, title: 'Product 1', thumbnail: 'thumb1.jpg' },
		{ id: 2, title: 'Product 2', thumbnail: 'thumb2.jpg' },
	],
}

// Mock Loader with delay to simulate async fetch
const loader = () =>
	new Promise((resolve) => setTimeout(() => resolve(mockProducts), 30))

describe('Products', () => {
	it('renders products after loading', async () => {
		const routes = [{ path: '/products', element: <Products />, loader }]
		const router = createMemoryRouter(routes, { initialEntries: ['/products'] })

		render(<RouterProvider router={router} />)

		expect(await screen.findByText('Product 1')).toBeInTheDocument()
		expect(screen.getByText('Product 2')).toBeInTheDocument()
		expect(screen.getByRole('img', { name: 'Product 1' })).toHaveAttribute(
			'src',
			'thumb1.jpg',
		)
	})
})

const errorLoader = () => Promise.reject(new Error('Failed to fetch products'))

it('shows error if loader fails', async () => {
	const testRoutes = [
		{
			path: '/',
			element: <Home />,
		},
		{
			path: '/products',
			element: <Products />,
			loader: errorLoader,
			errorElement: <div>Failed to load products</div>,
		},
	]
	render(<App initialEntries={['/products']} routes={testRoutes} />)
	expect(
		await screen.findByText(/failed to load products/i),
	).toBeInTheDocument()
})

describe('Home', () => {
	it('renders Home and navigates to Products', async () => {
		const testRoutes = [
			{
				path: '/',
				element: <Home />,
			},
			{
				path: '/products',
				element: <Products />,
				loader, // mock loader
			},
		]
		render(<App initialEntries={['/']} routes={testRoutes} />)
		expect(screen.getByText('Home')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /go to products/i }),
		).toBeInTheDocument()

		// Simulate navigation
		await userEvent.click(
			screen.getByRole('button', { name: /go to products/i }),
		)
		// Wait for products to load
		expect(await screen.findByText('Product 1')).toBeInTheDocument()
	})
})

describe('Navigation', () => {
	it('navigates from Products to Home', async () => {
		const testRoutes = [
			{
				path: '/',
				element: <Home />,
			},
			{
				path: '/products',
				element: <Products />,
				loader, // mock loader
			},
		]
		render(<App initialEntries={['/products']} routes={testRoutes} />)
		expect(await screen.findByText('Product 1')).toBeInTheDocument()
		await userEvent.click(screen.getByRole('button', { name: /go to home/i }))
		expect(screen.getByText('Home')).toBeInTheDocument()
	})
})
