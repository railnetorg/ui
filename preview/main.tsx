import { Copy01Icon, Moon02Icon, Sun03Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Components } from '@preview/components';
import { Examples } from '@preview/examples';
import { Foundations } from '@preview/foundations';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VERSION = 'v0.3.0';
const INSTALL_COMMAND = `bunx shadcn@latest add railnetorg/ui/railnet-theme#${VERSION}`;

type HeaderProps = { dark: boolean; onToggleDark: () => void };

function Header({ dark, onToggleDark }: HeaderProps) {
  const [copied, setCopied] = useState(false);

  async function copyInstallCommand() {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    setCopied(true);
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
      <div className="flex items-baseline gap-2">
        <p className="whitespace-nowrap font-heading text-2xl">Railnet UI</p>
        <p className="text-muted-foreground text-xs">{VERSION}</p>
      </div>
      <div className="flex items-center gap-2">
        <code className="hidden bg-muted px-2 py-1.5 text-muted-foreground text-xs md:block">{INSTALL_COMMAND}</code>
        <Button variant="outline" onClick={copyInstallCommand}>
          <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} />
          {copied ? (
            'Copied'
          ) : (
            <>
              <span className="sm:hidden">Install</span>
              <span className="hidden sm:inline">Copy install command</span>
            </>
          )}
        </Button>
        <Button variant="outline" size="icon" aria-label="Toggle dark mode" onClick={onToggleDark}>
          <HugeiconsIcon icon={dark ? Sun03Icon : Moon02Icon} />
        </Button>
      </div>
    </header>
  );
}

function Preview() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header dark={dark} onToggleDark={() => setDark(!dark)} />
      <Tabs defaultValue="examples" className="p-4">
        <TabsList>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="foundations">Foundations</TabsTrigger>
        </TabsList>
        <TabsContent value="examples" className="pt-4">
          <Examples />
        </TabsContent>
        <TabsContent value="components" className="pt-4">
          <Components />
        </TabsContent>
        <TabsContent value="foundations" className="pt-4">
          <Foundations />
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<Preview />);
