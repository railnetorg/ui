import { readdirSync } from 'node:fs';

const REPO = 'railnetorg/ui';
const UI_DIR = 'registry/components/ui';
const BUILT_IN_ALIASES: Record<string, string> = { '@/lib/utils': 'utils', '@/hooks/use-mobile': 'use-mobile' };
const PEER_PACKAGES = new Set(['react', 'react-dom']);

type CssTree = { [selector: string]: string | CssTree };

const THEME_CSS_ONLY: CssTree = {
  '@layer base': {
    '*': { 'border-color': 'var(--border)', 'outline-color': 'color-mix(in oklab, var(--ring) 50%, transparent)' },
    body: { 'background-color': 'var(--background)', color: 'var(--foreground)', 'font-family': 'var(--font-sans)' },
  },
  '@font-face': {
    'font-family': '"ABC Marist"',
    src: 'url("/fonts/ABCMarist-Regular.otf") format("opentype")',
    'font-weight': '350',
    'font-style': 'normal',
    'font-display': 'swap',
  },
};

const css: CssTree = {
  '@layer base': {
    body: {
      'font-weight': '500',
      '-webkit-font-smoothing': 'antialiased',
      '-moz-osx-font-smoothing': 'grayscale',
    },
  },
  '@utility text-stat': {
    'font-family': 'var(--font-serif)',
    'font-weight': '400',
    'letter-spacing': '-0.03em',
    'line-height': '1',
  },
  '@utility text-body-lg': {
    'font-family': 'var(--font-serif)',
    'font-weight': '400',
    'letter-spacing': '-0.01em',
    'line-height': '1.1',
  },
  '@utility text-label': {
    'font-family': 'var(--font-sans)',
    'font-weight': '600',
    'font-size': '13px',
    'letter-spacing': '0.01em',
    'line-height': '1.2',
  },
  '@utility text-section-label': {
    'font-family': 'var(--font-sans)',
    'font-size': '11px',
    'font-weight': '600',
    'text-transform': 'uppercase',
    'letter-spacing': '0.06em',
    'line-height': '1.2',
    color: 'var(--gray-300)',
  },
  '@utility text-uppercase': {
    'text-transform': 'uppercase',
    'letter-spacing': '0.06em',
  },
};

function readBlock(source: string, selector: string) {
  const start = source.indexOf(`${selector} {`);
  const body = source.slice(start, source.indexOf('}', start));
  const vars: Record<string, string> = {};
  for (const match of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    vars[match[1] as string] = (match[2] as string).trim();
  }
  return vars;
}

// shadcn matches an existing rule by its exact selector text; a consumer's formatter puts `a, b` on two lines and every update then appends a copy.
function assertSingleSelectors(tree: CssTree) {
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === 'string') continue;
    if (!key.startsWith('@') && key.includes(','))
      throw new Error(`Theme rule "${key}" lists several selectors: split it`);
    assertSingleSelectors(value);
  }
}

function serialize(tree: CssTree, indent = ''): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === 'string') {
      lines.push(`${indent}${key}: ${value};`);
    } else {
      lines.push(`${indent}${key} {`, serialize(value, `${indent}  `), `${indent}}`);
    }
  }
  return lines.join('\n');
}

assertSingleSelectors(css);

const tokens = await Bun.file('tokens.css').text();
const rootVars = readBlock(tokens, ':root');
const light = { ...rootVars };
const dark = readBlock(tokens, '.dark');

// Font stacks are mode-independent: shadcn reads them from the @theme block, not from :root.
const theme: Record<string, string> = {};
for (const [name, value] of Object.entries(light)) {
  if (name.startsWith('font-')) {
    theme[name] = value.replace(/^var\(--(font-[\w-]+)\)$/, (reference, fontName) => rootVars[fontName] ?? reference);
    delete light[name];
  } else if (name !== 'radius') {
    theme[`color-${name}`] = `var(--${name})`;
  }
}
theme.radius = rootVars.radius as string;
for (const size of ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']) theme[`radius-${size}`] = '0';

// Consumers install a component's dependencies at the range this repo builds and types against, not at latest.
const { devDependencies: testedVersions } = await Bun.file('package.json').json();

const componentItems = [];
for (const file of readdirSync(UI_DIR).toSorted()) {
  const source = await Bun.file(`${UI_DIR}/${file}`).text();
  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>();
  for (const match of source.matchAll(/from '([^']+)'/g)) {
    const specifier = match[1] as string;
    if (specifier.startsWith('@/components/ui/')) {
      registryDependencies.add(`${REPO}/${specifier.slice('@/components/ui/'.length)}`);
    } else if (BUILT_IN_ALIASES[specifier]) {
      registryDependencies.add(BUILT_IN_ALIASES[specifier]);
    } else if (!specifier.startsWith('@/')) {
      const segments = specifier.split('/');
      const packageName = specifier.startsWith('@') ? segments.slice(0, 2).join('/') : (segments[0] as string);
      if (PEER_PACKAGES.has(packageName)) continue;
      const range = testedVersions[packageName];
      if (!range) throw new Error(`${file} imports ${packageName}, which package.json does not pin`);
      dependencies.add(`${packageName}@${range}`);
    }
  }
  componentItems.push({
    name: file.replace(/\.tsx$/, ''),
    type: 'registry:ui',
    dependencies: [...dependencies].toSorted(),
    registryDependencies: [...registryDependencies].toSorted(),
    files: [{ path: `${UI_DIR}/${file}`, type: 'registry:ui' }],
  });
}

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'railnet',
  homepage: 'https://github.com/railnetorg/ui',
  items: [
    {
      name: 'railnet-theme',
      type: 'registry:theme',
      title: 'Railnet theme',
      description: 'Railnet brand tokens (light and dark), fonts, radius and typography utilities.',
      docs: 'ABC Marist is licensed: serve /fonts/ABCMarist-Regular.otf from your app. Remove the font import shadcn init added (Geist, Figtree…).',
      registryDependencies: [`${REPO}/inter-tight`],
      cssVars: { theme, light, dark },
      css,
    },
    {
      name: 'inter-tight',
      type: 'registry:font',
      title: 'Inter Tight',
      font: {
        family: rootVars['font-sans'],
        provider: 'google',
        import: 'Inter_Tight',
        variable: '--font-sans',
        subsets: ['latin'],
        // shadcn writes this value verbatim into the CSS @import, so it cannot carry a version.
        dependency: '@fontsource-variable/inter-tight',
      },
    },
    {
      name: 'railnet-logo',
      type: 'registry:file',
      title: 'Railnet logo',
      files: ['light', 'dark'].map((variant) => ({
        path: `registry/assets/railnet-logo-${variant}.svg`,
        type: 'registry:file',
        target: `~/public/railnet-logo-${variant}.svg`,
      })),
    },
    ...componentItems,
  ],
};

const themeCss = [
  '@custom-variant dark (&:is(.dark *));',
  serialize({ '@theme inline': Object.fromEntries(Object.entries(theme).map(([key, value]) => [`--${key}`, value])) }),
  serialize(THEME_CSS_ONLY),
  serialize(css),
].join('\n\n');

await Bun.write('registry.json', `${JSON.stringify(registry, null, 2)}\n`);
await Bun.write('theme.css', `${themeCss}\n`);
