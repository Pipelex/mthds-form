// @vitest-environment jsdom
/**
 * Markdown is rendered as ELEMENTS, and never as injected HTML.
 *
 * The second half is the one worth asserting. The value being typeset is model
 * output, and markdown permits raw HTML inside it, so `marked.parse()` plus
 * `dangerouslySetInnerHTML` would put a `<script>` and an `onerror` handler one
 * prompt away from running on the host's origin with the host's cookies. The
 * token walk makes that structurally impossible rather than merely unlikely —
 * every element comes from `markdown.tsx`, and text reaches the DOM only as a
 * text child — and these tests are what keep it that way if someone ever
 * "simplifies" the walk back into a parse.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Markdown } from '../markdown';

describe('block structure', () => {
  it('renders headings at their authored level, clamped to a real element', () => {
    const { container } = render(<Markdown text={'# One\n\n### Three'} />);
    expect(container.querySelector('h1')?.textContent).toBe('One');
    expect(container.querySelector('h3')?.textContent).toBe('Three');
  });

  it('renders bullet and ordered lists as lists', () => {
    const { container } = render(<Markdown text={'- a\n- b\n\n1. one\n2. two'} />);
    expect(container.querySelectorAll('ul li')).toHaveLength(2);
    expect(container.querySelectorAll('ol li')).toHaveLength(2);
  });

  it('renders a GFM table as a table', () => {
    const { container } = render(<Markdown text={'| a | b |\n|---|---|\n| 1 | 2 |'} />);
    expect(container.querySelectorAll('th')).toHaveLength(2);
    expect(container.querySelectorAll('tbody td')).toHaveLength(2);
  });

  it('renders emphasis, code and rules', () => {
    const { container } = render(<Markdown text={'**b** `c`\n\n---'} />);
    expect(container.querySelector('strong')?.textContent).toBe('b');
    expect(container.querySelector('code')?.textContent).toBe('c');
    expect(container.querySelector('hr')).not.toBeNull();
  });

  it('keeps a single newline as a break, because the arm it replaced did', () => {
    // `breaks: true`. Plain markdown joins these into one paragraph, and the
    // `white-space: pre-wrap` this replaced did not — a value whose author put
    // each item on its own line without bulleting it would otherwise have been
    // silently reflowed.
    const { container } = render(<Markdown text={'one\ntwo'} />);
    expect(container.querySelectorAll('br')).toHaveLength(1);
  });

  it('renders plain prose as plain prose', () => {
    // The reason no per-value heuristic is needed: markdown degrades.
    const { container } = render(<Markdown text="Just a sentence." />);
    expect(container.querySelector('p')?.textContent).toBe('Just a sentence.');
    expect(container.querySelectorAll('h1, ul, table, code')).toHaveLength(0);
  });

  it('shows an escaped ampersand as an ampersand', () => {
    // The lexer escapes text for its own HTML output; React escapes again on
    // the way to the DOM. Without the decode, `&` would display as `&amp;`.
    const { container } = render(<Markdown text="Tom & Jerry <3" />);
    expect(container.textContent).toBe('Tom & Jerry <3');
  });
});

describe('markup is never executed', () => {
  it('renders a raw HTML block as its own source text', () => {
    const { container } = render(<Markdown text={'<script>alert(1)</script>'} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('<script>alert(1)</script>');
  });

  it('renders inline HTML as text rather than as an element', () => {
    const { container } = render(<Markdown text={'before <img src=x onerror=alert(1)> after'} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('onerror=alert(1)');
  });

  it('drops a javascript: link but keeps its words', () => {
    // Dropping the anchor and dropping the text are different things, and only
    // the first is a security decision.
    const { container } = render(<Markdown text="[click me](javascript:alert(1))" />);
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('click me');
  });

  it('follows an http link, and tells the browser to forget where it came from', () => {
    const { container } = render(<Markdown text="[x](https://example.com)" />);
    const anchor = container.querySelector('a')!;
    expect(anchor.getAttribute('href')).toBe('https://example.com');
    expect(anchor.getAttribute('rel')).toBe('noreferrer noopener');
    expect(anchor.getAttribute('target')).toBe('_blank');
  });

  it('drops a data: image but keeps its alt text', () => {
    const { container } = render(
      <Markdown text="![the alt](data:text/html;base64,PHNjcmlwdD4=)" />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('the alt');
  });
});

describe('a task list is read-only', () => {
  it('renders checkboxes disabled, because this is a result and not a form', () => {
    const { container } = render(<Markdown text={'- [x] done\n- [ ] todo'} />);
    const boxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    expect(boxes).toHaveLength(2);
    expect(boxes[0]!.checked).toBe(true);
    expect(boxes[1]!.checked).toBe(false);
    for (const box of boxes) expect(box.disabled).toBe(true);
  });
});

describe('a code block wraps rather than scrolling', () => {
  it('never puts a horizontal scroller around one', () => {
    // A fenced block in a side panel is usually not code: it is a model that
    // opened a fence and did not close it, so the rest of a report ends up
    // inside it. Scrolling that sideways hides prose behind a scrollbar.
    const { container } = render(
      <Markdown text={'```\nnot really code, just a long sentence\n```'} />,
    );
    const pre = container.querySelector('pre')!;
    expect(pre.className).toContain('whitespace-pre-wrap');
    expect(pre.className).not.toContain('overflow-x-auto');
  });
});

describe('emphasis inside a list is typeset like emphasis anywhere else', () => {
  it('renders bold inside a tight list item', () => {
    // A tight list's items are bare `text` tokens in block position, not
    // paragraphs. Without an arm for that they fell to the raw fallback and a
    // bulleted `**Type:** …` showed its asterisks — typeset everywhere except
    // inside a list, which is where model output puts most of its emphasis.
    const { container } = render(<Markdown text={'- **Type:** report\n- **Period:** Q4'} />);
    expect(container.querySelectorAll('li strong')).toHaveLength(2);
    expect(container.textContent).not.toContain('**');
  });

  it('renders a link inside a list item', () => {
    const { container } = render(<Markdown text={'- see [docs](https://example.com)'} />);
    expect(container.querySelector('li a')?.getAttribute('href')).toBe('https://example.com');
  });
});
