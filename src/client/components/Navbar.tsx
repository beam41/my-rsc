import Link from './SimpleRouter/Link'

export default function Navbar() {
  return (
    <>
      <Link href="/">Home</Link>
      <Link href="/page1">Page1</Link>
      <Link href="/not-exist">Not exist</Link>
    </>
  )
}
