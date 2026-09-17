# pipelex.com design system, as read from the live site on 2026-09-03

Source: `https://pipelex.com/` HTML + its one Next.js stylesheet. Values quoted verbatim.

## Canvas
- Dark by default: `<html class="dark">`, `<body class="bg-[#0a0a0b] text-white antialiased">`.
- Page background: `linear-gradient(to bottom, transparent, rgb(12, 8, 20)) rgb(8, 6, 14)` (tokens `--background-start-rgb: 8, 6, 14`, `--background-end-rgb: 12, 8, 20`). Secondary surface `bg-bg-darker` = `rgb(13 11 20)`.
- Blur orbs behind sections: `.blur-orb { opacity:.3; position:absolute }` with `::before { background: radial-gradient(circle closest-side, var(--orb-color) 0%, var(--orb-color) 10%, transparent 90%); inset:-200px }`. Orb colours: teal `#00bb95b3`, purple `#6b21a8b3`, deep purple `#2a1048b3`.

## Colour
- `--accent-teal: #00bb95` (the brand accent, used for CTAs, highlights, rings, glows). `--accent-purple: #6b21a8` (gradients only, always at 10-20%).
- Text: headings `text-white`; body `text-gray-300` (#d1d5db); secondary `text-gray-400` (#9ca3af); tertiary `text-gray-500`; highlight `text-accent-teal`.
- Borders: `border-white/10` (dominant), `border-white/5`, `border-accent-teal/30` for emphasised cards.
- Fills: `bg-white/[0.06]`, `bg-white/5`, `bg-accent-teal/10` (tinted pill/badge), `bg-accent-teal` (primary CTA).
- Glass card: `.glass-card { background:#ffffff08; border:1px solid #ffffff14 }`, hover `background:#ffffff0f; border-color:#ffffff26; transform:translateY(-4px); box-shadow:0 20px 40px -20px #00000080`.
- Teal gradient: `linear-gradient(135deg,#00bb95 0%,#00a080 100%)`.
- Glow: `.animate-pulse-glow { box-shadow: 0 0 20px #00bb954d }` with a pulsing `0 0 40px #00bb9580` (3s ease-in-out, off under reduced motion). Shadows `shadow-accent-teal/20`, `/40`. Ring `ring-accent-teal/30`.
- Status colours appear only for semantic marks: rose-400/500, orange-400/500, emerald-400, yellow-400.

## Type
- Inter, variable 100-900, via next/font (`font-family: Inter, Inter Fallback`). Mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`.
- Headlines: `text-3xl`/`text-4xl/[1.2]` `font-bold tracking-tight`, white.
- Eyebrows: `text-xs`/`text-[11px]` `font-medium tracking-[0.15em]` uppercase, teal ("PATTERN 01", "PIPELEX AI SPRINT", "INSTALL").
- Body: `text-sm`/`text-lg leading-relaxed text-gray-300`.

## Shape
- Radii: `rounded-xl` (cards, CTAs), `rounded-2xl` (feature cards), `rounded-lg` (small controls, nav pills), `rounded-full` (pills, avatars, dots), `rounded-md` (rare).
- Buttons: primary `inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium text-sm bg-accent-teal text-white` (+ glow); outline `border border-accent-teal text-accent-teal hover:bg-accent-teal/10`; ghost `bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10`.
- Nav bar: logo `h-8 w-auto` (alt "Pipelex home"), links, a small outline pill "MTHDS" in teal, ghost buttons for GitHub/Discord.
- Transitions: `transition-all`, `.15s`-`.3s cubic-bezier(.4,0,.2,1)`.

## Copy
- Hero: "Executable AI Methods: the shared artifact for business, agents, and engineering." / "Business describes the work. Agents (Claude Code, Codex) build the executable method with them — no engineering build cycle."
- Tone: plain, confident, engineering-literate. Sections open with an eyebrow, then a bold headline, then one muted line.

## Logo
- White on transparent (for the dark canvas): https://d2cinlfp2qnig1.cloudfront.net/logo/Pipelex-logo-wot-1119x352.png
- Black on transparent (for a light canvas): https://d2cinlfp2qnig1.cloudfront.net/logo/Pipelex-logo-bot-1119x352.png
- Both 1119x352 PNG, public. At `height: 32px` the logo is ~102px wide.
