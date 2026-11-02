import {
  Copy01Icon,
  Delete02Icon,
  InformationCircleIcon,
  LinkSquare02Icon,
  Logout01Icon,
  Search01Icon,
  Settings02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ReactNode } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const BUTTON_VARIANTS = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const;
const BUTTON_SIZES = ['xs', 'sm', 'default', 'lg'] as const;
const BADGE_VARIANTS = [
  'default',
  'secondary',
  'outline',
  'brand',
  'success',
  'error',
  'destructive',
  'ghost',
] as const;
const ASSETS = [
  { value: 'usdc', label: 'USDC' },
  { value: 'usdt', label: 'USDT' },
  { value: 'weth', label: 'WETH' },
];
const HOLDERS = [
  { id: 'holder-1', address: '0x8f3c…a21e', shares: '120,400.00', share: '42.1%' },
  { id: 'holder-2', address: '0x1b07…94cd', shares: '88,250.00', share: '30.9%' },
  { id: 'holder-3', address: '0xc4d2…07f3', shares: '77,310.50', share: '27.0%' },
];
const FAQ = [
  {
    id: 'redeem',
    question: 'How long does a redeem take?',
    answer: 'Instant when the product holds enough liquidity, otherwise queued until the next settlement.',
  },
  { id: 'fees', question: 'Are yields net of fees?', answer: 'Displayed yields are historical and net of fees.' },
];

type ShowcaseProps = { title: string; children: ReactNode };

function Showcase({ title, children }: ShowcaseProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export function Components() {
  return (
    <div className="columns-1 gap-4 md:columns-2 xl:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
      <Showcase title="Button">
        <div className="flex flex-wrap gap-2">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {BUTTON_SIZES.map((size) => (
            <Button key={size} size={size} variant="outline">
              {size}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button>
            <HugeiconsIcon icon={Settings02Icon} data-icon="inline-start" />
            With icon
          </Button>
          <Button disabled>
            <Spinner data-icon="inline-start" />
            Processing
          </Button>
          <Button variant="outline" size="icon" aria-label="Copy address">
            <HugeiconsIcon icon={Copy01Icon} />
          </Button>
          <ButtonGroup>
            <Button variant="outline">Deposit</Button>
            <Button variant="outline">Redeem</Button>
          </ButtonGroup>
        </div>
      </Showcase>

      <Showcase title="Badge">
        <div className="flex flex-wrap gap-2">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </Showcase>

      <Showcase title="Inputs">
        <div className="space-y-2">
          <Label htmlFor="component-name">Name</Label>
          <Input id="component-name" placeholder="Treasury wallet" />
        </div>
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search products" />
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="0.00" inputMode="decimal" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>USDC</InputGroupText>
            <InputGroupButton size="xs">Max</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <Select items={ASSETS} defaultValue="usdc">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSETS.map((asset) => (
              <SelectItem key={asset.value} value={asset.value}>
                {asset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <NativeSelect defaultValue="base">
          <NativeSelectOption value="ethereum">Ethereum</NativeSelectOption>
          <NativeSelectOption value="base">Base</NativeSelectOption>
        </NativeSelect>
        <Textarea placeholder="Notes for the asset manager" />
      </Showcase>

      <Showcase title="Selection">
        <Label className="gap-2">
          <Checkbox defaultChecked /> I accept the terms
        </Label>
        <Label className="gap-2">
          <Switch defaultChecked /> Email me when a redeem settles
        </Label>
        <RadioGroup defaultValue="instant">
          <Label className="gap-2">
            <RadioGroupItem value="instant" /> Instant redeem
          </Label>
          <Label className="gap-2">
            <RadioGroupItem value="queued" /> Queued redeem
          </Label>
        </RadioGroup>
        <ToggleGroup defaultValue={['30d']}>
          <ToggleGroupItem value="7d">APY 7D</ToggleGroupItem>
          <ToggleGroupItem value="30d">APY 30D</ToggleGroupItem>
        </ToggleGroup>
        <Slider defaultValue={40} />
      </Showcase>

      <Showcase title="Overlays">
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>Dialog</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm deposit</DialogTitle>
                <DialogDescription>You deposit 2,500 USDC into USDC Prime.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" />}>Alert dialog</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke this role?</AlertDialogTitle>
                <AlertDialogDescription>The wallet loses the curator role on this Vehicle.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive">Revoke</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Sheet>
            <SheetTrigger render={<Button variant="outline" />}>Sheet</SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Wallets</SheetTitle>
                <SheetDescription>Wallets linked to your organization.</SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <Button>Add wallet</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Popover>
            <PopoverTrigger render={<Button variant="outline" />}>Popover</PopoverTrigger>
            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle>Share price</PopoverTitle>
                <PopoverDescription>1 rnUSDC = 1.0412 USDC, updated at every settlement.</PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" size="icon" aria-label="About APY" />}>
              <HugeiconsIcon icon={InformationCircleIcon} />
            </TooltipTrigger>
            <TooltipContent>Annualized from the last 30 days, net of fees.</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>0x8f3c…a21e</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Wallet</DropdownMenuLabel>
                <DropdownMenuItem>
                  <HugeiconsIcon icon={Copy01Icon} /> Copy address
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HugeiconsIcon icon={LinkSquare02Icon} /> View on explorer
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <HugeiconsIcon icon={Logout01Icon} /> Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <HoverCard>
            <HoverCardTrigger render={<Button variant="link" />}>Asset manager</HoverCardTrigger>
            <HoverCardContent className="space-y-1">
              <p className="font-medium text-sm">Asset manager</p>
              <p className="text-muted-foreground text-xs">Curates the Vehicles behind this product.</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </Showcase>

      <Showcase title="Feedback">
        <Alert>
          <HugeiconsIcon icon={InformationCircleIcon} />
          <AlertTitle>Redeem queued</AlertTitle>
          <AlertDescription>Your request settles at the next epoch.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <HugeiconsIcon icon={Delete02Icon} />
          <AlertTitle>Transaction reverted</AlertTitle>
          <AlertDescription>The deposit cap of this product is reached.</AlertDescription>
        </Alert>
        <Progress value={62} />
        <div className="flex items-center gap-3">
          <Spinner />
          <Skeleton className="h-4 flex-1" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast.success('Deposit submitted')}>
            Success toast
          </Button>
          <Button variant="outline" onClick={() => toast.error('Wallet rejected the transaction')}>
            Error toast
          </Button>
        </div>
      </Showcase>

      <Showcase title="Navigation">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Manage</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Conduits</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>USDC Prime</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-2 text-muted-foreground text-sm">
            Conduit overview.
          </TabsContent>
          <TabsContent value="roles" className="pt-2 text-muted-foreground text-sm">
            Role holders.
          </TabsContent>
          <TabsContent value="fees" className="pt-2 text-muted-foreground text-sm">
            Fee settings.
          </TabsContent>
        </Tabs>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <p className="flex items-center gap-2 text-muted-foreground text-sm">
          Search
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </p>
      </Showcase>

      <Showcase title="Data display">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
          <AvatarGroup>
            <Avatar size="sm">
              <AvatarFallback>ET</AvatarFallback>
            </Avatar>
            <Avatar size="sm">
              <AvatarFallback>BA</AvatarFallback>
            </Avatar>
            <Avatar size="sm">
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
          </AvatarGroup>
        </div>
        <Separator />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Holder</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {HOLDERS.map((holder) => (
              <TableRow key={holder.id}>
                <TableCell className="font-mono text-xs">{holder.address}</TableCell>
                <TableCell className="text-right tabular-nums">{holder.shares}</TableCell>
                <TableCell className="text-right tabular-nums">{holder.share}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Accordion>
          {FAQ.map((entry) => (
            <AccordionItem key={entry.id} value={entry.id}>
              <AccordionTrigger>{entry.question}</AccordionTrigger>
              <AccordionContent>{entry.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Showcase>
    </div>
  );
}
