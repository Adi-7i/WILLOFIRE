'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { Check, ChevronDown, FileText, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PdfListItem } from '@/lib/api/types';

interface PdfControlPanelProps {
    readyPdfs: PdfListItem[];
    selectedPdfIds: string[];
    onTogglePdf: (pdfId: string) => void;
    onRemovePdf: (pdfId: string) => void;
}

export function PdfControlPanel({ readyPdfs, selectedPdfIds, onTogglePdf, onRemovePdf }: PdfControlPanelProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleOutside = (event: MouseEvent) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const filteredPdfs = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return readyPdfs;
        return readyPdfs.filter((pdf) => pdf.originalName.toLowerCase().includes(q));
    }, [readyPdfs, search]);

    const selectedPdfs = useMemo(
        () => readyPdfs.filter((pdf) => selectedPdfIds.includes(pdf.id)),
        [readyPdfs, selectedPdfIds]
    );

    return (
        <aside className="flex h-full w-full max-w-[320px] flex-col gap-4 border-r border-border pr-4">
            <div className="pt-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">PDF Control</p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">Material Scope</h2>
            </div>

            <div ref={rootRef} className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-card/60 px-3 text-sm text-foreground/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3F6E6A]/45 wf-soft-glow-hover"
                >
                    <span className="truncate">
                        {selectedPdfs.length > 0 ? `${selectedPdfs.length} PDF${selectedPdfs.length > 1 ? 's' : ''} selected` : 'Select PDFs'}
                    </span>
                    <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-300', open && 'rotate-180')} />
                </button>

                {open && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-card/95 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
                        <div className="relative mb-3">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/80" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search PDFs"
                                className="h-9 border-border bg-background/80 pl-9 text-foreground placeholder:text-muted-foreground/80"
                            />
                        </div>
                        <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
                            {filteredPdfs.map((pdf) => {
                                const isSelected = selectedPdfIds.includes(pdf.id);
                                return (
                                    <button
                                        key={pdf.id}
                                        type="button"
                                        onClick={() => onTogglePdf(pdf.id)}
                                        className={cn(
                                            'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                                            isSelected ? 'bg-[rgba(46,74,98,0.35)] text-[#B6C8D5]' : 'text-foreground/90 hover:bg-accent/35'
                                        )}
                                    >
                                        <span className="truncate">{pdf.originalName}</span>
                                        {isSelected && <Check className="h-4 w-4 shrink-0" />}
                                    </button>
                                );
                            })}
                            {filteredPdfs.length === 0 && <p className="px-2.5 py-2 text-sm text-muted-foreground/80">No PDFs found.</p>}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Selected PDFs</p>
                <div className="space-y-2">
                    {selectedPdfs.length === 0 && (
                        <div className="rounded-xl border border-border bg-card/45 px-3 py-2.5 text-sm text-muted-foreground/80">
                            No PDFs selected
                        </div>
                    )}
                    {selectedPdfs.map((pdf) => (
                        <div
                            key={pdf.id}
                            className="group flex items-center gap-2 rounded-xl border border-border bg-card/55 px-3 py-2.5 text-sm text-foreground/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3F6E6A]/45 wf-soft-glow-hover"
                        >
                            <FileText className="h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate">{pdf.originalName}</span>
                            <button
                                type="button"
                                onClick={() => onRemovePdf(pdf.id)}
                                className="ml-auto rounded-md p-1 text-muted-foreground/80 transition-colors hover:bg-accent/35 hover:text-foreground"
                                aria-label={`Remove ${pdf.originalName}`}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
