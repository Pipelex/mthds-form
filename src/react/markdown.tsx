'use client';

import * as React from 'react';
import { marked, type Token, type Tokens } from 'marked';

import { cn } from './utils';

/**
 * Markdown, rendered as React elements — never as injected HTML.
 *
 * ## Why prose is rendered as markdown at all
 *
 * `prose` is the standard's kind for flowing free text, and what fills it in
 * practice is a language model's answer. Those answers are markdown: headings,
 * `**bold**`, bullet lists, occasionally a table. Rendered as plain text they
 * are a wall of literal `#` and `**`, which is not a neutral fallback — it is a
 * WRONG rendering of a value whose author meant something by those characters.
 *
 * The descriptor never says "this is markdown", and it does not need to: the
 * decision here is about TYPESETTING one text value, not about deriving what a
 * field is, and markdown degrades by design. A paragraph with no markup renders
 * as that paragraph. So the rule is simply that `prose` is typeset as markdown,
 * with no payload sniffing and no per-value heuristic to get wrong.
 *
 * `breaks: true` is not cosmetic. Plain markdown joins single newlines into one
 * paragraph, and the arm this replaced rendered prose with `white-space:
 * pre-wrap`, which preserved them. A value whose author put each item on its own
 * line without bulleting it would otherwise have been silently reflowed into a
 * paragraph — a regression invisible in any diff.
 *
 * ## Why the tokens are walked instead of `marked.parse()`
 *
 * `marked.parse()` returns an HTML string, and there are only two ways to put a
 * string of HTML on a page: `dangerouslySetInnerHTML`, or a sandboxed frame.
 * This value is MODEL OUTPUT, so the first would put a `<script>` and an
 * `onerror` handler one prompt away from running on the host's origin with the
 * host's cookies — and markdown permits raw HTML, so that is a real path rather
 * than a theoretical one. The second (what `HtmlPreview` does for `native.Html`)
 * is safe but heavy: a separate document per prose field, with its own styles
 * copied in and its height measured, around what is usually two sentences.
 *
 * Walking `marked.lexer()`'s tokens into React elements avoids the question
 * entirely. Every element below is one this file wrote; text only ever reaches
 * the DOM as a text child. There is no HTML string anywhere in the path, so
 * there is nothing to sanitize and no sanitizer to ship — and the `html` token
 * is rendered as its own literal source, which is the honest thing to do with
 * markup we have decided not to execute.
 */

/** Lexer options, fixed here so every prose value is typeset the same way. */
const LEX_OPTIONS = { gfm: true, breaks: true } as const;

export interface MarkdownProps {
  text: string;
  className?: string;
}

export function Markdown({ text, className }: MarkdownProps) {
  const tokens = React.useMemo(() => marked.lexer(text, LEX_OPTIONS), [text]);
  return (
    <div className={cn('space-y-2 text-[13px] leading-relaxed text-foreground', className)}>
      <Blocks tokens={tokens} />
    </div>
  );
}

const HEADING_CLASS: Record<number, string> = {
  1: 'text-[16px] font-semibold',
  2: 'text-[14.5px] font-semibold',
  3: 'text-[13.5px] font-semibold',
  4: 'text-[13px] font-semibold',
  5: 'text-[13px] font-semibold',
  6: 'text-[13px] font-semibold',
};

function Blocks({ tokens }: { tokens: readonly Token[] }) {
  return (
    <>
      {tokens.map((token, index) => (
        <Block key={index} token={token} />
      ))}
    </>
  );
}

function Block({ token }: { token: Token }) {
  switch (token.type) {
    case 'space':
      return null;

    case 'heading': {
      const heading = token as Tokens.Heading;
      // The level is authored data, so it is clamped rather than trusted: an
      // `<h9>` is not an element, and a depth outside 1-6 would render a tag
      // React does not know.
      const level = Math.min(Math.max(heading.depth, 1), 6);
      const Tag = `h${level}` as 'h1';
      return (
        <Tag className={cn('mt-3 first:mt-0', HEADING_CLASS[level])}>
          <Inline tokens={heading.tokens} />
        </Tag>
      );
    }

    case 'paragraph':
      return (
        <p>
          <Inline tokens={(token as Tokens.Paragraph).tokens} />
        </p>
      );

    case 'list': {
      const list = token as Tokens.List;
      const Tag = list.ordered ? 'ol' : 'ul';
      return (
        <Tag
          className={cn('space-y-1 ps-5', list.ordered ? 'list-decimal' : 'list-disc')}
          // A list authored as `3.` starts at 3. `start` is meaningless on `ul`
          // and React warns about it, so it rides only the ordered arm.
          {...(list.ordered && list.start !== 1 ? { start: Number(list.start) } : {})}
        >
          {list.items.map((item, index) => (
            <li key={index} className="marker:text-muted-foreground">
              {/* A task-list checkbox is DISABLED: this is a result being read,
                  not a form. An interactive box would invite a click that
                  changes nothing and is written nowhere. */}
              {item.task ? (
                <input
                  type="checkbox"
                  checked={item.checked ?? false}
                  disabled
                  readOnly
                  className="me-1.5 align-middle"
                />
              ) : null}
              <Blocks tokens={item.tokens} />
            </li>
          ))}
        </Tag>
      );
    }

    case 'code': {
      const code = token as Tokens.Code;
      return (
        // WRAPPED, not scrolled. A code block in a side panel is usually not
        // code at all: it is a model that opened a fence and did not close it,
        // or closed one it never opened, and the rest of a report ends up
        // inside it. Scrolling that sideways hides the text behind a scrollbar
        // for no gain — the lines are prose, and prose wraps. Real code loses
        // its column alignment and keeps every character, which is the better
        // half of that trade at this width.
        <pre className="whitespace-pre-wrap break-words rounded-md border border-border bg-card/40 p-2.5 text-[12px]">
          <code>{code.text}</code>
        </pre>
      );
    }

    case 'blockquote':
      return (
        <blockquote className="border-s-2 border-border ps-3 text-muted-foreground">
          <Blocks tokens={(token as Tokens.Blockquote).tokens} />
        </blockquote>
      );

    case 'hr':
      return <hr className="border-border" />;

    case 'table': {
      const table = token as Tokens.Table;
      return (
        // The same overflow rule the result tables follow: a wide table scrolls
        // inside its own box rather than widening the panel around it.
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-border bg-card/40">
                {table.header.map((cell, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-2.5 py-1.5 text-start font-semibold"
                    style={alignOf(table.align[index])}
                  >
                    <Inline tokens={cell.tokens} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border/60 last:border-b-0">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-2.5 py-1.5 align-top"
                      style={alignOf(table.align[cellIndex])}
                    >
                      <Inline tokens={cell.tokens} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // `html` and anything this version of the lexer grows that we have no arm
    // for: shown as its own source text. Rendering markup we have decided not to
    // execute as the characters it is made of is the honest fallback - it never
    // silently drops content, and it never injects any.
    default:
      return <p className="whitespace-pre-wrap">{rawOf(token)}</p>;
  }
}

function Inline({ tokens }: { tokens?: readonly Token[] }) {
  if (!tokens) return null;
  return (
    <>
      {tokens.map((token, index) => (
        <InlineToken key={index} token={token} />
      ))}
    </>
  );
}

function InlineToken({ token }: { token: Token }) {
  switch (token.type) {
    case 'text': {
      const text = token as Tokens.Text;
      // A `text` token carries nested tokens only when the lexer found markup
      // inside it; when it did not, `tokens` is absent and the string is the
      // content. Both arms are needed - reading `.text` unconditionally drops
      // nested emphasis, and recursing unconditionally renders nothing.
      return text.tokens ? <Inline tokens={text.tokens} /> : <>{decode(text.text)}</>;
    }
    case 'escape':
      return <>{(token as Tokens.Escape).text}</>;
    case 'strong':
      return (
        <strong className="font-semibold">
          <Inline tokens={(token as Tokens.Strong).tokens} />
        </strong>
      );
    case 'em':
      return (
        <em className="italic">
          <Inline tokens={(token as Tokens.Em).tokens} />
        </em>
      );
    case 'del':
      return (
        <del className="line-through">
          <Inline tokens={(token as Tokens.Del).tokens} />
        </del>
      );
    case 'codespan':
      return (
        <code className="rounded border border-border bg-card/40 px-1 py-0.5 text-[0.92em]">
          {decode((token as Tokens.Codespan).text)}
        </code>
      );
    case 'br':
      return <br />;
    case 'link': {
      const link = token as Tokens.Link;
      const href = safeHref(link.href);
      // A link whose scheme we will not follow keeps its TEXT. Dropping the
      // anchor and dropping the words are different things, and only the first
      // is a security decision.
      if (!href) return <Inline tokens={link.tokens} />;
      return (
        <a
          href={href}
          target="_blank"
          // `noreferrer` as well as `noopener`: a result view has no business
          // telling a third party which page it was opened from.
          rel="noreferrer noopener"
          className="underline underline-offset-2"
        >
          <Inline tokens={link.tokens} />
        </a>
      );
    }
    case 'image': {
      const image = token as Tokens.Image;
      const src = safeHref(image.href);
      if (!src) return <>{image.text}</>;
      return <img src={src} alt={image.text} className="max-w-full rounded-md" />;
    }
    default:
      return <>{rawOf(token)}</>;
  }
}

/** A `javascript:` href is an execution path; only these three are followed. */
function safeHref(href: string): string | undefined {
  const trimmed = href.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  // A relative or anchor link is same-origin by construction and carries no
  // scheme to abuse.
  if (/^[#/]/.test(trimmed)) return trimmed;
  return undefined;
}

function alignOf(
  align: 'center' | 'left' | 'right' | null | undefined,
): React.CSSProperties | undefined {
  return align ? { textAlign: align } : undefined;
}

function rawOf(token: Token): string {
  return 'raw' in token && typeof token.raw === 'string' ? token.raw : '';
}

/**
 * The lexer HTML-escapes text for its own HTML output, so `&amp;` and `&lt;`
 * arrive here already escaped. React escapes again on the way to the DOM, so
 * without this an ampersand in the source would be displayed as `&amp;`.
 */
const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
};

function decode(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, (entity) => ENTITIES[entity] ?? entity);
}
