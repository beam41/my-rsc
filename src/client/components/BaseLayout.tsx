import { ReactNode } from 'react'
import Navbar from './Navbar'

type Props = {
  children: ReactNode
}

export default function BaseLayout({ children }: Props) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
