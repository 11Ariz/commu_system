import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { UserProvider } from '../contexts/UserContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Academic Collab Platform</title>
      </Head>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </>
  )
}
