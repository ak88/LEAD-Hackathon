import '../styles/globals.css'
import theme from '../theme';
import type { AppProps } from 'next/app'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import AppBar from '../components/bars/appbar';
import { ChakraProvider } from '@chakra-ui/react'


export default function App({ Component, pageProps }: AppProps) {
  const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum],
  [
    alchemyProvider({ apiKey: "k9iWJhoaNMIMiRFeKDkAdshRy4cdKOdb" }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

return (
  <ChakraProvider theme={theme}>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <AppBar />
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  </ChakraProvider>
  );}
