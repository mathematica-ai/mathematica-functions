import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `FeaturesGrid`.
 */
export type FeaturesGridProps = SliceComponentProps<Content.FeaturesGridSlice>;

/**
 * Component for "FeaturesGrid" Slices.
 */
const FeaturesGrid = ({ slice }: FeaturesGridProps): JSX.Element => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      Placeholder component for features_grid (variation: {slice.variation})
      Slices
    </section>
  );
};

export default FeaturesGrid;
