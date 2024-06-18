import { Suspense } from 'react'
import Button from './Button'

export default function App() {
  return (
    <>
      <h1>Hellowwww</h1>
      <Suspense fallback={<p>Loading....</p>}>
        {/* @ts-expect-error Async Server Component */}
        <Test />
        <Button />
      </Suspense>
    </>
  )
}

async function Test() {
  const test = await new Promise<string>((resolve) =>
    setTimeout(() => resolve('test in'), 1000),
  )

  return <p>{test}</p>
}
