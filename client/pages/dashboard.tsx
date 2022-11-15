import React from 'react'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Network, Alchemy } from "alchemy-sdk";
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, FormControl, FormHelperText, FormLabel, Grid, GridItem, Heading, Image, Input, Skeleton, Text } from "@chakra-ui/react";
import { ftruncate } from 'fs';



const settings = {
  apiKey: "k9iWJhoaNMIMiRFeKDkAdshRy4cdKOdb", // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

export const getStaticProps = async () => {
const nftsForOwner = await alchemy.nft.getNftsForOwner("shinobi242.eth");
    const allNft = JSON.parse(JSON.stringify(nftsForOwner));
  return {
    props: {
      allNft
    }
  }

}

const dashboard = ({allNft}: any) => {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState<boolean>(false);

   useEffect(() => {
       setMounted(true);
   }, []);
   if(!mounted) {
     return null
   }

  console.log(allNft.ownedNfts
)
  console.log(allNft.totalCount)

  const myNft = allNft.ownedNfts;

  return (
    <div>
      {isConnected &&  
      <Box padding={{ base: "1", md: "1" }} maxWidth="4xl" marginX="4">
      <Grid gap="6" templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} marginTop="8">
                {myNft.map((nft: any) => {
                    {/* const nftStatus = getNftStatus(signerAddr, nft); */}
                    return ( 
                        <GridItem key={nft.tokenId} as="figure" width="full" wordBreak="break-word" display="flex" flexDirection="column">
                            <Image alt={`${"placeholder"} NFT - ${"placeholder"}`} src={nft.rawMetadata.image} width="full" fallback={<Skeleton width="full" height="20rem" />} />
                            <Box padding="4" backgroundColor="white" flexGrow="1">
                                <Heading as="figcaption" color="black">{nft.title}</Heading>
                                <Text color="blackAlpha.500" fontWeight="700" fontSize="sm" fontStyle="italic">Address: {nft.contract.address}</Text>
                                <Text color="black" marginTop="2">{nft.description}</Text>
                            </Box>
                            {/* <Button borderRadius={0} width="full" colorScheme="brand" disabled={(nftStatus === NftStatus.OWN_NOT_FOR_SALE || nftStatus === NftStatus.OWN_FOR_SALE) ? false : (nftStatus === NftStatus.NOT_OWN_NOT_FOR_SALE ? true : (BigNumber.from(nft.tokenId).eq(nftSelected?.tokenId ?? "-1") && (progressBuy || progressCancel || progressSale)))} onClick={async () => {
                                setNftSelected(nft);
                                switch (nftStatus) {
                                    case NftStatus.OWN_FOR_SALE:
                                        await cancelSaleNft(nft.tokenId);
                                        break;
                                    case NftStatus.OWN_NOT_FOR_SALE:
                                        setPutNftForSaleDialogVisible(true);
                                        break;
                                    case NftStatus.NOT_OWN_FOR_SALE:
                                        await buyNft(nft.tokenId);
                                        break;
                                }
                            }} isLoading={BigNumber.from(nft.tokenId).eq(nftSelected?.tokenId ?? "-1") && (progressBuy || progressCancel || progressSale)}>
                                {nftStatus === NftStatus.OWN_FOR_SALE ? "Cancel" : (nftStatus === NftStatus.OWN_NOT_FOR_SALE ? "Sell" : "Buy")}
                            </Button> */}
                            {/* <Text width="full" padding="2" textAlign="center" backgroundColor={nftStatus === NftStatus.NOT_OWN_NOT_FOR_SALE ? "gray.500" : (nftStatus === NftStatus.OWN_FOR_SALE ? "green.500" : "blue.400")} color="white">
                                {nftStatus === NftStatus.OWN_FOR_SALE ? "Owned; listed for sale" : (nftStatus === NftStatus.OWN_NOT_FOR_SALE ? "Owned; not for sale" : (nftStatus === NftStatus.NOT_OWN_FOR_SALE ? "On sale" : "Not for sale"))}
                                {(nftStatus === NftStatus.OWN_FOR_SALE || nftStatus === NftStatus.NOT_OWN_FOR_SALE) && ` - ${ethers.utils.formatEther(nft.tokenPrice)} MATIC`}
                            </Text> */}
                        </GridItem>
                     ) 
                 })} 
            </Grid>
      </Box>}
    </div>
  )
}

export default dashboard