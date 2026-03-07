import { aiApi } from './ai';
import { mcqApi } from './mcq';
import { pdfApi } from './pdf';
import { DownloadItem } from './types';

const formatDate = (value: string): string =>
    new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));

export const downloadsApi = {
    list: async (): Promise<DownloadItem[]> => {
        const [tests, pdfs] = await Promise.all([mcqApi.list(), pdfApi.list()]);

        const itemsWithSortDate: Array<DownloadItem & { sortDate: number }> = [];

        for (const test of tests) {
            const sortDate = new Date(test.createdAt).getTime();
            const createdAt = formatDate(test.createdAt);

            itemsWithSortDate.push({
                id: `test-${test.id}`,
                title: `${test.title} — Mock Test`,
                category: 'mock-test',
                createdAt,
                action: () => mcqApi.downloadTest(test.id),
                sortDate,
            });

            itemsWithSortDate.push({
                id: `key-${test.id}`,
                title: `${test.title} — Answer Key`,
                category: 'answer-key',
                createdAt,
                action: () => mcqApi.downloadAnswerKey(test.id),
                sortDate,
            });
        }

        for (const pdf of pdfs.filter((item) => item.status === 'ready')) {
            itemsWithSortDate.push({
                id: `long-${pdf.id}`,
                title: `${pdf.originalName.replace(/\.pdf$/i, '')} — Long Questions`,
                category: 'long-question',
                createdAt: formatDate(pdf.createdAt),
                action: () =>
                    aiApi.downloadLongQuestionPdf({
                        pdfId: pdf.id,
                        count: 10,
                        marks: 10,
                    }),
                sortDate: new Date(pdf.createdAt).getTime(),
            });
        }

        return itemsWithSortDate
            .sort((a, b) => b.sortDate - a.sortDate)
            .map((item) => ({
                id: item.id,
                title: item.title,
                category: item.category,
                createdAt: item.createdAt,
                sizeLabel: item.sizeLabel,
                action: item.action,
            }));
    },
};
