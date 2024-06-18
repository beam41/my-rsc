'use client'

import { useState } from 'react'

export default function Button() {
  const [number_, setNumber] = useState(0)

  return <button onClick={() => setNumber((n) => n + 1)}>{number_}</button>
}
