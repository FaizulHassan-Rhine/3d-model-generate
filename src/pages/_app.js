import "@/styles/globals.css";
import { UploadProvider } from '@/context/UploadContext'
export default function App({ Component, pageProps }) {
  return(
  <UploadProvider>
    <Component {...pageProps} />
  </UploadProvider>)
}
