# Pearl Studio — Five-Page Architectural Website

## Goal
Build a polished five-page website for Pearl Studio that combines editorial typography, premium architectural imagery, restrained motion, and lightweight procedural 3D without compromising mobile performance.

## Pages and content
- **Home:** immersive 3D-led opening, editorial introduction, featured project, four services, trust figures, cinematic enquiry prompt.
- **About:** architectural visual, studio story, Precision/Purpose/Permanence principles, responsive five-step process, team expertise.
- **Projects:** asymmetric six-project gallery, working category filters, project details shown in an accessible full-screen overlay.
- **Services:** four detailed capability sections with imagery, concise service lists, and lightweight architectural geometry.
- **Contact:** premium enquiry form with accessible labels, project and budget selectors, contact placeholders, and an in-page success state.

## Shared experience
- Create a consistent transparent-to-solid header, active-page navigation, animated fullscreen mobile menu, restrained page entrances, and a minimal footer.
- Build reusable buttons, headings, image reveals, project cards, 3D scenes, and content bands.
- Use local generated architectural photography rather than remote placeholders or generic stock imagery.
- Clearly label all unverified business details and statistics as placeholders in the content constants.

## Visual system
- Deep charcoal, ivory, pearl, stone, and restrained metallic tokens in the global design system.
- Instrument Serif for editorial display typography and Manrope for technical/body copy.
- Sharp architectural composition, thin rules, measurement annotations, subtle grain, generous negative space, and minimal corner rounding.
- Motion remains selective: hero entrance, image reveal, navigation transitions, and subtle project interactions only.

## 3D and performance
- Add React Three Fiber, Three.js, and Drei.
- Build reusable procedural architectural sculptures with concrete, glass, and metal materials, soft lighting, shadows, and slight pointer response.
- Lazy-load 3D scenes, cap pixel density, pause or reduce movement for reduced-motion users, and show lightweight CSS/image fallbacks on small screens.
- Keep 3D scenes limited to meaningful page moments rather than decorative repetition.

## Technical implementation
- Keep the existing TanStack Start architecture; create `/`, `/about`, `/projects`, `/services`, and `/contact` route files.
- Add unique metadata, canonical paths, Open Graph text, semantic headings, alt text, keyboard support, visible focus states, and appropriate structured data.
- Keep the contact form as a polished front-end demonstration; no message delivery or permanent storage will be added because no destination was provided.
- Verify builds, browser rendering, navigation, filtering, project details, form success, reduced motion, and desktop/mobile layouts.
