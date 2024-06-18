import { Suspense } from 'react'
import TestItem from './test/TestItem'
import Form from './components/Form'

export default function App() {
  return (
    <>
      <h1>Hellowwww</h1>
      <Suspense fallback={<p>Loading....</p>}>
        {/* @ts-expect-error Async Server Component */}
        <TestItem />
      </Suspense>
      <Form />
    </>
  )
}
