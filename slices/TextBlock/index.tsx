import { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { RichTextField } from "@prismicio/client";

interface TextBlockSlice {
  slice_type: "text_block";
  slice_label: null;
  id: string;
  primary: {
    title?: RichTextField;
    description?: RichTextField;
  };
  variation: "default";
}

export type TextBlockProps = SliceComponentProps<TextBlockSlice>;

export function TextBlock(props: SliceComponentProps): JSX.Element {
  const slice = props.slice as TextBlockSlice;
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