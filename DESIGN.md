# Reference design

Authority: https://miosa.ai/, /docs, /pricing, captured 2026-11-09. Preserve the reference identity and distinguish its three surfaces. The owner prioritizes visual fidelity and reusable content.

Use the exact documented values in `src/lib/styles/reference-tokens.css` and `docs/STYLE_AUDIT.md`. Do not replace separate text, surface, border, panel-shadow, nav-shadow and card-shadow values with one approximate gray or shadow. Home uses the system sans stack; documentation and pricing use Geist. Geist Mono is for documentation code. Documentation enables `ss01`, `cv11` and antialiasing. Heading weight varies by surface: home620, pricing540, docs landing590, article600.

The marketing background is #07080b. The homepage wire layer has opacity .72, while pricing has .20 and a different vertical shade. ComputeScene preserves the public Three.js grid and shader. Documentation uses a #f4f4f5 canvas and white panel in light mode, with separate dark tokens, a260px resizable sidebar and224px TOC rail. Panels have16px corners and the captured multilayer shadows.

Scrollbars are per region. Keep native page/code/pricing scrolling, thin token-colored sidebar/search/OSA scrolling, and hidden but usable tab/TOC/install scrolling. The source does not assign a universal thumb radius or pixel width. Consult the15-region inventory before changing scrolling.

Motion follows observed interactions: starfield entrance, flight/skip/replay, card deck, draggable Logo field and laser, pointer-responsive wire scene. Respect reduced motion and release timers/listeners when a surface unmounts. Use local content, explicit unavailable/error states, and honest boundaries for official account actions. See docs/INTERACTIONS.md.
