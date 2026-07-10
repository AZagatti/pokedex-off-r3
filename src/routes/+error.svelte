<script lang="ts">
	import { page } from '$app/stores';
	import { ArrowLeft } from '@lucide/svelte';
</script>

<div class="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-gray-900">
	<div class="text-center">
		<h1 class="mb-2 text-6xl font-bold text-gray-900 dark:text-white">404</h1>
		<p class="mb-6 text-2xl font-semibold text-gray-700 dark:text-gray-300">Page Not Found</p>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			The page you're looking for doesn't exist.
		</p>
		<a
			href="/"
			class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
		>
			<ArrowLeft size={20} />
			Back to Pokédex
		</a>
	</div>
</div>
