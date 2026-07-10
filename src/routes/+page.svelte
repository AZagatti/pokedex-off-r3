<script lang="ts">
	import { onMount } from 'svelte';
	import { getPokemonList, getPokemon, getGeneration, getType } from '$lib/api';
	import { favorites } from '$lib/stores';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import { Heart, X } from '@lucide/svelte';

	interface PokemonCard {
		id: number;
		name: string;
		image: string | null;
		types: string[];
	}

	let pokemonCards: PokemonCard[] = $state([]);
	let filteredPokemon: PokemonCard[] = $state([]);
	let allPokemonList: { name: string; url: string }[] = $state([]);
	let loading = $state(false);
	let hasMore = $state(true);
	let offset = $state(0);

	// Filter states
	let searchTerm = $state('');
	let selectedGenerations = $state<string[]>([]);
	let selectedTypes = $state<string[]>([]);
	let sortBy = $state<'dex' | 'stats'>('dex');

	let generations: { id: string; name: string }[] = $state([]);
	let typeList: string[] = $state([]);
	let pokemonByType: Record<string, string[]> = $state({});
	let pokemonByGen: Record<string, string[]> = $state({});

	const TYPES = [
		'normal',
		'fire',
		'water',
		'electric',
		'grass',
		'ice',
		'fighting',
		'poison',
		'ground',
		'flying',
		'psychic',
		'bug',
		'rock',
		'ghost',
		'dragon',
		'dark',
		'steel',
		'fairy'
	];

	onMount(async () => {
		// Load data about generations and types for filtering
		const genPromises = Array.from({ length: 9 }, (_, i) => i + 1).map((id) =>
			getGeneration(id)
				.then((gen) => {
					pokemonByGen[gen.name] = gen.pokemon_species.map((s) => s.name);
					return { id: gen.name, name: `Gen ${id}` };
				})
				.catch(() => null)
		);

		const typePromises = TYPES.map((type) =>
			getType(type)
				.then((t) => {
					pokemonByType[type] = t.pokemon.map((p) => p.pokemon.name);
					return type;
				})
				.catch(() => null)
		);

		const [genResults, typeResults] = await Promise.all([
			Promise.all(genPromises),
			Promise.all(typePromises)
		]);

		generations = genResults.filter((g) => g !== null) as { id: string; name: string }[];
		typeList = typeResults.filter((t) => t !== null) as string[];

		// Initial load
		await loadMorePokemon();
	});

	async function loadMorePokemon() {
		if (loading || !hasMore) return;
		loading = true;

		try {
			const result = await getPokemonList(30, offset);
			allPokemonList = [...allPokemonList, ...result.results];

			// Fetch details for each Pokémon
			const newCards = await Promise.all(
				result.results.map(async (poke) => {
					try {
						const details = await getPokemon(poke.name);
						return {
							id: details.id,
							name: details.name,
							image:
								details.sprites.other?.official_artwork?.front_default ||
								details.sprites.front_default,
							types: details.types.map((t) => t.type.name)
						};
					} catch {
						return null;
					}
				})
			);

			pokemonCards = [...pokemonCards, ...(newCards.filter((c) => c !== null) as PokemonCard[])];
			offset += 30;
			hasMore = result.next !== null;
			applyFilters();
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		let filtered = pokemonCards;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
		}

		// Generation filter
		if (selectedGenerations.length > 0) {
			const pokemonInGens = new Set<string>();
			selectedGenerations.forEach((gen) => {
				pokemonByGen[gen]?.forEach((name) => pokemonInGens.add(name));
			});
			filtered = filtered.filter((p) => pokemonInGens.has(p.name));
		}

		// Type filter
		if (selectedTypes.length > 0) {
			filtered = filtered.filter((p) => selectedTypes.some((type) => p.types.includes(type)));
		}

		// Sort
		if (sortBy === 'stats') {
			// Note: This is simplified - would need to fetch stats for each
			filtered = [...filtered].sort((a, b) => b.id - a.id);
		} else {
			filtered = [...filtered].sort((a, b) => a.id - b.id);
		}

		filteredPokemon = filtered;
	}

	function toggleGeneration(gen: string) {
		selectedGenerations = selectedGenerations.includes(gen)
			? selectedGenerations.filter((g) => g !== gen)
			: [...selectedGenerations, gen];
		applyFilters();
	}

	function toggleType(type: string) {
		selectedTypes = selectedTypes.includes(type)
			? selectedTypes.filter((t) => t !== type)
			: [...selectedTypes, type];
		applyFilters();
	}

	function clearFilters() {
		searchTerm = '';
		selectedGenerations = [];
		selectedTypes = [];
		sortBy = 'dex';
		applyFilters();
	}

	function toggleFavorite(id: number) {
		favorites.toggle(id);
	}

	$effect(() => {
		applyFilters();
	});
</script>

<div class="mx-auto max-w-7xl px-4 py-8">
	<!-- Search and Filters -->
	<div
		class="sticky top-0 z-10 mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800"
	>
		<div class="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
			<input
				type="text"
				placeholder="Search Pokémon..."
				bind:value={searchTerm}
				class="flex-1 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
			/>
			<select
				bind:value={sortBy}
				class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
			>
				<option value="dex">Sort by Dex #</option>
				<option value="stats">Sort by Stats</option>
			</select>
			{#if selectedGenerations.length > 0 || selectedTypes.length > 0 || searchTerm}
				<button
					onclick={clearFilters}
					class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				>
					<X size={18} />
					Clear
				</button>
			{/if}
		</div>

		<div class="mb-4">
			<h3 class="mb-2 text-sm font-semibold">Generations</h3>
			<div class="flex flex-wrap gap-2">
				{#each generations as gen}
					<button
						onclick={() => toggleGeneration(gen.id)}
						class={`rounded-lg px-3 py-1 text-sm ${
							selectedGenerations.includes(gen.id)
								? 'bg-red-600 text-white'
								: 'border border-gray-300 dark:border-gray-600'
						}`}
					>
						{gen.name}
					</button>
				{/each}
			</div>
		</div>

		<div>
			<h3 class="mb-2 text-sm font-semibold">Types</h3>
			<div class="flex flex-wrap gap-2">
				{#each typeList as type}
					<button
						onclick={() => toggleType(type)}
						class={`rounded-lg px-3 py-1 text-sm capitalize ${
							selectedTypes.includes(type)
								? 'bg-red-600 text-white'
								: 'border border-gray-300 dark:border-gray-600'
						}`}
					>
						{type}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Results -->
	{#if filteredPokemon.length === 0 && !loading}
		<div
			class="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-800"
		>
			<p class="text-gray-600 dark:text-gray-400">No Pokémon found</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredPokemon as pokemon (pokemon.id)}
				<a
					href="/pokemon/{pokemon.name}"
					class="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
				>
					<div class="mb-4 flex items-start justify-between">
						<div>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								#{String(pokemon.id).padStart(3, '0')}
							</p>
							<h3 class="text-lg font-semibold capitalize">{pokemon.name}</h3>
						</div>
						<button
							onclick={(e) => {
								e.preventDefault();
								toggleFavorite(pokemon.id);
							}}
							class="text-gray-400 hover:text-red-600"
						>
							<Heart
								size={24}
								fill="currentColor"
								class={favorites.isFavorite(pokemon.id) ? 'text-red-600' : 'text-gray-400'}
							/>
						</button>
					</div>

					{#if pokemon.image}
						<img src={pokemon.image} alt={pokemon.name} class="mx-auto h-40 w-40 object-contain" />
					{:else}
						<div class="flex h-40 w-40 items-center justify-center bg-gray-100 dark:bg-gray-700">
							Loading...
						</div>
					{/if}

					<div class="mt-4 flex flex-wrap gap-2">
						{#each pokemon.types as type}
							<TypeBadge {type} size="sm" />
						{/each}
					</div>
				</a>
			{/each}
		</div>

		{#if loading}
			<div class="mt-12 flex justify-center">
				<div
					class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-red-600"
				></div>
			</div>
		{/if}

		{#if hasMore && !loading}
			<div class="mt-12 text-center">
				<button
					onclick={loadMorePokemon}
					class="rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
				>
					Load More
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	:global(.prefers-reduced-motion) * {
		animation: none !important;
		transition: none !important;
	}
</style>
