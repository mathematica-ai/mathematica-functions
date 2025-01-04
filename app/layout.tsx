import { Suspense } from "react";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import { createClient } from "@/prismicio";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const themeScript = `
	(function() {
		let theme = 'light';
		try {
			const stored = localStorage.getItem('theme');
			if (stored) {
				theme = stored;
			} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				theme = 'dark';
			}
			
			// Update favicon based on theme
			const faviconUpdate = () => {
				const favicon32 = document.querySelector('link[rel="icon"][sizes="32x32"]');
				const favicon16 = document.querySelector('link[rel="icon"][sizes="16x16"]');
				
				if (favicon32) {
					favicon32.href = theme === 'dark' ? '/favicon-32x32-dark.png' : '/favicon-32x32.png';
				}
				if (favicon16) {
					favicon16.href = theme === 'dark' ? '/favicon-16x16-dark.png' : '/favicon-16x16.png';
				}
			};

			// Update theme and favicon
			document.documentElement.setAttribute('data-theme', theme);
			faviconUpdate();

			// Listen for system theme changes
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
				if (!localStorage.getItem('theme')) {
					theme = e.matches ? 'dark' : 'light';
					document.documentElement.setAttribute('data-theme', theme);
					faviconUpdate();
				}
			});
		} catch (e) {}
	})()
`;

export const metadata: Metadata = {
	title: "Functions",
	description: "Your AI-powered assistant",
	icons: {
		icon: [
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
		],
		apple: [
			{ url: "/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
			{ url: "/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
			{ url: "/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
			{ url: "/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
			{ url: "/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
			{ url: "/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
			{ url: "/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
			{ url: "/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
			{ url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
		],
		other: [
			{ url: "/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
			{ url: "/ms-icon-144x144.png", sizes: "144x144", type: "image/png" },
		],
	},
	manifest: "/manifest.json",
	themeColor: "#ffffff",
	other: {
		"msapplication-TileColor": "#ffffff",
		"msapplication-TileImage": "/ms-icon-144x144.png",
	},
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);
	const client = createClient();
	
	let header = null;
	try {
		if (process.env.PRISMIC_ACCESS_TOKEN && process.env.PRISMIC_REPOSITORY_NAME) {
			header = await client.getSingle('header').catch(() => null);
		}
	} catch (error) {
		console.error('Error fetching header data:', error);
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: themeScript
					}}
				/>
				{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
					<GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
				)}
			</head>
			<body suppressHydrationWarning>
				<Providers session={session}>
					<div className="min-h-screen flex flex-col">
						<Header session={session} headerData={header} />
						<main className="flex-1">
							{children}
						</main>
						<Toaster 
							position="bottom-right"
							toastOptions={{
								duration: 3000,
							}}
						/>
					</div>
				</Providers>
			</body>
		</html>
	);
}
