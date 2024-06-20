'use client'

import {
  useMemo,
  useState,
  ReactNode,
  createContext,
  useContext,
  useTransition,
} from 'react'

type Route = {
  path: string
  element: ReactNode
}

type Props = {
  routes: Route[]
  page404: ReactNode
}

type History = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pushState: (data: any, url: string | URL | null | undefined) => void
}

const HistoryContext = createContext<History>({
  pushState: () => {},
})

export default function SimpleRouter({ routes, page404 }: Props) {
  const [pathname, setPathname] = useState<string>(window.location.pathname)
  const [_, startTransition] = useTransition()

  const element = useMemo(() => {
    return routes.find((route) => pathname === route.path)?.element ?? page404
  }, [routes, pathname])

  const pushState: History['pushState'] = (data, url) => {
    history.pushState(data, '', url)
    startTransition(() => {
      setPathname(window.location.pathname)
    })
  }

  return (
    <HistoryContext.Provider value={{ pushState }}>
      {element}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  return useContext(HistoryContext)
}
