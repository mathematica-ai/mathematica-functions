import * as prismic from "@prismicio/client";
import * as prismicNext from "@prismicio/next";

/**
 * The project's Prismic repository name.
 */
export const repositoryName = process.env.NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME || "mathematica-web";

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 */
export function createClient({
  previewData,
  req,
  ...config
}: prismicNext.CreateClientConfig = {}) {
  const client = prismic.createClient(repositoryName, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    routes: [
      {
        type: 'home',
        path: '/',
      },
      {
        type: 'page',
        path: '/:uid',
      },
      {
        type: 'blog_post',
        path: '/blog/:uid',
      },
    ],
    ...config,
  });

  prismicNext.enableAutoPreviews({
    client,
    previewData,
    req,
  });

  return client;
}

// Link resolver for Prismic documents
export const linkResolver = (doc: any) => {
  if (doc.type === "home") return "/";
  if (doc.type === "page") return `/${doc.uid}`;
  if (doc.type === "blog_post") return `/blog/${doc.uid}`;
  return "/";
};
