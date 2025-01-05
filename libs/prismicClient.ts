import { createClient as prismicCreateClient } from "@/prismicio";

export function createPrismicClient() {
    return prismicCreateClient({ accessToken: process.env.PRISMIC_ACCESS_TOKEN });
} 