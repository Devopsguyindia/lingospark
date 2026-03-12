'use client';

import { SpeechProvider } from './context/SpeechContext';

export function Providers({ children }) {
    return (
        <SpeechProvider>
            {children}
        </SpeechProvider>
    );
}
