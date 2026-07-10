import { writable } from 'svelte/store';

function createThemeStore() {
	const storedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : 'light';
	const { subscribe, set } = writable<'light' | 'dark'>(storedTheme === 'dark' ? 'dark' : 'light');

	return {
		subscribe,
		toggle: () => {
			set((current) => {
				const newTheme = current === 'light' ? 'dark' : 'light';
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('theme', newTheme);
				}
				if (typeof document !== 'undefined') {
					document.documentElement.classList.toggle('dark');
				}
				return newTheme;
			});
		},
		set: (theme: 'light' | 'dark') => {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('theme', theme);
			}
			set(theme);
		}
	};
}

function createFavoritesStore() {
	const storedFavorites =
		typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('favorites') || '[]') : [];
	const { subscribe, update } = writable<number[]>(storedFavorites);

	return {
		subscribe,
		toggle: (id: number) => {
			update((favorites) => {
				const newFavorites = favorites.includes(id)
					? favorites.filter((f) => f !== id)
					: [...favorites, id];
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('favorites', JSON.stringify(newFavorites));
				}
				return newFavorites;
			});
		},
		isFavorite: (id: number) => {
			let isFav = false;
			subscribe((favorites) => {
				isFav = favorites.includes(id);
			})();
			return isFav;
		}
	};
}

export const theme = createThemeStore();
export const favorites = createFavoritesStore();
