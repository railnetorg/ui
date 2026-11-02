import { IconPlaceholder } from '@/components/icon-placeholder';
import { cn } from '@/lib/utils';

function Spinner({ className, ...props }: Omit<React.ComponentProps<'svg'>, 'strokeWidth'>) {
  return (
    <IconPlaceholder
      lucide="Loader2Icon"
      tabler="IconLoader"
      hugeicons="Loading03Icon"
      phosphor="SpinnerIcon"
      remixicon="RiLoaderLine"
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
