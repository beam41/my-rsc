'use client'

import { useState } from 'react'
import TextBox from './formItem/TextBox'

export default function Form() {
  const [name, setName] = useState('name')
  const [lastName, setLastName] = useState('lastName')

  const handleName = (name: string) => {
    setName(name)
  }

  const handleLastName = (lastName: string) => {
    setLastName(lastName)
  }

  const handleSubmitClick = () => {
    alert(name + ' ' + lastName)
  }

  return (
    <div>
      Name: <TextBox onInput={handleName} />
      Last name: <TextBox onInput={handleLastName} />
      <button onClick={handleSubmitClick} type="button">
        Submit
      </button>
    </div>
  )
}
