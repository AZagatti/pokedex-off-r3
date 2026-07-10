<script lang="ts">
	import { onMount } from 'svelte';
	import { getBerryList, getBerry } from '$lib/api';

	interface BerryCard {
		id: number;
		name: string;
		firmness: string;
		size: number;
		growth_time: number;
	}

	let berries: BerryCard[] = $state([]);
	let loading = $state(true);
	let hasMore = $state(true);
	let offset = $state(0);

	onMount(async () => {
		await loadMoreBerries();
	});

	async function loadMoreBerries() {
		loading = true;
		try {
			const result = await getBerryList(30, offset);

			const berryCards = await Promise.all(
				result.results.map(async (berry) => {
					try {
						const details = await getBerry(berry.name);
						return {
							id: details.id,
							name: details.name,
							firmness: details.firmness.name,
							size: details.size,
							growth_time: details.growth_time
						};
					} catch {
						return null;
					}
				})
			);

			berries = [...berries, ...berryCards.filter((b) => b !== null)];
			offset += 30;
			hasMore = result.next !== null;
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold">Pokémon Berries</h1>

	{#if berries.length === 0 && !loading}
		<div class="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-800">
			<p class="text-gray-600 dark:text-gray-400">No berries found</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each berries as berry (berry.id)}
				<a
					href="/berries/{berry.name}"
					class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
				>
					<h3 class="mb-2 text-lg font-semibold capitalize">{berry.name}</h3>
					<div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
						<p><span class="font-medium">Firmness:</span> {berry.firmness}</p>
						<p><span class="font-medium">Size:</span> {berry.size}</p>
						<p><span class="font-medium">Growth Time:</span> {berry.growth_time}h</p>
					</div>
				</a>
			{/each}
		</div>

		{#if loading}
			<div class="mt-12 flex justify-center">
				<div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-red-600"></div>
			</div>
		{/if}

		{#if hasMore && !loading}
			<div class="mt-12 text-center">
				<button
					onclick={loadMoreBerries}
					class="rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
				>
					Load More
				</button>
			</div>
		{/if}
	{/if}
</div>
