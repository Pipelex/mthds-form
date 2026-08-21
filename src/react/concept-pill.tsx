'use client';

import {
  Braces,
  CalendarDays,
  FileText,
  Hash,
  Image as ImageIcon,
  List,
  ListChecks,
  ToggleLeft,
  Type,
} from 'lucide-react';
import { cn } from './utils';
import type { ConceptCategory } from '../core';

const CATEGORY_ICON: Record<ConceptCategory, typeof Type> = {
  text: Type,
  date: CalendarDays,
  document: FileText,
  image: ImageIcon,
  number: Hash,
  boolean: ToggleLeft,
  choice: ListChecks,
  structured: Braces,
  list: List,
};

interface ConceptPillProps {
  /** The concept identifier, e.g. `native.Document`, `demo.Invoice`. */
  conceptRef?: string;
  category: ConceptCategory;
  className?: string;
}

/**
 * The small monospace type tag shown beside an input's name. Mono + a line icon
 * (never a colored chip) keeps the technical Pipelex voice without spending a
 * chromatic accent - the concept *type* is information, not a status.
 */
export function ConceptPill({ conceptRef, category, className }: ConceptPillProps) {
  const Icon = CATEGORY_ICON[category];
  const label = conceptRef ?? category;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[10.5px] leading-none text-muted-foreground',
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );
}
