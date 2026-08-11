import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Simple numbered pagination: Previous [1] [2] [3] Next
 * Shows at most 5 page numbers around the current page, with ellipses
 * for larger ranges.
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageList(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
      >
        <ChevronLeft size={15} />
        Prev
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium ${
              p === page ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
      >
        Next
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

function getPageList(current, total) {
  const delta = 1; // pages shown on each side of current
  const range = [];
  const rangeWithDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (last) {
      if (i - last === 2) rangeWithDots.push(last + 1);
      else if (i - last > 2) rangeWithDots.push("...");
    }
    rangeWithDots.push(i);
    last = i;
  }

  return rangeWithDots;
}