// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library ChainLinkPriceConverter {
    function getExchangeRate(AggregatorV3Interface priceFeedAddress)
        internal
        view
        returns (uint256)
    {
        (, int256 price, , , ) = priceFeedAddress.latestRoundData();
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeedAddress
    ) internal view returns (uint256) {
        uint256 ethExchangeRate = getExchangeRate(priceFeedAddress);
        uint256 ethConvertedPrice = (ethExchangeRate * ethAmount);
        return (ethConvertedPrice / 1e18);
    }
}
