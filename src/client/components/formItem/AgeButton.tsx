'use client'

import { useState } from 'react'

export default function AgeButton() {
  const [number_, setNumber] = useState(0)

  return (
    <>
      <button onClick={() => setNumber((n) => n + 1)}>Add</button>
      {number_}
      <button onClick={() => setNumber((n) => n - 1)}>Remove</button>
    </>
  )
}
