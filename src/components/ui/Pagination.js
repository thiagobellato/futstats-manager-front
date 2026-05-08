import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-brand-border">
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="text-brand-muted hover:text-white"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      {startPage > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(1)}
            className="w-10"
          >
            1
          </Button>
          {startPage > 2 && <span className="text-brand-muted">...</span>}
        </>
      )}

      {pages.map(page => (
        <Button
          key={page}
          variant={currentPage === page ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onPageChange(page)}
          className="w-10"
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-brand-muted">...</span>}
          <Button
            variant={currentPage === totalPages ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="w-10"
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="text-brand-muted hover:text-white"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
