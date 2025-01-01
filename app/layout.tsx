import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import { createClient } from "@/prismicio";
import "./globals.css";

// Define the theme script
const themeScript = `
	(function() {
		try {
			const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
			document.documentElement.setAttribute('data-theme', theme);
		} catch (e) {}
	})()
`;

export const metadata: Metadata = {
	title: "Functions",
	description: "Your AI-powered assistant",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);
	const client = createClient();
	
	let header;
	try {
		header = await client.getSingle('header');
	} catch (error) {
		console.error('Error fetching header data:', error);
		header = null;
	}
	
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: themeScript
					}}
				/>
			</head>
			<body>
				<Providers session={session}>
					<Header session={session} headerData={header} />
					{children}
					<Toaster position="bottom-right" />
				</Providers>
			</body>
		</html>
	);
}
