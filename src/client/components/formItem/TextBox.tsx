'use client'

import { useState } from 'react'

type Props = {
  onInput: (event: string) => void
}

export default function TextBox({ onInput }: Props) {
  const [value, setValue] = useState('')

  const handleInput: React.FormEventHandler<HTMLInputElement> = (event) => {
    setValue((event.target as HTMLInputElement).value)
    onInput((event.target as HTMLInputElement).value)
  }

  return <input onInput={handleInput} value={value}></input>
}
