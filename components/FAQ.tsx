"use client";

import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQItemProps {
  item: FAQItem;
  isSelected: boolean;
  setSelected: (question: string) => void;
}

function FAQItemComponent({ item, isSelected, setSelected }: FAQItemProps) {
  const { question, answer } = item as { question: string; answer: string };

  return (
    <div className="collapse collapse-arrow bg-base-200 mb-2">
      <input
        type="radio"
        name="faq-accordion"
        checked={isSelected}
        onChange={() => setSelected(question)}
      />
      <div className="collapse-title text-xl font-medium">
        {question}
      </div>
      <div className="collapse-content">
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ({ items }: { items: FAQItem[] }) {
  const [selectedQuestion, setSelectedQuestion] = React.useState<string>(items[0]?.question || '');

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <FAQItemComponent
          key={item.question}
          item={item}
          isSelected={selectedQuestion === item.question}
          setSelected={setSelectedQuestion}
        />
      ))}
    </div>
  );
}
