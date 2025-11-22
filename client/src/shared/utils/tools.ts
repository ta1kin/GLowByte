import { GLOBAL_ANIME_MS, GLOBAL_ANIME_S } from '@/shared/config/ui';


export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export async function fadeOutPreloader(start: number): Promise<void> {
    const elapsed = performance.now() - start
    const remainingDelay = Math.max(0, GLOBAL_ANIME_MS - elapsed)

    if (remainingDelay > 0) await delay(remainingDelay)

	const preloaderHtml = document.getElementById('preloader')
	const rootHtml = document.getElementById('root')

	if (preloaderHtml && rootHtml) {
		preloaderHtml.style.animation = `fade-out ${GLOBAL_ANIME_S}s ease-in-out forwards`

		await delay(GLOBAL_ANIME_MS)

		preloaderHtml.style.display = 'none'
        rootHtml.style.display = 'block'

		setTimeout(() => rootHtml.style.animation = `fade-in ${GLOBAL_ANIME_S}s ease-in-out forwards`, 0)
        setTimeout(() => preloaderHtml.style.display = 'none', GLOBAL_ANIME_MS)
	}
}
