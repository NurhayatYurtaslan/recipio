'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const heroImages = [
    {
        url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=800&fit=crop',
        alt: 'Lezzetli yemekler',
    },
    {
        url: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=1920&h=800&fit=crop',
        alt: 'Taze malzemeler',
    },
    {
        url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1920&h=800&fit=crop',
        alt: 'Ev yapımı tarifler',
    },
    {
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&h=800&fit=crop',
        alt: 'Sağlıklı yemekler',
    },
    {
        url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&h=800&fit=crop',
        alt: 'Pizza ve İtalyan mutfağı',
    },
];

export function HomeHero() {
    const t = useTranslations('HomePage');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlaying) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToPrevious = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    };

    const goToNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    };

    const goToSlide = (index: number) => {
        setIsAutoPlaying(false);
        setCurrentIndex(index);
    };

    return (
        <section className="relative h-[400px] md:h-[500px] overflow-hidden">
            {/* Carousel Images */}
            <div className="absolute inset-0">
                {heroImages.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <Image
                            src={image.url}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            priority={index === 0}
                            sizes="100vw"
                        />
                    </div>
                ))}
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-[#26f2a1] text-sm font-medium mb-6">
                        <Sparkles className="h-4 w-4" />
                        <span>{t('heroBadge')}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                        {t('heroTitle')}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
                        {t('heroDescription')}
                    </p>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                aria-label="Önceki"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                aria-label="Sonraki"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            index === currentIndex
                                ? 'bg-white w-6'
                                : 'bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

