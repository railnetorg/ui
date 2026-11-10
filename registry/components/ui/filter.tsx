import * as React from 'react';
import { IconPlaceholder } from '@/components/icon-placeholder';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

/** An option a filter can pick: an Avatar as its `icon` (drawn at 20px), and how many results it has. */
type FilterOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
};

/** Every Avatar in a filter is 20px, as in a table cell. */
const MEDIA =
  '[&_[data-slot=avatar]]:size-5 [&_[data-slot=avatar-fallback]]:text-[9px] [&_[data-slot=avatar]_svg]:size-3';

/** Lists past this many options get a search field. */
const SEARCH_FROM = 8;

/**
 * The options of one filter, the same in a pill and in the add-filter menu: a checkbox (or a check mark when only one
 * can be picked), the icon, the label and the count, with a search field once the list is long.
 */
function FilterOptionList({
  options,
  value,
  onValueChange,
  multiple = true,
  searchable = options.length >= SEARCH_FROM,
  searchPlaceholder = 'Search…',
  emptyText = 'No options.',
}: {
  options: FilterOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
}) {
  const toggle = (option: string) => {
    if (!multiple) return onValueChange(value.includes(option) ? [] : [option]);
    onValueChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  };
  return (
    <Command data-slot="filter-option-list" className="rounded-none! bg-transparent p-0">
      {searchable && <CommandInput placeholder={searchPlaceholder} />}
      <CommandList className="p-1">
        <CommandEmpty className="py-4 text-muted-foreground">{emptyText}</CommandEmpty>
        {options.map((option) => {
          const checked = value.includes(option.value);
          return (
            <CommandItem
              key={option.value}
              value={option.label}
              keywords={[option.value]}
              data-checked={!multiple && checked}
              onSelect={() => toggle(option.value)}
              className={cn('gap-2.5 py-2', MEDIA, multiple && '[&>svg:last-child]:hidden')}
            >
              {multiple && <Checkbox checked={checked} tabIndex={-1} aria-hidden className="pointer-events-none" />}
              {option.icon}
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.count != null && (
                <span className="text-muted-foreground text-xs tabular-nums">{option.count}</span>
              )}
            </CommandItem>
          );
        })}
      </CommandList>
    </Command>
  );
}

/**
 * An active filter: its label, what it keeps (opening `children` to change it, when given) and a clear button. With
 * no `value`, the label alone says what is on, as for a yes/no filter.
 */
function FilterPill({
  label,
  value,
  onClear,
  clearLabel = `Clear ${label}`,
  children,
  open,
  onOpenChange,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  onClear: () => void;
  clearLabel?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  const valueClass = cn('inline-flex h-full items-center gap-2 px-3', MEDIA);
  return (
    <div
      data-slot="filter-pill"
      className={cn(
        'inline-flex h-9 shrink-0 items-center overflow-hidden rounded-md border bg-background text-sm',
        className,
      )}
    >
      <span className={cn('px-3', value != null && 'text-muted-foreground')}>{label}</span>
      {value != null && (
        <>
          <span className="w-px self-stretch bg-border" />
          {children ? (
            <Popover open={open} onOpenChange={onOpenChange}>
              <PopoverTrigger
                render={<button type="button" className={cn(valueClass, 'cursor-pointer hover:bg-muted')} />}
              >
                {value}
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto min-w-44 max-w-72 gap-0 p-0">
                {children}
              </PopoverContent>
            </Popover>
          ) : (
            <span className={valueClass}>{value}</span>
          )}
        </>
      )}
      <span className="w-px self-stretch bg-border" />
      <button
        type="button"
        aria-label={clearLabel}
        onClick={onClear}
        className="flex h-full cursor-pointer items-center px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <IconPlaceholder
          lucide="XIcon"
          tabler="IconX"
          hugeicons="Cancel01Icon"
          phosphor="XIcon"
          remixicon="RiCloseLine"
          className="size-3"
        />
      </button>
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  options: FilterOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  clearLabel?: string;
  /** How many picked labels the pill spells out before "+N". */
  maxVisible?: number;
};

/** A pick-list filter as a pill: nothing when nothing is picked, else the picks, which open the option list. */
function FilterSelect({
  label,
  options,
  value,
  onValueChange,
  multiple = true,
  searchable,
  searchPlaceholder,
  emptyText,
  clearLabel,
  maxVisible = 2,
}: FilterSelectProps) {
  const picked = options.filter((option) => value.includes(option.value));
  if (picked.length === 0) return null;
  const shown = picked.slice(0, maxVisible);
  return (
    <FilterPill
      label={label}
      clearLabel={clearLabel}
      onClear={() => onValueChange([])}
      value={
        <>
          {picked[0]?.icon}
          <span className="max-w-48 truncate">{shown.map((option) => option.label).join(', ')}</span>
          {picked.length > shown.length && (
            <span className="text-muted-foreground">+{picked.length - shown.length}</span>
          )}
        </>
      }
    >
      <FilterOptionList
        options={options}
        value={value}
        onValueChange={onValueChange}
        multiple={multiple}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        emptyText={emptyText}
      />
    </FilterPill>
  );
}

type FilterRangeBodyProps = {
  value: number;
  onValueChange: (value: number) => void;
  max: number;
  step?: number;
  format?: (value: number) => string;
  atLeastLabel?: string;
  maxLabel?: string;
};

/** A floor: "At least X", a slider from 0 to `max`, and a shortcut to the maximum. */
function FilterRangeBody({
  value,
  onValueChange,
  max,
  step = max / 100,
  format = String,
  atLeastLabel = 'At least',
  maxLabel = 'Max',
}: FilterRangeBodyProps) {
  return (
    <div data-slot="filter-range" className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">
          {atLeastLabel} <span className="text-foreground tabular-nums">{format(value)}</span>
        </span>
        <Button
          variant="link"
          size="xs"
          disabled={value >= max}
          onClick={() => onValueChange(max)}
          className="h-auto px-0 font-normal text-muted-foreground hover:text-foreground"
        >
          {maxLabel} {format(max)}
        </Button>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={max}
        step={step}
        onValueChange={(next) => onValueChange(Array.isArray(next) ? (next[0] ?? 0) : next)}
      />
    </div>
  );
}

/** A floor filter as a pill: "≥ X" when set, staying open while it is dragged back to 0. */
function FilterRange({ label, clearLabel, ...body }: FilterRangeBodyProps & { label: string; clearLabel?: string }) {
  const [open, setOpen] = React.useState(false);
  if (body.value <= 0 && !open) return null;
  const format = body.format ?? String;
  return (
    <FilterPill
      label={label}
      clearLabel={clearLabel}
      open={open}
      onOpenChange={setOpen}
      onClear={() => {
        setOpen(false);
        body.onValueChange(0);
      }}
      value={<span className="tabular-nums">≥ {format(body.value)}</span>}
    >
      <FilterRangeBody {...body} />
    </FilterPill>
  );
}

/** Each filter the add-filter menu offers: a pick-list, a floor, or a yes/no switch. */
type FilterMenuItem = { id: string; label: string; icon?: React.ReactNode } & (
  | ({ kind: 'select' } & Omit<FilterSelectProps, 'label' | 'clearLabel' | 'maxVisible'>)
  | ({ kind: 'range' } & FilterRangeBodyProps)
  | { kind: 'toggle'; checked: boolean; onCheckedChange: (checked: boolean) => void }
);

/** Keys typed in a search field or a slider inside a submenu stay there, except Escape which closes the menu. */
const keepKeys = (event: React.KeyboardEvent) => {
  if (event.key !== 'Escape') event.stopPropagation();
};

/**
 * The add-filter button: a menu of every filter, each opening its options in a submenu on hover, to the left since
 * the button ends the bar. It is always the icon alone, named by `label`.
 */
function FilterMenu({ items, label = 'Filter' }: { items: FilterMenuItem[]; label?: string }) {
  const groups = (['select', 'range', 'toggle'] as const)
    .map((kind) => items.filter((item) => item.kind === kind))
    .filter((group) => group.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button data-slot="filter-menu" variant="outline" size="icon" aria-label={label} title={label} />}
      >
        <IconPlaceholder
          lucide="ListFilterIcon"
          tabler="IconFilter"
          hugeicons="Menu08Icon"
          phosphor="FunnelSimpleIcon"
          remixicon="RiFilter3Line"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {groups.map((group, index) => (
          <React.Fragment key={group[0]?.kind}>
            {index > 0 && <DropdownMenuSeparator />}
            {group.map((item) => {
              if (item.kind === 'toggle') {
                return (
                  <DropdownMenuCheckboxItem
                    key={item.id}
                    checked={item.checked}
                    onCheckedChange={item.onCheckedChange}
                    className={cn('py-2', MEDIA)}
                  >
                    {item.icon}
                    {item.label}
                  </DropdownMenuCheckboxItem>
                );
              }
              const count = item.kind === 'select' ? item.value.length : item.value > 0 ? 1 : 0;
              return (
                <DropdownMenuSub key={item.id}>
                  <DropdownMenuSubTrigger className={cn('gap-2.5 py-2', MEDIA)}>
                    {item.icon}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {count > 0 && <span className="text-muted-foreground text-xs tabular-nums">{count}</span>}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent side="left" className="w-auto min-w-44 max-w-72 p-0">
                    {/* biome-ignore lint/a11y/noStaticElementInteractions: only keeps the submenu's keys from the menu */}
                    <div onKeyDown={keepKeys}>
                      {item.kind === 'select' ? (
                        <FilterOptionList
                          options={item.options}
                          value={item.value}
                          onValueChange={item.onValueChange}
                          multiple={item.multiple}
                          searchable={item.searchable}
                          searchPlaceholder={item.searchPlaceholder}
                          emptyText={item.emptyText}
                        />
                      ) : (
                        <FilterRangeBody {...item} />
                      )}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            })}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The search field at the start of a filter bar. */
function FilterSearch({
  value,
  onValueChange,
  placeholder = 'Search',
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <InputGroup data-slot="filter-search" className={cn('h-9 w-full shrink-0 sm:w-56', className)}>
      <InputGroupAddon>
        <IconPlaceholder
          lucide="SearchIcon"
          tabler="IconSearch"
          hugeicons="SearchIcon"
          phosphor="MagnifyingGlassIcon"
          remixicon="RiSearchLine"
          className="size-4"
        />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </InputGroup>
  );
}

/** Clears every filter at once; only worth showing while one is on. */
function FilterClear({ children = 'Clear filters', ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button data-slot="filter-clear" variant="ghost" size="sm" className="shrink-0" {...props}>
      {children}
    </Button>
  );
}

/**
 * The row of a list's filters: search and the active pills from the left, clear and the add-filter menu pinned to the
 * right. It wraps onto more lines rather than hide a pill.
 */
function FilterBar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="filter-bar"
      className={cn(
        'flex flex-wrap items-center gap-2 *:data-[slot=filter-clear]:ml-auto *:data-[slot=filter-menu]:ml-auto [&>[data-slot=filter-clear]~[data-slot=filter-menu]]:ml-0',
        className,
      )}
      {...props}
    />
  );
}

/** The active pills of a filter bar; each stays whole and moves to the next line when the row is full. */
function FilterPills({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="filter-pills" className={cn('contents', className)} {...props} />;
}

export {
  FilterBar,
  FilterClear,
  FilterMenu,
  type FilterMenuItem,
  type FilterOption,
  FilterOptionList,
  FilterPill,
  FilterPills,
  FilterRange,
  FilterRangeBody,
  FilterSearch,
  FilterSelect,
};
