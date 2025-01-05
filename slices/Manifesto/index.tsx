import { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { RichTextField } from "@prismicio/client";

interface ManifestoSlice {
  slice_type: "manifesto";
  slice_label: null;
  id: string;
  primary: {
    manifesto: RichTextField;
  };
  variation: "default";
}

/**
 * Props for `Manifesto`.
 */
export type ManifestoProps = SliceComponentProps<ManifestoSlice>;

/**
 * Component for "Manifesto" Slices.
 */
const Manifesto = (props: SliceComponentProps): JSX.Element => {
  const slice = props.slice as ManifestoSlice;
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="container mx-auto px-4 py-8 prose prose-lg max-w-none"
    >
      <PrismicRichText field={slice.primary.manifesto} />
    </section>
  );
};

export default Manifesto;
