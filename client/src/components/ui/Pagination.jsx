import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ page, pages, total, onPageChange }) {
    if (pages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {pages} ({total} total)
            </p>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
                    <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= pages}>
                    Next <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}