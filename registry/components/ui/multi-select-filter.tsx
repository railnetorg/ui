import { Cancel01Icon, Menu08Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRef } from 'react';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  useFilteredItems,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';

type FilterOption = {
  value: string;
  label: string;
  iconUrl?: string;
};

function OptionIcon({ url, size = 'size-5' }: { url?: string; size?: string }) {
  if (!url) return null;
  return <img src={url} className={cn(size, 'rounded-full')} alt="" />;
}

function FilteredOptions({ optionByLabel }: { optionByLabel: Map<string, FilterOption> }) {
  const filteredLabels = useFilteredItems<string>();
  return (
    <>
      {filteredLabels.map((label) => {
        const opt = optionByLabel.get(label);
        if (!opt) return null;
        return (
          <ComboboxItem key={opt.value} value={opt.label}>
            <OptionIcon url={opt.iconUrl} />
            <span className="truncate font-normal text-sm">{opt.label}</span>
          </ComboboxItem>
        );
      })}
    </>
  );
}

type MultiFilterSelectProps = {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  align?: 'start' | 'center' | 'end';
  maxVisible?: number;
  searchable?: boolean;
};

export function MultiFilterSelect({
  label,
  options,
  selected,
  onChange,
  align = 'start',
  maxVisible = 3,
  searchable = true,
}: MultiFilterSelectProps) {
  const optionByValue = new Map(options.map((option) => [option.value, option]));
  const optionByLabel = new Map(options.map((option) => [option.label, option]));
  const itemLabels = options.map((option) => option.label);

  const selectedOptions = selected
    .map((value) => optionByValue.get(value))
    .filter((option): option is FilterOption => Boolean(option));
  const selectedLabels = selectedOptions.map((option) => option.label);
  const activeCount = selected.length;
  const visibleOptions = selectedOptions.slice(0, maxVisible);
  const firstSelected = visibleOptions[0];
  const visibleLabel =
    visibleOptions.length > 0 ? visibleOptions.map((option) => option.label).join(', ') : `${activeCount} selected`;
  const overflowCount = activeCount - visibleOptions.length;

  const handleLabelChange = (labels: string[]) => {
    const values = labels
      .map((label) => optionByLabel.get(label)?.value)
      .filter((value): value is string => Boolean(value));
    onChange(values);
  };

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div
      className={cn(
        'inline-flex h-9 items-center overflow-hidden rounded-md border border-border font-normal text-sm',
        activeCount === 0 && 'transition-colors hover:bg-muted',
      )}
    >
      <Combobox multiple items={itemLabels} value={selectedLabels} onValueChange={handleLabelChange}>
        <ComboboxTrigger
          ref={triggerRef}
          showChevron={false}
          className={cn(
            'inline-flex h-full cursor-pointer items-center transition-colors',
            activeCount === 0 ? 'gap-1.5 px-3' : 'gap-0',
          )}
        >
          {activeCount > 0 ? (
            <>
              <span className="px-3 text-muted-foreground">{label}</span>
              <span className="w-px self-stretch bg-border" />
              <span className="inline-flex h-full items-center gap-2 px-3 transition-colors hover:bg-muted">
                <OptionIcon url={firstSelected?.iconUrl} />
                <span>{visibleLabel}</span>
                {overflowCount > 0 && <span className="text-muted-foreground">+{overflowCount}</span>}
              </span>
            </>
          ) : (
            <>
              <HugeiconsIcon icon={Menu08Icon} strokeWidth={2} className="size-3" />
              {label}
            </>
          )}
        </ComboboxTrigger>
        <ComboboxContent anchor={triggerRef} align={align} className="!min-w-[150px] w-auto rounded-md">
          {searchable && <ComboboxInput placeholder={`Search ${label.toLowerCase()}…`} />}
          <ComboboxList>
            <ComboboxEmpty>No options.</ComboboxEmpty>
            <FilteredOptions optionByLabel={optionByLabel} />
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {activeCount > 0 && (
        <>
          <span className="w-px self-stretch bg-border" />
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onClick={() => onChange([])}
            className="flex h-full cursor-pointer items-center justify-center px-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
          </button>
        </>
      )}
    </div>
  );
}
