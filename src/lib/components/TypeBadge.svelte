<script lang="ts">
	interface Props {
		type: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { type, size = 'md' }: Props = $props();

	const typeColors: Record<string, { bg: string; text: string }> = {
		normal: { bg: 'bg-gray-400', text: 'text-gray-900' },
		fire: { bg: 'bg-red-500', text: 'text-white' },
		water: { bg: 'bg-blue-500', text: 'text-white' },
		electric: { bg: 'bg-yellow-400', text: 'text-gray-900' },
		grass: { bg: 'bg-green-500', text: 'text-white' },
		ice: { bg: 'bg-cyan-400', text: 'text-gray-900' },
		fighting: { bg: 'bg-red-700', text: 'text-white' },
		poison: { bg: 'bg-purple-500', text: 'text-white' },
		ground: { bg: 'bg-amber-600', text: 'text-white' },
		flying: { bg: 'bg-blue-300', text: 'text-gray-900' },
		psychic: { bg: 'bg-pink-500', text: 'text-white' },
		bug: { bg: 'bg-lime-500', text: 'text-gray-900' },
		rock: { bg: 'bg-gray-600', text: 'text-white' },
		ghost: { bg: 'bg-purple-700', text: 'text-white' },
		dragon: { bg: 'bg-indigo-600', text: 'text-white' },
		dark: { bg: 'bg-gray-800', text: 'text-white' },
		steel: { bg: 'bg-gray-500', text: 'text-white' },
		fairy: { bg: 'bg-pink-300', text: 'text-gray-900' }
	};

	const colors = $derived(typeColors[type.toLowerCase()] || typeColors.normal);

	const sizeClasses = {
		sm: 'px-2 py-1 text-xs',
		md: 'px-3 py-1 text-sm',
		lg: 'px-4 py-2 text-base'
	};
</script>

<span
	class={`inline-block rounded-full font-semibold capitalize ${colors.bg} ${colors.text} ${sizeClasses[size]}`}
>
	{type}
</span>
