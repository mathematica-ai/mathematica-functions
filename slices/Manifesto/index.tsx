import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `Manifesto`.
 */
export type ManifestoProps = SliceComponentProps<Content.ManifestoSlice>;

/**
 * Component for "Manifesto" Slices.
 */
const Manifesto = ({ slice }: ManifestoProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for manifesto (variation: {slice.variation}) Slices
    </section>
  );
};

export default Manifesto;
