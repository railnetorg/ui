import type * as React from 'react';
import { IconPlaceholder } from '@/components/icon-placeholder';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Draws its own frame; `frame={false}` drops it for a table that already sits in a card. On wide screens the frame
 * clips instead of scrolling, so the header can stick to the page (`--table-sticky-top` sets how far from the top it
 * stops); on phones, and always with `scroll`, it scrolls sideways and the header only sticks inside the table.
 */
function Table({
  className,
  frame = true,
  scroll = false,
  ...props
}: React.ComponentProps<'table'> & { frame?: boolean; scroll?: boolean }) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        'relative w-full',
        scroll ? 'overflow-x-auto' : 'overflow-clip max-md:overflow-x-auto',
        frame && 'rounded-xl border bg-card',
      )}
    >
      <table data-slot="table" className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('[&_tr]:border-0', className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('font-normal [&>tr:not([data-static]):hover]:bg-accent [&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return <tfoot data-slot="table-footer" className={cn('border-t [&>tr]:last:border-b-0', className)} {...props} />;
}

/**
 * `nested` draws a row that belongs to the row above it, at depth 1 or 2: tinted, no line between them, first cell
 * indented. Put a TableTreeLine in that cell to tie it to its parent.
 */
function TableRow({ className, nested, ...props }: React.ComponentProps<'tr'> & { nested?: boolean | 1 | 2 }) {
  const depth = nested === true ? 1 : nested || undefined;
  return (
    <tr
      data-slot="table-row"
      data-nested={depth}
      className={cn(
        'border-b transition-colors data-[state=selected]:bg-muted',
        depth && 'border-0 bg-muted/30 [&:has(+tr:not([data-nested]))]:border-b [&>td:first-child]:relative',
        depth === 1 && '[&>td:first-child]:pl-10',
        depth === 2 && '[&>td:first-child]:pl-16',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, children, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'sticky top-(--table-sticky-top,0px) z-10 bg-card px-3 text-left align-middle font-medium text-muted-foreground text-sm shadow-[inset_0_-1px_0_var(--border)] [&.text-center>div]:justify-center [&.text-right>div]:justify-end [&:has([role=checkbox])]:pr-0 [&_[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    >
      <div className="flex min-h-12 items-center py-3">{children}</div>
    </th>
  );
}

/** Every Avatar in a cell is 20px, so logos and icon thumbnails read at one size; an icon inside it is 12px. */
const CELL_MEDIA =
  '[&_[data-slot=avatar]]:size-5 [&_[data-slot=avatar-fallback]]:text-[9px] [&_[data-slot=avatar]_svg]:size-3 [&_[data-slot=avatar-badge]]:size-2';

/** `numeric` gives figures equal-width digits, so they line up in a column; they stay left-aligned like all text. */
function TableCell({ className, numeric, ...props }: React.ComponentProps<'td'> & { numeric?: boolean }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-3 py-3.5 align-middle font-normal text-foreground text-sm [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        CELL_MEDIA,
        numeric && 'tabular-nums',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption data-slot="table-caption" className={cn('mt-4 text-muted-foreground text-sm', className)} {...props} />
  );
}

/**
 * The line that ties a nested row to its parent, in the row's first cell: a rail from the top and an elbow into the
 * row, the rail going on to the next sibling unless `last`. At depth 2, `parentContinues` keeps the depth-1 rail
 * running past it.
 */
function TableTreeLine({
  depth = 1,
  last = false,
  parentContinues = false,
}: {
  depth?: 1 | 2;
  last?: boolean;
  parentContinues?: boolean;
}) {
  const left = 22 + (depth - 1) * 24;
  return (
    <span aria-hidden data-slot="table-tree-line" className="pointer-events-none text-muted-foreground/25">
      {depth === 2 && parentContinues && <span className="absolute inset-y-0 left-[22px] w-px bg-current" />}
      <span className="absolute inset-y-0 w-3" style={{ left }}>
        <span className={cn('absolute top-0 left-0 w-px bg-current', last ? 'h-[calc(50%-10px)]' : 'bottom-0')} />
        <svg
          className="absolute top-[calc(50%-10px)] left-0 h-[10px] w-3 overflow-visible"
          viewBox="0 0 12 10"
          fill="none"
          preserveAspectRatio="none"
        >
          <path d="M0.5 0 C0.5 6.5 3 9.5 12 9.5" stroke="currentColor" strokeWidth="1" />
        </svg>
      </span>
    </span>
  );
}

/** The row a table shows when it has nothing to list. */
function TableEmpty({
  colSpan,
  className,
  children = 'No results.',
  ...props
}: React.ComponentProps<'td'> & { colSpan: number }) {
  return (
    <tr data-slot="table-empty" data-static="">
      <td colSpan={colSpan} className={cn('h-24 px-3 text-center text-muted-foreground', className)} {...props}>
        {children}
      </td>
    </tr>
  );
}

/** Placeholder rows while a table loads: one bar per cell. */
function TableLoading({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row} data-slot="table-loading" data-static="" className="border-b">
      {Array.from({ length: columns }, (_, column) => (
        <td key={column} className="px-3 py-3.5">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  ));
}

/**
 * The pager under a table: an optional count on the left, then previous, `page/pageCount` and next. `page` starts
 * at 1; a table with no rows still reads 1/1. The labels default to English: pass the app's translations.
 */
function TablePagination({
  page,
  pageCount,
  onPageChange,
  label = 'Pagination',
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  className,
  children,
  ...props
}: React.ComponentProps<'nav'> & {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
}) {
  const total = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), total);
  return (
    <nav
      data-slot="table-pagination"
      aria-label={label}
      className={cn('flex items-center justify-between gap-4 text-muted-foreground text-sm', className)}
      {...props}
    >
      <div>{children}</div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={previousLabel}
          disabled={current <= 1}
          onClick={() => onPageChange?.(current - 1)}
        >
          <IconPlaceholder
            lucide="ArrowLeftIcon"
            tabler="IconArrowLeft"
            hugeicons="ArrowLeft02Icon"
            phosphor="ArrowLeftIcon"
            remixicon="RiArrowLeftLine"
          />
        </Button>
        <span aria-live="polite" className="tabular-nums">
          {current}/{total}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={nextLabel}
          disabled={current >= total}
          onClick={() => onPageChange?.(current + 1)}
        >
          <IconPlaceholder
            lucide="ArrowRightIcon"
            tabler="IconArrowRight"
            hugeicons="ArrowRight02Icon"
            phosphor="ArrowRightIcon"
            remixicon="RiArrowRightLine"
          />
        </Button>
      </div>
    </nav>
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableLoading,
  TablePagination,
  TableRow,
  TableTreeLine,
};
