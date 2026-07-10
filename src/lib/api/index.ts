import { fetchWithCache } from './cache';
import {
	PokemonSchema,
	PokemonListSchema,
	SpeciesSchema,
	EvolutionChainSchema,
	GenerationSchema,
	TypeSchema,
	BerrySchema,
	BerryListSchema,
	type Pokemon,
	type Species,
	type EvolutionChain,
	type Generation,
	type Type,
	type Berry
} from './schemas';

const API_BASE = 'https://pokeapi.co/api/v2';

export async function getPokemonList(limit: number = 30, offset: number = 0) {
	const url = `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`;
	return fetchWithCache(url, PokemonListSchema);
}

export async function getPokemon(nameOrId: string | number): Promise<Pokemon> {
	const url = `${API_BASE}/pokemon/${nameOrId}`;
	return fetchWithCache(url, PokemonSchema);
}

export async function getSpecies(nameOrId: string | number): Promise<Species> {
	const url = `${API_BASE}/pokemon-species/${nameOrId}`;
	return fetchWithCache(url, SpeciesSchema);
}

export async function getEvolutionChain(url: string): Promise<EvolutionChain> {
	return fetchWithCache(url, EvolutionChainSchema);
}

export async function getGeneration(idOrName: string | number): Promise<Generation> {
	const url = `${API_BASE}/generation/${idOrName}`;
	return fetchWithCache(url, GenerationSchema);
}

export async function getType(name: string): Promise<Type> {
	const url = `${API_BASE}/type/${name}`;
	return fetchWithCache(url, TypeSchema);
}

export async function getBerryList(limit: number = 30, offset: number = 0) {
	const url = `${API_BASE}/berry?limit=${limit}&offset=${offset}`;
	return fetchWithCache(url, BerryListSchema);
}

export async function getBerry(nameOrId: string | number): Promise<Berry> {
	const url = `${API_BASE}/berry/${nameOrId}`;
	return fetchWithCache(url, BerrySchema);
}

export type { Pokemon, Species, EvolutionChain, Generation, Type, Berry };
