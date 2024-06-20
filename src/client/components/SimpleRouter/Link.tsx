'use client'

import { MouseEventHandler, ReactNode } from 'react'
import { useHistory } from './SimpleRouter'
import styled from 'styled-components'

type Props = {
  children: ReactNode
  href: string
}

export default function Link({ children, href }: Props) {
  const history = useHistory()

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault()
    history.pushState({}, href)
  }

  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  )
}
