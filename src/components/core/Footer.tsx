'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Github, Twitter, Instagram, Mail } from 'lucide-react';

export function Footer() {
    const t = useTranslations('Footer');
    const locale = useLocale();

    return (
        <footer className="mt-12 border-t bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            Recipio
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-md">
                            {t('description')}
                        </p>
                        {/* Social Media Links */}
                        <div className="flex gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="mailto:info@recipio.com"
                                className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                aria-label="Email"
                            >
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('legal')}</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/legal/terms"
                                    className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                >
                                    {t('termsOfService')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/legal/privacy"
                                    className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                >
                                    {t('privacyPolicy')}
                                </Link>
                            </li>
                            {locale === 'tr' && (
                                <li>
                                    <Link
                                        href="/legal/kvkk"
                                        className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                    >
                                        {t('kvkk')}
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('support')}</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                >
                                    {t('contact')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                >
                                    {t('about')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground text-center md:text-left">
                            &copy; {new Date().getFullYear()} Recipio. {t('allRightsReserved')}
                        </p>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                            <Link
                                href="/legal/terms"
                                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            >
                                {t('terms')}
                            </Link>
                            <Link
                                href="/legal/privacy"
                                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            >
                                {t('privacy')}
                            </Link>
                            {locale === 'tr' && (
                                <Link
                                    href="/legal/kvkk"
                                    className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                >
                                    {t('kvkk')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
