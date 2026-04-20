import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { GalleryVerticalEnd } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// 品牌组件（左侧）
function NavBrand() {
  return (
    <div className="flex w-full items-center space-x-2">
      <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
        <GalleryVerticalEnd className="size-4" />
      </div>
      <div className="flex max-w-72 text-base font-medium">
        <TruncatedTitle title="AI运势抽签小游戏" />
      </div>
    </div>
  );
}

function TruncatedTitle({ title }: { title: string }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;
        const isOverflown = element.scrollWidth > element.clientWidth;
        setIsOverflowing(isOverflown);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [title]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span ref={textRef} className="inline-block w-full truncate">
            {title}
          </span>
        </TooltipTrigger>
        {isOverflowing && <TooltipContent side="top">{title}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

// 主布局组件
function TopBar() {
  return (
    <header className="bg-background flex h-16 w-full items-center gap-4 px-6 py-4">
      <div>
        <NavBrand />
      </div>
    </header>
  );
}

function Layout2Desktop() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="bg-background">
        {/* 在此处渲染的内容需要注意自适应宽度，如果超宽则需要使用 overflow scroll 或类似行为 */}
        <Outlet />
      </main>
    </div>
  );
}

function Layout2Mobile() {
  return <Outlet />;
}

export default function Layout2() {
  const isMobile = useIsMobile();
  if (!isMobile) {
    return <Layout2Desktop />;
  }
  return <Layout2Mobile />;
}
