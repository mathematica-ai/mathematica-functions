import { PrismicDocument } from "@prismicio/types";

export interface HeaderDocument extends PrismicDocument {
  data: {
    logo_text: string;
    nav_items: Array<{
      label: string;
      link: {
        url: string;
      };
    }>;
    github_url: string;
    contact_button_text: string;
    login_text: string;
    functions_text: string;
  };
} 