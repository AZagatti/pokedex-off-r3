<script lang="ts">
	import { page } from '$app/stores';
	import { getBerry } from '$lib/api';
	import { ArrowLeft } from '@lucide/svelte';

	interface PageData {
		berry: any;
	}

	let data: PageData = $state({ berry: null });
	let loading = $state(true);

	async function loadData() {
		try {
			const berry = await getBerry($page.params.name);
			data = { berry };
		} catch (err) {
			console.error('Failed to load berry:', err);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadData();
	});
</script>

{#if loading}
	<div class="flex justify-center py-12">
		<div class="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-red-600"></div>
	</div>
{:else if data.berry}
	<div class="mx-auto max-w-2xl px-4 py-8">
		<!-- Back button -->
		<a
			href="/berries"
			class="mb-6 inline-flex items-center gap-2 text-red-600 hover:underline"
		>
			<ArrowLeft size={20} />
			Back to Berries
		</a>

		<!-- Header -->
		<h1 class="mb-8 text-3xl font-bold capitalize">{data.berry.name} Berry</h1>

		<!-- Details Grid -->
		<div class="grid gap-6 md:grid-cols-2">
			<div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
				<h2 class="mb-4 text-lg font-semibold">Properties</h2>
				<div class="space-y-3">
					<div>
						<p class="text-sm text-gray-600 dark:text-gray-400">Firmness</p>
						<p class="font-semibold capitalize">{data.berry.firmness.name}</p>
					</div>
					<div>
						<p class="text-sm text-gray-600 dark:text-gray-400">Size</p>
						<p class="font-semibold">{data.berry.size} mm</p>
					</div>
					<div>
						<p class="text-sm text-gray-600 dark:text-gray-400">Growth Time</p>
						<p class="font-semibold">{data.berry.growth_time} hours</p>
					</div>
				</div>
			</div>

			{#if data.berry.flavors && data.berry.flavors.length > 0}
				<div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
					<h2 class="mb-4 text-lg font-semibold">Flavors</h2>
					<div class="space-y-2">
						{#each data.berry.flavors as flavor}
							<div class="flex justify-between">
								<span class="capitalize">{flavor.flavor.name}</span>
								<span class="font-semibold text-red-600">{flavor.potency}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-800">
		<p class="text-gray-600 dark:text-gray-400">Berry not found</p>
	</div>
{/if}
