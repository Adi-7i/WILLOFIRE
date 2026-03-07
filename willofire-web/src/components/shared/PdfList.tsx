import { FileText, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PdfListItem } from '@/lib/api/types';

const statusConfig = {
    uploaded: { label: 'Uploaded', className: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    processing: { label: 'Processing', className: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    ready: { label: 'Ready', className: 'bg-green-50 text-green-700 hover:bg-green-100' },
    failed: { label: 'Failed', className: 'bg-red-50 text-red-700 hover:bg-red-100' },
};

interface PdfListProps {
    pdfs: PdfListItem[];
    isLoading: boolean;
    isError: boolean;
}

const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));

export function PdfList({ pdfs, isLoading, isError }: PdfListProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <h3 className="text-base font-semibold text-slate-900">Your Uploaded PDFs</h3>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-slate-50/50">
                            <TableHead className="w-[400px]">File Name</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Uploaded At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                    Loading PDFs...
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-red-500">
                                    Failed to load PDFs.
                                </TableCell>
                            </TableRow>
                        ) : pdfs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                    No PDFs uploaded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pdfs.map((pdf) => (
                                <TableRow key={pdf.id}>
                                    <TableCell className="font-medium text-slate-900">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded p-2 bg-blue-50 text-blue-600">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <span className="truncate max-w-[250px] sm:max-w-xs">{pdf.originalName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500">{formatFileSize(pdf.fileSizeBytes)}</TableCell>
                                    <TableCell className="text-slate-500">{formatDate(pdf.createdAt)}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={`${statusConfig[pdf.status].className} font-medium border-0`}>
                                            {statusConfig[pdf.status].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem disabled={pdf.status !== 'ready'}>Generate Mock Test</DropdownMenuItem>
                                                <DropdownMenuItem disabled={pdf.status !== 'ready'}>Ask PDF</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" disabled>
                                                    Delete PDF
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
