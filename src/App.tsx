// Library imports
import { Suspense } from 'react'
import {
	Await,
	createMemoryRouter,
	type RouteObject,
	RouterProvider,
	useLoaderData,
	useNavigate,
} from 'react-router'

// Local imports
import { PostProduct, postProductAction } from './PostProduct'
import './App.css'

type ProductResponse = {
	products: { id: number; title: string; thumbnail: string }[]
}

// Loader function using dummyjson API
async function productsLoader(): Promise<ProductResponse> {
	const response = await fetch('https://dummyjson.com/products?limit=10')
	if (!response.ok) throw new Error('Failed to fetch products')

	return response.json()
}

// Home *component* with navigation
export function Home() {
	const navigate = useNavigate()

	return (
		<section className="max-w-md mx-auto mt-16 bg-white rounded-xl shadow-lg p-10 border border-gray-200 flex flex-col items-center space-y-6">
			<h2 className="text-3xl font-bold text-blue-700 mb-4">Home</h2>
			<button
				type="button"
				onClick={() => navigate('/products')}
				className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition-colors"
			>
				Go to Products
			</button>

			<button
				type="button"
				onClick={() => navigate('/add-product')}
				className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition-colors"
			>
				Add Product
			</button>
		</section>
	)
}

// Products *page* using Suspense and Await, with navigation
export function Products() {
	const navigate = useNavigate()
	const dataPromise = useLoaderData() as Promise<ProductResponse>

	return (
		<section className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
			<div className="flex justify-between mb-6">
				<button
					type="button"
					onClick={() => navigate('/')}
					className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-md shadow hover:bg-gray-300 transition-colors"
				>
					Go to Home
				</button>
				<button
					type="button"
					onClick={() => navigate('/add-product')}
					className="py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition-colors"
				>
					Add Product
				</button>
			</div>
			<Suspense
				fallback={
					<div className="text-center text-blue-600 font-semibold">
						Loading products...
					</div>
				}
			>
				<Await resolve={dataPromise}>
					{(data: ProductResponse) => (
						<ol className="space-y-4">
							{data.products.map((p) => (
								<li
									key={p.id}
									className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 shadow-sm"
								>
									<img
										src={p.thumbnail}
										alt={p.title}
										className="w-16 h-16 object-cover rounded-md border border-gray-200"
									/>
									<span className="text-lg font-medium text-gray-800">
										{p.title}
									</span>
								</li>
							))}
						</ol>
					)}
				</Await>
			</Suspense>
		</section>
	)
}

function ProductsError() {
	return (
		<section className="max-w-lg mx-auto mt-10 bg-red-50 rounded-xl shadow-lg p-8 border border-red-200 flex flex-col items-center">
			<h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
			<p className="text-red-800 text-lg font-medium">
				Failed to load products
			</p>
		</section>
	)
}

// Define routes
const routes = [
	{
		path: '/',
		element: <Home />,
	},
	{
		path: '/products',
		element: <Products />,
		loader: productsLoader,
		errorElement: <ProductsError />,
	},
	{
		path: '/add-product',
		element: <PostProduct />,
		action: postProductAction,
	},
]

type AppProps = {
	initialEntries?: string[]
	routes?: RouteObject[]
}

export default function App({
	initialEntries = ['/products'],
	routes: customRoutes,
}: AppProps) {
	const router = createMemoryRouter(customRoutes ?? routes, { initialEntries })
	return <RouterProvider router={router} />
}
