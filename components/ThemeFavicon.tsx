'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function ThemeFavicon() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const appleTouchIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    const appleTouchIconPrecomposed = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon-precomposed"]');

    if (resolvedTheme === 'dark') {
      favicon?.setAttribute('href', '/favicon-dark.ico');
      appleTouchIcon?.setAttribute('href', '/apple-icon-dark.png');
      appleTouchIconPrecomposed?.setAttribute('href', '/apple-icon-precomposed-dark.png');
    } else {
      favicon?.setAttribute('href', '/favicon.ico');
      appleTouchIcon?.setAttribute('href', '/apple-icon.png');
      appleTouchIconPrecomposed?.setAttribute('href', '/apple-icon-precomposed.png');
    }
  }, [resolvedTheme]);

  return null;
} 