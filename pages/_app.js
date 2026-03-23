import '../styles/globals.css'
import Head from 'next/head'

const LOGO_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' rx='10' fill='%230f4c81'/><circle cx='20' cy='24' r='7' fill='white' opacity='0.95'/><circle cx='13' cy='17' r='3.5' fill='white' opacity='0.95'/><circle cx='20' cy='14' r='3.5' fill='white' opacity='0.95'/><circle cx='27' cy='17' r='3.5' fill='white' opacity='0.95'/><rect x='18.5' y='21' width='3' height='6' rx='1' fill='%230f4c81'/><rect x='17' y='22.5' width='6' height='3' rx='1' fill='%230f4c81'/></svg>`;

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>VetMD AI — Veterinary Clinical Intelligence</title>
        <meta name="description" content="Evidence-based veterinary triage powered by AI and peer-reviewed research" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href={`data:image/svg+xml,${LOGO_SVG}`} />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
