import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SEMANTIC_COLORS = [
  'background',
  'foreground',
  'primary',
  'secondary',
  'muted',
  'accent',
  'destructive',
  'success',
  'border',
];
const BRAND_COLORS = [
  'deep-red',
  'soft-black',
  'bone',
  'peach',
  'coral',
  'ember',
  'blaze',
  'rust',
  'spruce',
  'sage',
  'mint',
  'petrol',
  'glacier',
  'aqua',
];
const GRAY_COLORS = ['gray-25', 'gray-50', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500'];
const PRIMARY_SCALE = [
  'primary-25',
  'primary-50',
  'primary-100',
  'primary-200',
  'primary-300',
  'primary-400',
  'primary-500',
];
const CHART_COLORS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];
const RULES = [
  'A brand value changes in tokens.css only, through a PR on this repo.',
  'Install the theme with shadcn add; never retype its values.',
  'Copied components are yours: change them freely.',
  'ABC Marist is licensed: each app serves the font file itself.',
  'Nothing client-specific or internal in this public repo.',
];
const TYPE_SCALE = [
  { id: 'stat', className: 'text-5xl text-stat', sample: '$12,431,902', name: 'text-stat · ABC Marist' },
  { id: 'heading', className: 'font-heading text-3xl', sample: 'USDC Prime', name: 'font-heading' },
  { id: 'body-lg', className: 'text-body-lg text-xl', sample: 'Programmable yield for DeFi', name: 'text-body-lg' },
  {
    id: 'body',
    className: 'text-sm',
    sample: 'Deposit into a product to start earning.',
    name: 'text-sm · Inter Tight',
  },
  { id: 'label', className: 'text-label', sample: 'Estimated receive', name: 'text-label' },
  { id: 'section', className: 'text-section-label', sample: 'Holdings', name: 'text-section-label' },
];

type SwatchesProps = { title: string; colors: string[] };

function Swatches({ title, colors }: SwatchesProps) {
  return (
    <div className="space-y-2">
      <p className="text-section-label">{title}</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 xl:grid-cols-10">
        {colors.map((color) => (
          <div key={color} className="space-y-1">
            <div className="aspect-square border" style={{ background: `var(--${color})` }} />
            <p className="truncate text-[10px] text-muted-foreground">{color}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Foundations() {
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Colors</CardTitle>
          <CardDescription>From tokens.css, the only place a brand value lives.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Swatches title="Semantic" colors={SEMANTIC_COLORS} />
          <Swatches title="Brand" colors={BRAND_COLORS} />
          <Swatches title="Gray" colors={GRAY_COLORS} />
          <Swatches title="Primary scale" colors={PRIMARY_SCALE} />
          <Swatches title="Charts" colors={CHART_COLORS} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>ABC Marist for figures and headings, Inter Tight for everything else.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {TYPE_SCALE.map((type) => (
              <div key={type.id} className="space-y-0.5">
                <p className={type.className}>{type.sample}</p>
                <p className="text-muted-foreground text-xs">{type.name}</p>
              </div>
            ))}
            <p className="text-muted-foreground text-xs">
              ABC Marist is licensed and not served by the public preview, where figures fall back to Georgia.
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Shape</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4 text-sm">
            <div className="size-12 border bg-muted" />
            <div className="size-12 rounded-full border bg-muted" />
            <p className="text-muted-foreground text-xs">
              Radius 0 on cards and controls; avatars and status dots stay round. Base Maia · Hugeicons.
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Rules</CardTitle>
            <CardDescription>How every Railnet app uses this design system.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-4 text-sm">
              {RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
