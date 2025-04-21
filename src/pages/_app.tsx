import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  console.log("done");
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
