"use client";

import React, { useRef, useState } from 'react';

interface ButtonLeadProps {
  text: string;
  // eslint-disable-next-line no-unused-vars
  onClick: (email: string) => void;
  className?: string;
}

export default function ButtonLead({ text, onClick, className = '' }: ButtonLeadProps) {
  const [emailValue, setEmail] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!isInputVisible) {
      setIsInputVisible(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else if (emailValue) {
      onClick(emailValue);
      setEmail('');
      setIsInputVisible(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && emailValue) {
      onClick(emailValue);
      setEmail('');
      setIsInputVisible(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setEmail('');
      setIsInputVisible(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <input
        ref={inputRef}
        type="email"
        value={emailValue}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your email"
        className={`
          absolute inset-0 h-full w-full rounded-lg px-4 text-base-content
          transition-all duration-200 ease-in-out
          ${isInputVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}
        `}
      />
      <button
        onClick={handleClick}
        className={`
          btn btn-primary
          transition-all duration-200 ease-in-out
          ${isInputVisible ? 'opacity-0' : 'opacity-100'}
        `}
      >
        {text}
      </button>
    </div>
  );
}
