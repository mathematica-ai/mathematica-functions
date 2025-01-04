import { Metadata } from "next";
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";

// Default metadata
const defaultMetadata = {
	title: "Mathematica Functions",
	description: "Your AI-powered assistant for mathematical computations and insights",
};

export async function generateMetadata(): Promise<Metadata> {
	const client = createClient();
	try {
		const homePage = await client.getByType("home", {
			fetchLinks: ["page.title", "page.description"],
		});

		if (!homePage.results.length) {
			console.log("No home page found, using default metadata");
			return defaultMetadata;
		}

		const data = homePage.results[0].data;
		return {
			title: data.meta_title || defaultMetadata.title,
			description: data.meta_description || defaultMetadata.description,
		};
	} catch (error) {
		console.error("Error fetching metadata:", error);
		return defaultMetadata;
	}
}

export default async function Home() {
	const client = createClient({ accessToken: process.env.PRISMIC_ACCESS_TOKEN });
	
	try {
		const homePage = await client.getSingle("home");
		
		if (!homePage || !homePage.data) {
			console.log("No home page found, using default metadata");
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
					slices={homePage.data.slices} 
					components={components} 
				/>
			</div>
		);
	} catch (error) {
		console.error("Error in Home component:", error);
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-4xl font-bold mb-4">Error</h1>
				<p className="text-lg text-gray-600">Failed to load page content</p>
			</div>
		);
	}
}
