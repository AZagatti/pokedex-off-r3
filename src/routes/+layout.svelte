<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme } from '$lib/stores';
	import { Moon, Sun } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let isDark = $state(false);

	onMount(() => {
		theme.subscribe((value) => {
			isDark = value === 'dark';
			if (value === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		})();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
	<header class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
		<nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
			<a href="/" class="text-2xl font-bold text-red-600"> Pokédex </a>
			<div class="flex items-center gap-4">
				<a href="/" class="text-sm font-medium hover:text-red-600"> Pokémon </a>
				<a href="/berries" class="text-sm font-medium hover:text-red-600"> Berries </a>
				<a href="/favorites" class="text-sm font-medium hover:text-red-600"> Favorites </a>
				<button
					onclick={() => theme.toggle()}
					class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
					aria-label="Toggle theme"
				>
					{#if isDark}
						<Sun size={20} />
					{:else}
						<Moon size={20} />
					{/if}
				</button>
			</div>
		</nav>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer
		class="border-t border-gray-200 bg-gray-50 py-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
	>
		<p>
			Pokédex built with SvelteKit • Data from <a
				href="https://pokeapi.co"
				class="font-medium hover:underline">PokéAPI</a
			>
		</p>
	</footer>
</div>

<style>
	:global(html.dark) {
		color-scheme: dark;
	}

	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
