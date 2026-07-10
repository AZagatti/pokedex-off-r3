<script lang="ts">
	import { page } from '$app/stores';
	import { getPokemon, getSpecies, getEvolutionChain } from '$lib/api';
	import { favorites } from '$lib/stores';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import { Heart, Volume2, ArrowLeft } from '@lucide/svelte';

	interface PageData {
		pokemon: any;
		species: any;
		evolutions: any[];
	}

	let data: PageData = $state({ pokemon: null, species: null, evolutions: [] });
	let spriteVariant: 'artwork' | 'front' | 'back' | 'shiny' = $state('artwork');
	let loading = $state(true);

	const pokemonName = $page.params.name || '';

	async function loadData() {
		if (!pokemonName) return;
		try {
			const pokemon = await getPokemon(pokemonName);
			const species = await getSpecies(pokemonName);

			let evolutions: any[] = [];
			try {
				const chainUrl = species.evolution_chain.url;
				const chain = await getEvolutionChain(chainUrl);
				evolutions = flattenEvolutions(chain.chain);
			} catch {
				// Evolution chain not available
			}

			data = { pokemon, species, evolutions };
		} catch (err) {
			console.error('Failed to load pokemon:', err);
		} finally {
			loading = false;
		}
	}

	function flattenEvolutions(chainNode: any, evolutions: any[] = []): any[] {
		evolutions.push({
			name: chainNode.species.name,
			url: chainNode.species.url
		});

		if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
			chainNode.evolves_to.forEach((evolution: any) => {
				flattenEvolutions(evolution, evolutions);
			});
		}

		return evolutions;
	}

	function playCry() {
		if (data.pokemon?.cries?.latest) {
			const audio = new Audio(data.pokemon.cries.latest);
			audio.play();
		}
	}

	$effect(() => {
		loadData();
	});
</script>

{#if loading}
	<div class="flex justify-center py-12">
		<div
			class="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-red-600"
		></div>
	</div>
{:else if data.pokemon}
	<div class="mx-auto max-w-4xl px-4 py-8">
		<!-- Back button -->
		<a href="/" class="mb-6 inline-flex items-center gap-2 text-red-600 hover:underline">
			<ArrowLeft size={20} />
			Back to Pokédex
		</a>

		<!-- Header -->
		<div class="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row">
			<div>
				<p class="text-lg text-gray-600 dark:text-gray-400">
					#{String(data.pokemon.id).padStart(3, '0')}
				</p>
				<h1 class="text-4xl font-bold capitalize">{data.pokemon.name}</h1>
			</div>
			<button
				onclick={() => favorites.toggle(data.pokemon.id)}
				class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
			>
				<Heart
					size={20}
					fill="currentColor"
					class={favorites.isFavorite(data.pokemon.id) ? 'text-white' : 'text-gray-400'}
				/>
				Add to Favorites
			</button>
		</div>

		<div class="grid gap-8 md:grid-cols-2">
			<!-- Left: Image and Sprites -->
			<div>
				<div
					class="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800"
				>
					<PokemonImage pokemon={data.pokemon} variant={spriteVariant} />

					<div class="mt-6 flex flex-wrap gap-2">
						{#each ['artwork', 'front', 'back', 'shiny'] as variant (variant)}
							<button
								onclick={() => (spriteVariant = variant as 'artwork' | 'front' | 'back' | 'shiny')}
								class={`rounded px-3 py-1 text-sm capitalize ${
									spriteVariant === variant
										? 'bg-red-600 text-white'
										: 'border border-gray-300 dark:border-gray-600'
								}`}
							>
								{variant}
							</button>
						{/each}
					</div>

					{#if data.pokemon.cries?.latest}
						<button
							onclick={playCry}
							class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
						>
							<Volume2 size={20} />
							Play Cry
						</button>
					{/if}
				</div>
			</div>

			<!-- Right: Details -->
			<div>
				<!-- Types -->
				<div class="mb-6">
					<h2 class="mb-3 text-lg font-semibold">Type</h2>
					<div class="flex flex-wrap gap-2">
						{#each data.pokemon.types as typeObj}
							<TypeBadge type={typeObj.type.name} size="lg" />
						{/each}
					</div>
				</div>

				<!-- Dimensions -->
				<div class="mb-6 grid grid-cols-2 gap-4">
					<div
						class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
					>
						<p class="text-sm text-gray-600 dark:text-gray-400">Height</p>
						<p class="text-2xl font-bold">{(data.pokemon.height / 10).toFixed(1)} m</p>
					</div>
					<div
						class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
					>
						<p class="text-sm text-gray-600 dark:text-gray-400">Weight</p>
						<p class="text-2xl font-bold">{(data.pokemon.weight / 10).toFixed(1)} kg</p>
					</div>
				</div>

				<!-- Stats -->
				<div class="mb-6">
					<h2 class="mb-3 text-lg font-semibold">Base Stats</h2>
					<div class="space-y-3">
						{#each data.pokemon.stats as stat}
							<div>
								<div class="mb-1 flex justify-between text-sm">
									<span class="capitalize">{stat.stat.name}</span>
									<span class="font-semibold">{stat.base_stat}</span>
								</div>
								<div class="h-2 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-700">
									<div
										class="h-full bg-gradient-to-r from-red-500 to-red-600"
										style={`width: ${(stat.base_stat / 255) * 100}%`}
									></div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Abilities -->
				{#if data.pokemon.abilities.length > 0}
					<div>
						<h2 class="mb-3 text-lg font-semibold">Abilities</h2>
						<ul class="space-y-2">
							{#each data.pokemon.abilities as ability}
								<li class="flex items-center gap-2">
									<span class="capitalize">{ability.ability.name}</span>
									{#if ability.is_hidden}
										<span class="text-xs font-semibold text-yellow-600 dark:text-yellow-400"
											>Hidden</span
										>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>

		<!-- Moves -->
		{#if data.pokemon.moves.length > 0}
			<div class="mt-8">
				<h2 class="mb-4 text-lg font-semibold">Example Moves</h2>
				<div class="flex flex-wrap gap-2">
					{#each data.pokemon.moves.slice(0, 8) as move}
						<div
							class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 dark:border-gray-700 dark:bg-gray-800"
						>
							<p class="text-sm capitalize">{move.move.name}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Evolution Chain -->
		{#if data.evolutions.length > 0}
			<div class="mt-8">
				<h2 class="mb-4 text-lg font-semibold">Evolution Chain</h2>
				<div class="flex items-center gap-4 overflow-x-auto pb-4">
					{#each data.evolutions as evo, idx}
						<a
							href="/pokemon/{evo.name}"
							class="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
						>
							<p class="text-sm font-semibold capitalize">{evo.name}</p>
						</a>
						{#if idx < data.evolutions.length - 1}
							<div class="text-2xl text-gray-400">→</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div
		class="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-800"
	>
		<p class="text-gray-600 dark:text-gray-400">Pokémon not found</p>
	</div>
{/if}
