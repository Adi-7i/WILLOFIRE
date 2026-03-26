'use client';

import { useMemo, useState } from 'react';
import { DownloadCard } from '@/components/shared/DownloadCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderHeart, FileDown } from 'lucide-react';
import { useDownloadAction, useDownloads } from '@/hooks/use-downloads';

export default function DownloadsPage() {
    const [activeTab, setActiveTab] = useState('all');

    const downloadsQuery = useDownloads();
    const downloadMutation = useDownloadAction();
    const allDownloads = useMemo(() => downloadsQuery.data ?? [], [downloadsQuery.data]);

    const filteredDownloads = useMemo(
        () =>
            activeTab === 'all'
                ? allDownloads
                : allDownloads.filter((item) => item.category === activeTab),
        [activeTab, allDownloads],
    );

    const recentDownloads = allDownloads.slice(0, 3);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Download Center</h1>
                <p className="text-muted-foreground mt-2">Access all your generated mock tests, answer keys, and question banks.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-muted/55 p-1 mb-6 flex-wrap h-auto w-full justify-start overflow-x-auto">
                            <TabsTrigger value="all" className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">All Files</TabsTrigger>
                            <TabsTrigger value="mock-test" className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">Mock Tests</TabsTrigger>
                            <TabsTrigger value="answer-key" className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">Answer Keys</TabsTrigger>
                            <TabsTrigger value="long-question" className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">Long Questions</TabsTrigger>
                        </TabsList>

                        {downloadsQuery.isLoading ? (
                            <div className="p-8 rounded-xl border border-border bg-card text-sm text-muted-foreground">Loading downloads...</div>
                        ) : filteredDownloads.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border bg-muted/35 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                                <div className="w-16 h-16 bg-muted/55 text-muted-foreground/80 rounded-full flex items-center justify-center mb-4">
                                    <FolderHeart className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">No files found</h3>
                                <p className="text-sm text-muted-foreground mt-2 max-w-[250px]">You haven&apos;t generated any files in this category yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredDownloads.map((file) => (
                                    <DownloadCard
                                        key={file.id}
                                        id={file.id}
                                        title={file.title}
                                        category={file.category}
                                        date={file.createdAt}
                                        size={file.sizeLabel}
                                        isDownloading={downloadMutation.isPending}
                                        onDownload={(id) => {
                                            const target = allDownloads.find((item) => item.id === id);
                                            if (!target) return;
                                            downloadMutation.mutate(target.action);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </Tabs>
                </div>

                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-border bg-card shadow-sm p-5 sticky top-20">
                        <h3 className="text-sm font-semibold text-foreground mb-4 pb-4 border-b border-border/70">Recent Downloads</h3>
                        <div className="space-y-4">
                            {recentDownloads.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No generated files yet.</p>
                            ) : (
                                recentDownloads.map((item) => (
                                    <div key={item.id} className="flex items-start gap-3 group">
                                        <div className="w-8 h-8 rounded bg-muted/35 border border-border/70 flex flex-col items-center justify-center shrink-0">
                                            <FileDown className="w-4 h-4 text-muted-foreground/80" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-foreground/85 leading-tight line-clamp-2">{item.title}</p>
                                            <p className="text-[10px] text-muted-foreground/80 mt-1">{item.createdAt}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
