'use client';

import type { OptionTone } from 'mthds/protocol';
import { AlertTriangle, CheckCircle2, CircleDot, XCircle, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { toneEdgeClass, toneFillClass, toneIconClass, toneMarkClass } from './tone-tokens';
import { cn } from './utils';

/** The icon each tone is drawn with beside its words, so it reads without its colour. */
const TONE_ICONS: Readonly<Record<OptionTone, LucideIcon>> = {
  positive: CheckCircle2,
  caution: AlertTriangle,
  negative: XCircle,
  neutral: CircleDot,
};

/** A tone's icon, in the tone's colour, hidden from assistive technology: the words say it. */
export function ToneIcon({ tone, className }: { tone: OptionTone; className?: string }) {
  const Icon = TONE_ICONS[tone];
  return <Icon aria-hidden="true" className={cn('shrink-0', toneIconClass[tone], className)} />;
}

/** A tone's dot, the smallest mark: a picker's option, a column's cell. */
export function ToneDot({ tone, className }: { tone: OptionTone; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-2 shrink-0 rounded-full', toneMarkClass[tone], className)}
    />
  );
}

/**
 * A value in its tone: words in `--foreground` on the tone's pale fill and
 * edge, behind a dot in the tone's colour, or its icon at the `large` size a
 * verdict is drawn at (see `./tone-tokens` for why the words never take the
 * tone's colour). `data-tone` names the tone on the DOM.
 */
export function ToneBadge({
  tone,
  children,
  size = 'small',
}: {
  tone: OptionTone;
  children: ReactNode;
  size?: 'small' | 'large';
}) {
  const large = size === 'large';
  return (
    <span
      data-tone={tone}
      className={cn(
        'inline-flex max-w-full items-center rounded-full border text-foreground',
        toneFillClass[tone],
        toneEdgeClass[tone],
        large ? 'gap-2 px-3 py-1 text-[15px] font-semibold' : 'gap-1.5 px-2 py-px text-[12.5px]',
      )}
    >
      {large ? <ToneIcon tone={tone} className="size-4.5" /> : <ToneDot tone={tone} />}
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
