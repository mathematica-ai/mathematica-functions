"use client";

import React from 'react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';

interface Feature {
  title: string;
  description: string;
  image: StaticImageData;
  svg?: React.ReactNode;
}

interface FeatureItemProps {
  feature: Feature;
  isSelected: boolean;
  setFeatureSelected: (title: string) => void;
}

function FeatureItem({ feature, isSelected, setFeatureSelected }: FeatureItemProps) {
  const { title, description, svg } = feature as { title: string; description: string; svg?: React.ReactNode };

  return (
    <div className="collapse collapse-arrow bg-base-200 mb-2">
      <input
        type="radio"
        name="features-accordion"
        checked={isSelected}
        onChange={() => setFeatureSelected(title)}
      />
      <div className="collapse-title text-xl font-medium">
        {title}
      </div>
      <div className="collapse-content">
        <p>{description}</p>
        {svg && <div className="mt-4">{svg}</div>}
      </div>
    </div>
  );
}

export default function FeaturesAccordion({ features }: { features: Feature[] }) {
  const [selectedFeature, setSelectedFeature] = React.useState<string>(features[0]?.title || '');

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        {features.map((feature) => (
          <FeatureItem
            key={feature.title}
            feature={feature}
            isSelected={selectedFeature === feature.title}
            setFeatureSelected={setSelectedFeature}
          />
        ))}
      </div>
      <div className="relative aspect-square lg:aspect-auto">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`absolute inset-0 transition-all duration-300 ${
              selectedFeature === feature.title
                ? 'opacity-100'
                : 'opacity-0'
            }`}
          >
            <Image
              src={feature.image}
              alt={feature.title}
              className="rounded-2xl object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={selectedFeature === feature.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
