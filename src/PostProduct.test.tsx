// Library imports
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// Local imports
import { PostProduct, postProductAction } from './PostProduct'

// Mock fetch globally
globalThis.fetch = vi.fn()

describe('postProductAction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should successfully post product data', async () => {
		const mockResponse = { id: 1, title: 'Test', price: 10 }

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValueOnce(mockResponse),
		} as unknown as Response)

		const formData = new FormData()
		formData.append('title', 'Test')
		formData.append('price', '10')

		const request = new Request('http://test.com', {
			method: 'POST',
			body: formData,
		})
		const result = await postProductAction({ request })

		expect(fetch).toHaveBeenCalledWith('https://dummyjson.com/products/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title: 'Test', price: 10 }),
		})
		expect(result).toEqual(mockResponse)
	})

	it('should throw error when API response is not ok', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 400,
		} as unknown as Response)

		const formData = new FormData()
		formData.append('title', 'Test')
		formData.append('price', '10')

		const request = new Request('http://test.com', {
			method: 'POST',
			body: formData,
		})

		await expect(postProductAction({ request })).rejects.toThrow(
			'Failed to add product',
		)
	})

	it('should handle missing price as 0', async () => {
		const mockResponse = { id: 2, title: 'No Price', price: 0 }

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValueOnce(mockResponse),
		} as unknown as Response)

		const formData = new FormData()
		// no price situation
		formData.append('title', 'No Price')

		const request = new Request('http://test.com', {
			method: 'POST',
			body: formData,
		})
		const result = await postProductAction({ request })

		expect(fetch).toHaveBeenCalledWith(
			'https://dummyjson.com/products/add',
			expect.objectContaining({
				body: JSON.stringify({ title: 'No Price', price: 0 }),
			}),
		)
		expect(result).toEqual(mockResponse)
	})
})

describe('PostProduct Component', () => {
	const createRouter = () =>
		createMemoryRouter(
			[
				{
					path: '/',
					element: <PostProduct />,
					action: postProductAction,
				},
			],
			{ initialEntries: ['/'] },
		)

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('renders form fields and buttons', () => {
		const router = createRouter()

		render(<RouterProvider router={router} />)
		expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /add product/i }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /go to home/i }),
		).toBeInTheDocument()
	})

	it('validates required fields', async () => {
		const user = userEvent.setup()
		const router = createRouter()

		render(<RouterProvider router={router} />)

		await user.click(screen.getByRole('button', { name: /add product/i }))

		expect(screen.getByLabelText(/title/i)).toBeRequired()
		expect(screen.getByLabelText(/price/i)).toBeRequired()
	})

	// This is a tricky one because in the code file, I used useEffect and useRef to reset the form fields
	// after submit, sometimes, due to React Router’s internal state and re-rendering, the input fields are
	// briefly unmounted and not immediately available.
	it('submits form and resets fields on success', async () => {
		const user = userEvent.setup()
		const router = createRouter()

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValueOnce({ id: 123, title: 'My Product' }),
		} as unknown as Response)

		render(<RouterProvider router={router} />)

		await user.type(screen.getByLabelText(/title/i), 'My Product')
		await user.type(screen.getByLabelText(/price/i), '99.99')
		await user.click(screen.getByRole('button', { name: /add product/i }))

		// Wait for the success message
		await screen.findByText(/product added:/i)
		await screen.findByText(/my product/i)

		// Wait for the form fields to be reset (inputs reappear and are empty)
		const titleInput = (await screen.findByLabelText(
			/title/i,
		)) as HTMLInputElement
		const priceInput = (await screen.findByLabelText(
			/price/i,
		)) as HTMLInputElement

		expect(titleInput.value).toBe('')
		expect(priceInput.value).toBe('')
	})

	it('shows submitting state', async () => {
		const user = userEvent.setup()
		const router = createRouter()
		let resolveFetch: ((value: unknown) => void) | undefined
		const fetchPromise = new Promise<unknown>((resolve) => {
			resolveFetch = resolve
		})
		vi.mocked(fetch).mockImplementationOnce(
			() => fetchPromise as Promise<Response>,
		)

		render(<RouterProvider router={router} />)
		await user.type(screen.getByLabelText(/title/i), 'Loading Product')
		await user.type(screen.getByLabelText(/price/i), '10')
		await user.click(screen.getByRole('button', { name: /add product/i }))

		expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
		// Finish the fetch
		if (resolveFetch) {
			resolveFetch({
				ok: true,
				json: () => Promise.resolve({ id: 1, title: 'Loading Product' }),
			})
		} else {
			throw new Error('resolveFetch was not set')
		}
	})

	it('navigates to home when Go to Home is clicked', async () => {
		const user = userEvent.setup()
		const router = createRouter()
		render(<RouterProvider router={router} />)
		const homeBtn = screen.getByRole('button', { name: /go to home/i })

		expect(homeBtn).toBeInTheDocument()
		await user.click(homeBtn)
	})
})
