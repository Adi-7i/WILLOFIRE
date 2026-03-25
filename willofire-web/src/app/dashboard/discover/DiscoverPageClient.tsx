'use client';

import dynamic from 'next/dynamic';

export const DiscoverPageClient = dynamic(
    () => import('@/features/discover/DiscoverPage').then((mod) => mod.DiscoverPage),
    { ssr: false }
);
