import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";

type TextBlockProps = SliceComponentProps<Content.TextBlockSlice>;

export function TextBlock({ slice }: TextBlockProps) {
  return (
    <div className="py-8">
      {slice.primary.title && (
        <h2 className="text-3xl font-bold mb-4">
          <PrismicRichText field={slice.primary.title} />
        </h2>
      )}
      {slice.primary.description && (
        <div className="prose max-w-none">
          <PrismicRichText field={slice.primary.description} />
        </div>
      )}
    </div>
  );
} 