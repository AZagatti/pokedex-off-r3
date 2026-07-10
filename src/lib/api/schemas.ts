import { z } from 'zod';

export const PokemonSchema = z.object({
	id: z.number(),
	name: z.string(),
	sprites: z.object({
		front_default: z.string().nullable(),
		front_shiny: z.string().nullable(),
		back_default: z.string().nullable(),
		back_shiny: z.string().nullable(),
		other: z
			.object({
				official_artwork: z.object({
					front_default: z.string().nullable()
				})
			})
			.optional()
	}),
	height: z.number(),
	weight: z.number(),
	types: z.array(
		z.object({
			type: z.object({
				name: z.string()
			})
		})
	),
	stats: z.array(
		z.object({
			stat: z.object({
				name: z.string()
			}),
			base_stat: z.number()
		})
	),
	abilities: z.array(
		z.object({
			ability: z.object({
				name: z.string()
			}),
			is_hidden: z.boolean()
		})
	),
	moves: z.array(
		z.object({
			move: z.object({
				name: z.string()
			})
		})
	),
	cries: z.object({
		latest: z.string().nullable()
	})
});

export const PokemonListSchema = z.object({
	count: z.number(),
	next: z.string().nullable(),
	previous: z.string().nullable(),
	results: z.array(
		z.object({
			name: z.string(),
			url: z.string()
		})
	)
});

export const SpeciesSchema = z.object({
	id: z.number(),
	name: z.string(),
	generation: z.object({
		name: z.string()
	}),
	evolution_chain: z.object({
		url: z.string()
	})
});

export const EvolutionChainSchema = z.object({
	chain: z.object({
		evolves_to: z.array(z.any()),
		species: z.object({
			name: z.string(),
			url: z.string()
		})
	})
});

export const GenerationSchema = z.object({
	id: z.number(),
	name: z.string(),
	pokemon_species: z.array(
		z.object({
			name: z.string(),
			url: z.string()
		})
	)
});

export const TypeSchema = z.object({
	id: z.number(),
	name: z.string(),
	pokemon: z.array(
		z.object({
			pokemon: z.object({
				name: z.string(),
				url: z.string()
			})
		})
	)
});

export const BerrySchema = z.object({
	id: z.number(),
	name: z.string(),
	firmness: z.object({
		name: z.string()
	}),
	flavors: z.array(
		z.object({
			flavor: z.object({
				name: z.string()
			}),
			potency: z.number()
		})
	),
	growth_time: z.number(),
	size: z.number()
});

export const BerryListSchema = z.object({
	count: z.number(),
	next: z.string().nullable(),
	previous: z.string().nullable(),
	results: z.array(
		z.object({
			name: z.string(),
			url: z.string()
		})
	)
});

export type Pokemon = z.infer<typeof PokemonSchema>;
export type Species = z.infer<typeof SpeciesSchema>;
export type EvolutionChain = z.infer<typeof EvolutionChainSchema>;
export type Generation = z.infer<typeof GenerationSchema>;
export type Type = z.infer<typeof TypeSchema>;
export type Berry = z.infer<typeof BerrySchema>;
