'use client';

import { ThemeProvider } from 'next-themes';
import { motion } from 'framer-motion';

type Props = {
    children: React.ReactNode;
};

export function Providers({ children }: Props) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {children}
            </motion.div>
        </ThemeProvider>
    );
}
