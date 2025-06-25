import { useEffect, useRef } from 'react'
import { Form, useActionData, useNavigate, useNavigation } from 'react-router'

export async function postProductAction({ request }: { request: Request }) {
	const formData = await request.formData()
	const product = {
		title: formData.get('title'),
		price: Number(formData.get('price')),
	}
	const response = await fetch('https://dummyjson.com/products/add', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(product),
	})
	if (!response.ok) throw new Error('Failed to add product')
	return response.json()
}

export function PostProduct() {
	const actionData = useActionData() as { id?: number; title?: string }
	const navigation = useNavigation()
	const navigate = useNavigate()
	const formRef = useRef<HTMLFormElement>(null)

	// Clear form fields after submission
	useEffect(() => {
		if (actionData?.id && formRef.current) {
			formRef.current.reset()
		}
	}, [actionData])

	return (
		<section className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
			<h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
				Add Product
			</h2>
			<Form method="post" className="space-y-5" ref={formRef}>
				<div>
					<label
						htmlFor="title"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Title:
					</label>
					<input
						name="title"
						required
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Product title"
					/>
				</div>
				<div>
					<label
						htmlFor="price"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Price:
					</label>
					<input
						name="price"
						type="number"
						required
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Product price"
					/>
				</div>
				<button
					type="submit"
					disabled={navigation.state === 'submitting'}
					className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
				>
					{navigation.state === 'submitting' ? 'Submitting...' : 'Add Product'}
				</button>
			</Form>
			{actionData?.id && (
				<div className="mt-6 p-4 bg-green-100 border border-green-300 rounded text-green-800 text-center">
					<strong>Product added:</strong> {actionData.title} (ID:{' '}
					{actionData.id})
				</div>
			)}
			<div>
				<button
					type="button"
					onClick={() => navigate('/')}
					className="w-full py-2 px-4 mt-1 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition-colors disabled:opacity-50"
				>
					Go to Home
				</button>
			</div>
		</section>
	)
}
