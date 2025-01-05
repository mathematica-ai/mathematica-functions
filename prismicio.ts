import * as prismic from "@prismicio/client";
import * as prismicNext from "@prismicio/next";

/**
 * The project's Prismic repository name.
 */
export const repositoryName = process.env.NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME || "mathematica-web";

// This is the API endpoint of your Prismic repository
const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`;

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 */
export function createClient({
  previewData,
  req,
  ...config
}: prismicNext.CreateClientConfig = {}) {
  const client = prismic.createClient(apiEndpoint, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    routes: [
      {
        type: 'page',
        path: '/:uid',
      },
      {
        type: 'footer',
        path: '/footer',
      },
      {
        type: 'header',
        path: '/header',
      },
      {
        type: 'settings',
        path: '/settings',
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
  if (doc.type === "page") return `/${doc.uid}`;
  if (doc.type === "footer") return "/footer";
  if (doc.type === "header") return "/header";
  if (doc.type === "settings") return "/settings";
  return "/";
};

