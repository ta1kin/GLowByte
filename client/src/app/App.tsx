import { type JSX, Suspense, lazy } from 'react'
import { MainProvider } from '@/app/provider'
import { fadeOutPreloader } from '@/shared/utils'


async function delayForLazy(promise: Promise<any>): Promise<any> {
  const start = performance.now()

  const [ jsxRes ] = await Promise.all([
    promise,
  ])

  await fadeOutPreloader(start)

  return jsxRes
}

const AppLazy = lazy(() => delayForLazy(import('@/app/routes/Main')));


function App(): JSX.Element {
  return (
    <Suspense>
      <MainProvider>
        <AppLazy />
      </MainProvider>
    </Suspense>
  )
}

export default App
