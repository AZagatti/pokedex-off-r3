import adapter from '@sveltejs/adapter-static';

export default {
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({
			fallback: '404.html',
			strict: false
		}),
		paths: {
			base: '/pokedex-off-r3'
		}
	}
};
