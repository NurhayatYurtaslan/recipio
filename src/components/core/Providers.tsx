'use client';

import { ThemeProvider } from 'next-themes';
import { motion } from 'framer-motion';

type Props = {
    children: React.ReactNode;
};

export function Providers({ children }: Props) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
            {children}
        </ThemeProvider>
    );
}
