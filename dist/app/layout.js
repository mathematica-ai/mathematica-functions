import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import { createClient } from "@/prismicio";
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
		} catch (e) {}
		document.documentElement.setAttribute('data-theme', theme);
	})()
`;
export const metadata = {
    title: "Functions",
    description: "Your AI-powered assistant",
};
export default async function RootLayout({ children, }) {
    const session = await getServerSession(authOptions);
    const client = createClient();
    let header = null;
    try {
        if (process.env.PRISMIC_ACCESS_TOKEN && process.env.PRISMIC_REPOSITORY_NAME) {
            header = await client.getSingle('header').catch(() => null);
        }
    }
    catch (error) {
        console.error('Error fetching header data:', error);
    }
    return (<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{
            __html: themeScript
        }}/>
			</head>
			<body suppressHydrationWarning>
				<Providers session={session}>
					<div className="min-h-screen flex flex-col">
						<Header session={session} headerData={header}/>
						<main className="flex-1">
							{children}
						</main>
						<Toaster position="bottom-right" toastOptions={{
            duration: 3000,
        }}/>
					</div>
				</Providers>
			</body>
		</html>);
}
