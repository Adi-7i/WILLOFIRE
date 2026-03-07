import { DiscoverPage } from '@/features/discover/DiscoverPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Discover | Current Affairs Intelligence | Willofire',
    description: 'Curated important developments with exam relevance for aspirants.',
};

export default function Page() {
    return <DiscoverPage />;
}
