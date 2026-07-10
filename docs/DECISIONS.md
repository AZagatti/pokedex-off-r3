# Design Decisions

## Framework: SvelteKit + Svelte 5 Runes

**Decision**: Use SvelteKit with Svelte 5 Runes instead of React/Next.js

**Rationale**:
- **Bundle Size**: Svelte produces smaller, more efficient code (~30% smaller than React)
- **Reactivity**: Runes make reactivity explicit and easy to reason about
- **Developer Experience**: Less boilerplate than React hooks
- **Built-in Routing**: SvelteKit provides file-based routing out of the box
- **Type Safety**: TypeScript support is first-class

**Alternatives Considered**:
- React + Next.js: More tooling, larger bundle
- Vue + Nuxt: Good option, but less familiar to team

---

## Static Adapter with SPA Fallback

**Decision**: Use `@sveltejs/adapter-static` with `fallback: '404.html'` and `strict: false` for SPA mode

**Rationale**:
- **GitHub Pages Compatible**: Deploys as static site to free hosting
- **Client-Side Routing**: All routing happens in browser (no server needed)
- **Infinite Scroll**: Dynamic routes (like `/pokemon/[name]`) render client-side
- **Fast Deploys**: No build server needed, just push to GitHub

**Configuration**:
```javascript
export default {
  kit: {
    adapter: adapter({
      fallback: '404.html',  // SPA routing fallback
      strict: false          // Allow dynamic routes
    }),
    paths: {
      base: '/pokedex-off-r3'  // GitHub Pages project path
    }
  }
}
```

**Alternatives Considered**:
- adapter-node: Requires server (incompatible with Pages)
- adapter-vercel: Free tier works, but more complex
- SPA without static adapter: No prerender, CSS import issues

---

## Zod Validation

**Decision**: Use Zod for runtime validation of all API responses

**Rationale**:
- **Type Safety**: Schemas provide both runtime and TypeScript types
- **API Robustness**: Catches breaking changes in PokéAPI
- **Error Messages**: Clear validation errors for debugging
- **Composable**: Schemas are reusable and composable

**Example**:
```typescript
export const PokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  sprites: z.object({ ... }),
  // ...
});

const pokemon = PokemonSchema.parse(data);  // Throws if invalid
```

**Alternatives Considered**:
- Manual validation: Error-prone, verbose
- TypeScript only: No runtime safety
- JSON Schema: Verbose, less ergonomic

---

## Tailwind CSS v4

**Decision**: Use Tailwind CSS v4 for styling

**Rationale**:
- **Utility-First**: Rapid development without context-switching to CSS files
- **Dark Mode Support**: Built-in dark mode via `dark:` prefix
- **Bundle Optimization**: Unused styles automatically purged
- **Consistency**: Design system baked into utilities
- **v4 Features**: New CSS engine, better performance

**Custom CSS**:
- Animations use native CSS (respects `prefers-reduced-motion`)
- Type badge colors use Tailwind's color palette
- Stat bars use CSS gradients for visual appeal

**Alternatives Considered**:
- CSS-in-JS: Runtime overhead
- styled-components: Same overhead
- Plain CSS: No scalability

---

## In-Memory Cache

**Decision**: Implement simple Map-based in-memory cache instead of complex library

**Rationale**:
- **Zero Dependencies**: No external cache library
- **Simple API**: Just `getFromCache(key)` and `setInCache(key, value)`
- **Sufficient for MVP**: Session-based caching works well for SPA
- **Predictable**: No cache invalidation surprises

**Cache Structure**:
```typescript
const cache = new Map<string, unknown>();

export async function fetchWithCache<T>(
  url: string,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  const cached = cache.get(url);
  if (cached) return cached;
  
  const response = await fetch(url);
  const data = schema.parse(await response.json());
  cache.set(url, data);
  return data;
}
```

**Alternatives Considered**:
- Redis: Overkill, requires backend
- localStorage Cache: Slower, limited size
- Service Worker Cache: Complex, uncertain browser support

---

## Svelte Stores for Global State

**Decision**: Use Svelte stores for theme + favorites (not Pinia/Redux)

**Rationale**:
- **Built-In**: No external dependencies
- **Lightweight**: Minimal code overhead
- **Sufficient**: Simple state (two stores)
- **localStorage Integration**: Easy persistence

**Why Not Context API?**:
- Stores are simpler to subscribe to
- Better for cross-route state

**Example**:
```typescript
export const theme = writable<'light' | 'dark'>('light');

theme.subscribe(value => {
  document.documentElement.classList.toggle('dark');
});
```

---

## TypeScript in Strict Mode

**Decision**: Enable TypeScript strict mode across the project

**Rationale**:
- **Catches Errors Early**: Prevents many runtime bugs
- **Self-Documenting**: Types act as inline documentation
- **Refactoring Safety**: Compiler catches missed updates
- **Better Tooling**: IDE autocomplete more accurate

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    // ... other strict options
  }
}
```

---

## Testing Strategy

**Decision**: Use Vitest (unit) + Playwright (e2e)

**Rationale**:
- **Vitest**: Fast unit testing with Jest-compatible API
- **Playwright**: Reliable cross-browser e2e testing
- **Both Free**: No paid tiers needed
- **GitHub Actions**: Easy CI/CD integration

**Coverage**:
- Unit tests for utility functions (API, cache, stores)
- E2E tests for critical user flows (search, favorite, detail view)

---

## Accessibility First

**Decision**: Build with accessibility (WCAG 2.1 AA) from the start

**Rationale**:
- **Legal**: May be required for public apps in some jurisdictions
- **Users**: ~15% of population has disabilities
- **SEO**: Accessible sites rank better
- **Quality**: Accessible code is often cleaner code

**Implementations**:
- Semantic HTML (`<nav>`, `<main>`, `<article>`)
- ARIA labels on interactive elements
- Keyboard navigation (Tab, Enter, Escape)
- Focus visible on all buttons
- `prefers-reduced-motion` respected
- Alt text on all images
- Color contrast ratios ≥4.5:1

---

## GitHub Pages Deployment

**Decision**: Deploy to GitHub Pages with GitHub Actions

**Rationale**:
- **Free Hosting**: No costs (unlike Vercel, Netlify)
- **CI/CD Included**: GitHub Actions for free
- **Simple Setup**: One configuration file
- **Custom Domain**: Supports CNAME records
- **Performance**: CDN-backed by GitHub

**Deployment Flow**:
```
Push to main
  ↓
GitHub Actions triggers
  ↓
npm run build (static files)
  ↓
Upload to GitHub Pages
  ↓
Live at https://azagatti.github.io/pokedex-off-r3/
```

---

## Why Not SSG/ISR?

**Considered**: Server-side generation with incremental static regeneration

**Rejected Because**:
- **PokéAPI Scale**: 1000+ Pokémon + combinations = huge build time
- **GitHub Pages Limitation**: Static hosting only, no API calls during build
- **SPA Simpler**: Client-side rendering works better with dynamic filters
- **User Interactivity**: Infinite scroll requires client-side data fetching

---

## API Caching Depth

**Decision**: Cache at three levels (in-memory, browser, CDN)

**Rationale**:
- **In-Memory**: Session cache prevents redundant requests
- **Browser Cache**: HTTP caching headers from PokéAPI
- **CDN**: Image assets (sprites) cached by CDN

**Not Implementing**:
- Service Worker cache: Adds complexity, session cache sufficient
- Database cache: Unnecessary for MVP

---

## No Component Library

**Decision**: Build UI components from scratch instead of using component library

**Rationale**:
- **Full Control**: Exact visual design needed
- **Bundle Size**: No unused components
- **Learning**: Understand how components work
- **Tailwind Sufficiency**: Tailwind's utilities are enough for most needs

**Components Built**:
- `PokemonImage.svelte` — Image with variant switching
- `TypeBadge.svelte` — Type badges with colors

---

## Conclusion

Each decision prioritizes:
1. **Simplicity** — Fewer dependencies, less code
2. **Performance** — Fast loading, efficient rendering
3. **Maintainability** — Clear patterns, good documentation
4. **User Experience** — Responsive, accessible, fast

The result is a lean, performant Pokédex that's easy to understand and extend.
