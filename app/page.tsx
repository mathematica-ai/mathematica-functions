import { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { createPrismicClient } from "@/libs/prismicClient";
import * as prismic from "@prismicio/client";

// Default metadata
const defaultMetadata = {
	title: "Mathematica Functions",
	description: "Your AI-powered assistant for mathematical computations and insights",
};

export async function generateMetadata(): Promise<Metadata> {
	const client = createPrismicClient();
	try {
		const pages = await client.getAllByType('page', {
			predicates: [
				prismic.predicate.at('my.page.uid', 'home')
			]
		});

		const page = pages[0];
		if (!page?.data) {
			return defaultMetadata;
		}

		return {
			title: page.data.meta_title || defaultMetadata.title,
			description: page.data.meta_description || defaultMetadata.description,
		};
	} catch (error) {
		console.error("Error fetching metadata:", error);
		return defaultMetadata;
	}
}

export default async function Home() {
	const client = createPrismicClient();
	
	try {
		const pages = await client.getAllByType('page', {
			predicates: [
				prismic.predicate.at('my.page.uid', 'home')
			]
		});

		const page = pages[0];
		if (!page?.data) {
			return (
				<div className="container mx-auto px-4 py-8">
					<h1 className="text-4xl font-bold mb-4">{defaultMetadata.title}</h1>
					<p className="text-lg text-gray-600">{defaultMetadata.description}</p>
				</div>
			);
		}
		
		return (
			<div className="container mx-auto px-4">
				<SliceZone 
					slices={page.data.slices} 
					components={components} 
				/>
			</div>
		);
	} catch (error) {
		console.error("Error loading page:", error);
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-4xl font-bold mb-4">Error</h1>
				<p className="text-lg text-gray-600">Failed to load page content</p>
				{process.env.NODE_ENV === 'development' && (
					<pre className="mt-4 p-4 bg-red-50 text-red-900 rounded">
						{error instanceof Error ? error.message : 'Unknown error'}
					</pre>
				)}
			</div>
		);
	}
}
