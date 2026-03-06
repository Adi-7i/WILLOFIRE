'use client';

import { useState } from 'react';
import { DownloadCard, DownloadCategory } from '@/components/shared/DownloadCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderHeart, FileDown } from 'lucide-react';

interface DownloadItem {
    id: string;
    title: string;
    category: DownloadCategory;
    date: string;
    size: string;
}

const DUMMY_DOWNLOADS: DownloadItem[] = [
    { id: '1', title: 'Thermodynamics Mock Test — Oct 2023', category: 'mock-test', date: 'Oct 12, 2023', size: '1.2 MB' },
    { id: '2', title: 'Organic Chemistry Mock Test — Oct 2023', category: 'mock-test', date: 'Oct 10, 2023', size: '890 KB' },
    { id: '3', title: 'Physics Answer Key — Set A', category: 'answer-key', date: 'Oct 12, 2023', size: '340 KB' },
    { id: '4', title: 'Chemistry Answer Key — Set B', category: 'answer-key', date: 'Oct 10, 2023', size: '290 KB' },
    { id: '5', title: 'Electrostatics Long Questions', category: 'long-question', date: 'Sep 28, 2023', size: '680 KB' },
    { id: '6', title: 'Organic Reactions Long Questions', category: 'long-question', date: 'Sep 25, 2023', size: '720 KB' },
];

export default function DownloadsPage() {
    const [activeTab, setActiveTab] = useState('all');

    const filteredDownloads = activeTab === 'all'
        ? DUMMY_DOWNLOADS
        : DUMMY_DOWNLOADS.filter(d => d.category === activeTab);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Download Center
                </h1>
                <p className="text-slate-500 mt-2">
                    Access all your generated mock tests, answer keys, and question banks.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-slate-100 p-1 mb-6 flex-wrap h-auto w-full justify-start overflow-x-auto">
                            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">All Files</TabsTrigger>
                            <TabsTrigger value="mock-test" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">Mock Tests</TabsTrigger>
                            <TabsTrigger value="answer-key" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">Answer Keys</TabsTrigger>
                            <TabsTrigger value="long-question" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">Long Questions</TabsTrigger>
                        </TabsList>

                        {filteredDownloads.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                                    <FolderHeart className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No files found</h3>
                                <p className="text-sm text-slate-500 mt-2 max-w-[250px]">
                                    You haven't generated any files in this category yet.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredDownloads.map(file => (
                                    <DownloadCard
                                        key={file.id}
                                        title={file.title}
                                        category={file.category}
                                        date={file.date}
                                        size={file.size}
                                    />
                                ))}
                            </div>
                        )}
                    </Tabs>
                </div>

                {/* Sidebar - Recent Downloads */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 sticky top-20">
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-4 border-b border-slate-100">Recent Downloads</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Physics Answer Key - Set A.pdf', time: '10 mins ago' },
                                { name: 'Thermodynamics Mock Test.pdf', time: '2 hours ago' },
                                { name: 'Electrostatics Long Questions.pdf', time: '1 day ago' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 group cursor-pointer">
                                    <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                        <FileDown className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {item.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
