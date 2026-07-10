# Architecture

## Overview

The Pokédex is a single-page application (SPA) built with SvelteKit 5 that consumes the public PokéAPI. It uses a client-side rendering approach with strategic data caching for optimal performance.

## Data Flow

```
┌─────────────────┐
│   User Interaction
│   (Click, Search,
│    Filter)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Route Handler  │
│  (+page.svelte) │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  State Management   │
│  (Svelte 5 Runes,   │
│   Stores)           │
└────────┬────────────┘
         │
         ▼
┌─────────────────────────┐
│  API Layer              │
│  (src/lib/api/index.ts) │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Cache Layer             │
│  (src/lib/api/cache.ts)  │
│  In-Memory Map           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────┐
│  PokéAPI         │
│  (pokeapi.co)    │
└──────────────────┘
```

## Directory Structure

```
src/
├── routes/              # SvelteKit routes
│   ├── +layout.svelte   # Root layout (nav, footer)
│   ├── +page.svelte     # Home (Pokédex list)
│   ├── pokemon/
│   │   └── [name]/
│   │       └── +page.svelte  # Pokémon detail
│   ├── berries/
│   │   ├── +page.svelte      # Berry list
│   │   └── [name]/
│   │       └── +page.svelte  # Berry detail
│   ├── favorites/
│   │   └── +page.svelte      # Favorites list
│   └── +error.svelte    # Error fallback
├── lib/
│   ├── api/
│   │   ├── index.ts     # API functions
│   │   ├── cache.ts     # Caching utilities
│   │   └── schemas.ts   # Zod schemas
│   ├── components/
│   │   ├── PokemonImage.svelte
│   │   └── TypeBadge.svelte
│   ├── stores.ts        # Svelte stores (theme, favorites)
│   └── assets/
└── routes/
    └── layout.css       # Global styles
```

## API Caching Strategy

All API responses are cached in memory using a Map keyed by URL. This reduces network requests and improves perceived performance.

**Cache Flow:**

1. Client requests data via `fetchWithCache(url, schema)`
2. Check if URL exists in cache
3. If cached, return immediately
4. If not cached, fetch from PokéAPI
5. Validate response using Zod schema
6. Store in cache
7. Return validated data

**Cache Invalidation:**

- In-memory cache persists for the session
- Cache is cleared on page reload
- Future: Add TTL-based invalidation for stale data

## Component Architecture

### PokemonImage Component

- Props: Pokemon object, sprite variant
- Handles missing images gracefully
- Supports multiple sprite variants (artwork, front, back, shiny)

### TypeBadge Component

- Props: Type name, size
- Type-specific colors using Tailwind
- Responsive sizing

### Stores

**Theme Store** (`src/lib/stores.ts`)

- Manages light/dark mode
- Persists to localStorage
- Exports methods: `toggle()`, `set(theme)`

**Favorites Store** (`src/lib/stores.ts`)

- Manages favorited Pokémon IDs
- Persists to localStorage
- Exports methods: `toggle(id)`, `isFavorite(id)`

## Route Structure

### Static Routes

- `/` — Home page (Pokédex list)
- `/berries` — Berry list
- `/favorites` — User favorites

### Dynamic Routes

- `/pokemon/[name]` — Pokémon detail (client-rendered)
- `/berries/[name]` — Berry detail (client-rendered)

## State Management

**Svelte 5 Runes** are used for reactive state:

```typescript
let pokemonCards = $state([]);  // Reactive array
const colors = $derived(...);    // Computed value
$effect(() => {                 // Side effects
  applyFilters();
});
```

**Svelte Stores** are used for global state:

```typescript
import { theme, favorites } from '$lib/stores';
theme.subscribe(value => { ... });  // Subscribe to changes
favorites.toggle(id);               // Mutate state
```

## Performance Optimizations

1. **Code Splitting**: SvelteKit automatically splits routes
2. **Lazy Loading**: Infinite scroll loads data on demand
3. **Caching**: In-memory cache prevents redundant API calls
4. **Image Optimization**: Serves official artwork (cached by CDN)
5. **CSS**: Tailwind purges unused styles (production)
6. **Hydration**: SPA mode eliminates server rendering overhead

## Validation Strategy

All API responses are validated using Zod schemas before use. This catches:

- Missing required fields
- Type mismatches
- API response changes

```typescript
export const PokemonSchema = z.object({
	id: z.number(),
	name: z.string()
	// ... more fields
});

const pokemon = await fetchWithCache(url, PokemonSchema);
```

## Error Handling

- **API Failures**: Caught in try/catch, graceful fallback
- **Missing Data**: Fallback images/text shown
- **Invalid Routes**: 404 error page displayed
- **Network Errors**: Retry logic in fetch wrapper

## Accessibility

- Semantic HTML (nav, main, article, section)
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible on all buttons
- Respects `prefers-reduced-motion`
- Alt text on all images
- Proper heading hierarchy
