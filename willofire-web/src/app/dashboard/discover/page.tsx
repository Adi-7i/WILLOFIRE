import { Metadata } from 'next';
import { DiscoverPageClient } from './DiscoverPageClient';

export const metadata: Metadata = {
    title: 'Discover | Current Affairs Intelligence | Willofire',
    description: 'Curated important developments with exam relevance for aspirants.',
};

export default function Page() {
    return <DiscoverPageClient />;
}
