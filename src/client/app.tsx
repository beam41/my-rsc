import React, { Suspense } from 'react'
import { SimpleRouter } from './components/SimpleRouter'
import BaseLayout from './components/BaseLayout'

const routes = [
  {
    path: '/',
    element: (
      <BaseLayout>
        <div> dadadad </div>
      </BaseLayout>
    ),
  },
  {
    path: '/page1',
    element: (
      <BaseLayout>
        <Suspense fallback={'loading'}>
          {/* @ts-expect-error Async Component */}
          <Test />
        </Suspense>
      </BaseLayout>
    ),
  },
]

export default function App() {
  return (
    <React.StrictMode>
      <SimpleRouter routes={routes} page404={<BaseLayout>404</BaseLayout>} />
    </React.StrictMode>
  )
}

async function Test() {
  const testdata = await new Promise<string>((resolve) =>
    setTimeout(() => resolve('hiiii'), 1000),
  )

  return testdata
}
