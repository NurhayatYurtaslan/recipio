import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import { FileText } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const t = await getTranslations('Legal');
    
    return {
        title: t('termsOfService') + ' - Recipio',
        description: t('termsDescription'),
    };
}

export default async function TermsPage() {
    const locale = await getLocale();
    const t = await getTranslations('Legal');

    return (
        <Providers>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
                        <div className="mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
                                <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h1 className="text-4xl font-bold mb-4">{t('termsOfService')}</h1>
                            <p className="text-muted-foreground">
                                {t('lastUpdated')}: {new Date().toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">{t('section1Title')}</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {t('section1Content')}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">{t('section2Title')}</h2>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    {t('section2Content')}
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                    <li>{t('section2Item1')}</li>
                                    <li>{t('section2Item2')}</li>
                                    <li>{t('section2Item3')}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">{t('section3Title')}</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {t('section3Content')}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">{t('section4Title')}</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {t('section4Content')}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">{t('section5Title')}</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {t('section5Content')}
                                </p>
                            </section>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </Providers>
    );
}
