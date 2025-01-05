import localFont from 'next/font/local';

// GT Super Display font for titles
export const gtSuperDisplay = localFont({
  src: [
    {
      path: '../public/fonts/GT-Super-Display-Medium.woff2',
      weight: '500',
      style: 'normal',
    }
  ],
  variable: '--font-gt-super-display',
  display: 'swap',
});

// GT Super Text font for body text
export const gtSuperText = localFont({
  src: [
    {
      path: '../public/fonts/GT-Super-Text-Medium.woff2',
      weight: '500',
      style: 'normal',
    }
  ],
  variable: '--font-gt-super-text',
  display: 'swap',
}); 