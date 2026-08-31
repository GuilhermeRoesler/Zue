/** Tempo sem interação antes da hibernação (2 s em DEV, 2 min em produção). */
export const IDLE_TIMEOUT_MS = import.meta.env.DEV ? 60 * 1000 : 60 * 1000;

/** Duração fixa de cada slide de imagem no catálogo (5 s). */
export const IMAGE_SLIDE_MS = 5000;
