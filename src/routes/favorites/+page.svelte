<script lang="ts">
	import { onMount } from 'svelte';
	import { getPokemon } from '$lib/api';
	import { favorites } from '$lib/stores';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import { Heart } from '@lucide/svelte';

	interface PokemonCard {
		id: number;
		name: string;
		image: string | null;
		types: string[];
	}

	let favoritePokemon: PokemonCard[] = $state([]);
	let loading = $state(true);
	let favoriteIds: number[] = $state([]);

	onMount(async () => {
		// Subscribe to favorites store
		favorites.subscribe((ids) => {
			favoriteIds = ids;
			loadFavorites();
		})();
	});

	async function loadFavorites() {
		loading = true;
		try {
			const cards = await Promise.all(
				favoriteIds.map(async (id) => {
					try {
						const pokemon = await getPokemon(id);
						return {
							id: pokemon.id,
							name: pokemon.name,
							image:
								pokemon.sprites.other?.official_artwork?.front_default ||
								pokemon.sprites.front_default,
							types: pokemon.types.map((t) => t.type.name)
						};
					} catch {
						return null;
					}
				})
			);

			favoritePokemon = cards.filter((c) => c !== null);
		} finally {
			loading = false;
		}
	}

	function removeFavorite(id: number) {
		favorites.toggle(id);
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold">My Favorite Pokémon</h1>

	{#if favoritePokemon.length === 0 && !loading}
		<div
			class="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-800"
		>
			<p class="mb-4 text-gray-600 dark:text-gray-400">No favorites yet</p>
			<a href="/" class="text-red-600 hover:underline"> Browse Pokémon to add favorites </a>
		</div>
	{:else if loading}
		<div class="flex justify-center">
			<div
				class="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-red-600"
			></div>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each favoritePokemon as pokemon (pokemon.id)}
				<div
					class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
				>
					<a href="/pokemon/{pokemon.name}" class="block p-4">
						<div class="mb-4 flex items-start justify-between">
							<div>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									#{String(pokemon.id).padStart(3, '0')}
								</p>
								<h3 class="text-lg font-semibold capitalize">{pokemon.name}</h3>
							</div>
						</div>

						{#if pokemon.image}
							<img
								src={pokemon.image}
								alt={pokemon.name}
								class="mx-auto h-40 w-40 object-contain"
							/>
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

					<div class="border-t border-gray-200 p-4 dark:border-gray-700">
						<button
							onclick={() => removeFavorite(pokemon.id)}
							class="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
						>
							<Heart size={20} fill="currentColor" />
							Remove from Favorites
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
