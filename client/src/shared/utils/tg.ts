import {
	closingBehavior,
	init,
	initData,
	isTMA,
	swipeBehavior,
	viewport,
} from '@telegram-apps/sdk-react'


export async function initTg(): Promise<void> {
	if (!(await isTMA())) return

	try {
		await init()
	} catch {}

	initData.restore()

	if (closingBehavior.mount.isAvailable()) {
		closingBehavior.mount()
	}

	if (closingBehavior.enableConfirmation.isAvailable()) {
		closingBehavior.enableConfirmation()
	}

	if (viewport.mount.isAvailable()) {
		const mountPromise = viewport.mount({ timeout: 3000 })

		await mountPromise.catch(() => {})
	}

	if (swipeBehavior.mount.isAvailable()) {
		await swipeBehavior.mount()

		if (swipeBehavior.isMounted()) {
			swipeBehavior.disableVertical()
			swipeBehavior.isVerticalEnabled()
		}
	}
}
