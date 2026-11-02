import {
  Alert02Icon,
  ArrowDown01Icon,
  ArrowDownIcon,
  ArrowLeft01Icon,
  ArrowLeftIcon,
  ArrowRight01Icon,
  ArrowRightIcon,
  ArrowUp01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  Menu08Icon,
  MinusSignIcon,
  MoreHorizontalCircle01Icon,
  MultiplicationSignCircleIcon,
  SearchIcon,
  SidebarLeftIcon,
  Tick02Icon,
  UnfoldMoreIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type * as React from 'react';

const HUGEICONS = {
  Alert02Icon,
  ArrowDown01Icon,
  ArrowDownIcon,
  ArrowLeft01Icon,
  ArrowLeftIcon,
  ArrowRight01Icon,
  ArrowRightIcon,
  ArrowUp01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  Menu08Icon,
  MinusSignIcon,
  MoreHorizontalCircle01Icon,
  MultiplicationSignCircleIcon,
  SearchIcon,
  SidebarLeftIcon,
  Tick02Icon,
  UnfoldMoreIcon,
};

type IconPlaceholderProps = Omit<React.ComponentProps<'svg'>, 'strokeWidth'> & {
  lucide: string;
  tabler: string;
  hugeicons: keyof typeof HUGEICONS;
  phosphor: string;
  remixicon: string;
};

// Never installed: `shadcn add` swaps each <IconPlaceholder> for the consumer's components.json iconLibrary. This one renders Hugeicons for the preview.
export function IconPlaceholder({ lucide, tabler, hugeicons, phosphor, remixicon, ...props }: IconPlaceholderProps) {
  return <HugeiconsIcon icon={HUGEICONS[hugeicons]} strokeWidth={2} {...props} />;
}
