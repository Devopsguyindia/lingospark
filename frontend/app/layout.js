import './globals.css';

import { Providers } from './providers';

export const metadata = {
  title: 'LingoSpark — Learn Languages the Fun Way!',
  description: 'A fun language learning app for kids and beginners. Master Listening, Speaking, Reading, and Writing skills with CEFR-aligned lessons.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
