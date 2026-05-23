"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  findCategoryForTab,
  getVisibleCategories,
  type ProjectTabId,
} from "@/lib/project-workspace-nav";

type Props = {
  role: string;
  initialTab: ProjectTabId;
  children: React.ReactNode;
};

export function ProjectWorkspaceNav({ role, initialTab, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categories = useMemo(() => getVisibleCategories(role), [role]);
  const [activeTab, setActiveTab] = useState<ProjectTabId>(initialTab);
  const [activeCategory, setActiveCategory] = useState(() =>
    findCategoryForTab(initialTab, categories)
  );

  useEffect(() => {
    setActiveTab(initialTab);
    setActiveCategory(findCategoryForTab(initialTab, categories));
  }, [initialTab, categories]);

  const currentCategory =
    categories.find((c) => c.id === activeCategory) ?? categories[0];

  const setTab = (tab: ProjectTabId) => {
    setActiveTab(tab);
    setActiveCategory(findCategoryForTab(tab, categories));
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const selectCategory = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat?.items.length) return;
    setActiveCategory(categoryId);
    if (!cat.items.some((i) => i.value === activeTab)) {
      setTab(cat.items[0]!.value);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => setTab(v as ProjectTabId)} className="w-full">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat.id)}
              className={cn(
                "rounded-lg px-3 py-2 text-left border transition-colors min-w-[120px] flex-1 sm:flex-none sm:min-w-0",
                activeCategory === cat.id
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 shadow-sm"
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <span className="block text-sm font-semibold font-display">{cat.label}</span>
              {cat.description && (
                <span className="block text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  {cat.description}
                </span>
              )}
            </button>
          ))}
        </div>

        {currentCategory && currentCategory.items.length > 0 && (
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 bg-muted/40 p-1">
            {currentCategory.items.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="text-xs sm:text-sm">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
      </div>

      <div className="mt-4">{children}</div>
    </Tabs>
  );
}
