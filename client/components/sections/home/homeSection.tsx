import { Box, Button, Flex, Heading, Image, Text } from "@chakra-ui/react"
import HighlightedText from "../../highlightedText";
import Link from "next/link";
import { ZoraCollection } from "../../../types/general";


interface Home {
    allNft: ZoraCollection
}


export default function HomeSection({allNft}: Home) {
    return (
        <Box as="main" padding={{ base: "4", md: "8" }} maxWidth="5xl" marginX="auto">
            {/* Heading */}
            <Heading textAlign="center" size="4xl" marginTop="8">LEAD MARKETPLACE</Heading>
            <Text textAlign="center" marginTop="2">Your one-stop marketplace to <HighlightedText>mint, list, buy and sell NFT collections</HighlightedText>.</Text>

            {/* NFT collections for display */}
            <Flex flexWrap="nowrap" width="full" marginTop="10" gap="4" overflowX="auto">
                {/* {allNftCollections.slice(0, 3).map((nftCollection, index) => ( */}
                    <Box key={1} width={{ base: "60%", md: "33%" }} minWidth="64" backgroundColor="white">
                        <Link legacyBehavior passHref href={`/collections/${allNft.address}`}><a>
                            <Image alt={`${allNft.name} NFT Collection - ${allNft.description}`} src={"https://img.seadn.io/files/736ffa7c3e8ba58917d325774dc55f53.png?fit=max&w=1000"} width="full" />
                            <Box padding="4">
                                <Heading color="black">{allNft.name}</Heading>
                                <Text color="black">{allNft.description}</Text>
                            </Box>
                        </a></Link>
                    </Box>
                {/* ))} */}
            </Flex>

            {/* CTA - Create collection */}
            <Heading textAlign="center" marginTop="8">
                These are just some NFT collections created here. <HighlightedText usedFor="heading">Create yours today!</HighlightedText>
            </Heading>
            <Link legacyBehavior passHref href="/create"><a>
                {/* <Button marginX="auto" marginTop="4" width="33%" colorScheme="brand" fontWeight="600" rightIcon={<CreateIcon size="18" />} display="flex" alignItems="center">Create</Button> */}
            </a></Link>
        </Box >
    )
}