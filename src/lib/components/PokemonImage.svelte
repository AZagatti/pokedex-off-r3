<script lang="ts">
	interface Props {
		pokemon: {
			sprites: {
				other?: {
					official_artwork?: {
						front_default: string | null;
					};
				};
				front_default: string | null;
				back_default?: string | null;
				front_shiny?: string | null;
			};
			name: string;
		};
		variant?: 'artwork' | 'front' | 'back' | 'shiny';
	}

	let { pokemon, variant = 'artwork' }: Props = $props();

	const imageUrl = $derived.by(() => {
		switch (variant) {
			case 'artwork':
				return (
					pokemon.sprites.other?.official_artwork?.front_default || pokemon.sprites.front_default
				);
			case 'front':
				return pokemon.sprites.front_default;
			case 'back':
				return pokemon.sprites.back_default || pokemon.sprites.front_default;
			case 'shiny':
				return pokemon.sprites.front_shiny || pokemon.sprites.front_default;
			default:
				return pokemon.sprites.front_default;
		}
	});
</script>

{#if imageUrl}
	<img src={imageUrl} alt={pokemon.name} class="mx-auto h-48 w-48 object-contain" />
{:else}
	<div class="flex h-48 w-48 items-center justify-center bg-gray-200 text-gray-500">No image</div>
{/if}
