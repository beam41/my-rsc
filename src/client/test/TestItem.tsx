export default async function Test() {
  const test = await new Promise<string>((resolve) =>
    setTimeout(() => resolve('test inn'), 1000),
  )

  return (
    <>
      <p>{test}</p>
    </>
  )
}
