// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LeadToken.sol";
import "./ChainLinkPriceConverter.sol";

//**Error codes */
error Crowdsale_NotEnoughEthPaid();
error Crowdsale_LeadTokenIsNotForSale();
error Crowdsale_SaleIsNotOpen();
error Crowdsale_SaleIsStillOpen();
error Crowdsale_SaleIsClosed();
error Crowdsale_RedeemUnAvailable();
error Crowdsale_CannotTransferFunds();

//This contract is no longer part of openzeppelin but this is a forked version found in internet.
/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale,
 * allowing investors to purchase tokens with ether. This contract implements
 * such functionality in its most fundamental form and can be extended to provide additional
 * functionality and/or custom behavior.
 * The external interface represents the basic interface for purchasing tokens, and conform
 * the base architecture for crowdsales. They are *not* intended to be modified / overriden.
 * The internal interface conforms the extensible and modifiable surface of crowdsales. Override
 * the methods to add functionality. Consider using 'super' where appropiate to concatenate
 * behavior.
 */
contract Crowdsale is Ownable {
    using ChainLinkPriceConverter for uint256;
    // The token being sold
    LeadToken public token;

    // Address where funds are collected
    address payable public wallet;

    // How many token units a buyer gets per wei.
    uint256 public rate;

    //This number indicates if the crowdsale is sucess or failed.
    uint256 internal TARGET_USD_TO_BE_RAISED;

    uint256 public constant MINIMUM_USD = 100 * 1e18;

    bool internal crowdSaleSuccess;

    uint256 public openingTime;
    uint256 public closingTime;

    /***
     * Throw if crowdsale state is not open
     */
    modifier onlyWhenOpen() {
        CrowdSaleState currentState = getCrowdSaleState();
        if (currentState == CrowdSaleState.NOTSTARTED) {
            revert Crowdsale_SaleIsNotOpen();
        } else if (currentState == CrowdSaleState.CLOSED) {
            revert Crowdsale_SaleIsClosed();
        }
        _;
    }

    /**
     * Throw if crowdsale state is not closed
     */
    modifier onlyWhenClosed() {
        CrowdSaleState currentState = getCrowdSaleState();
        if (currentState == CrowdSaleState.NOTSTARTED) {
            revert Crowdsale_SaleIsNotOpen();
        } else if (currentState == CrowdSaleState.OPEN) {
            revert Crowdsale_SaleIsStillOpen();
        }
        _;
    }

    /**
     * Throw if crowdsale is successfull
     */
    modifier onlyWhenFailed() {
        if (crowdSaleSuccess) {
            revert Crowdsale_RedeemUnAvailable();
        }
        _;
    }

    /**
     * Throw if crowdsale is not successfull
     */
    modifier onlyWhenSuccess() {
        if (!crowdSaleSuccess) {
            revert Crowdsale_CannotTransferFunds();
        }
        _;
    }

    enum CrowdSaleState {
        NOTSTARTED,
        OPEN,
        CLOSED
    }

    /**
     * This mapping returns the amount of funds that address can redeem.
     */
    mapping(address => uint256) private addressToRedeemFunds;

    /**
     * This mapping returns the amount of tokens that address can redeem.
     */
    mapping(address => uint256) private addressToRedeemTokens;

    // Amount of wei raised
    uint256 public weiRaised;

    //Price feed address
    AggregatorV3Interface private chainLinkPriceFeedAddress;

    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokenPurchase(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );

    /**
     * @param _rate Number of token units a buyer gets per wei
     * @param _wallet Address where collected funds will be forwarded to
     * @param _token Address of the token being sold
     */
    constructor(
        address _chainLinkPriceFeedAddress,
        uint256 _rate,
        address payable _wallet,
        LeadToken _token,
        uint256 targetUSDToRaise,
        uint256 _openingTime,
        uint256 _closingTime
    ) {
        require(_openingTime >= block.timestamp);
        require(_closingTime >= _openingTime);
        openingTime = _openingTime;
        closingTime = _closingTime;
        require(_rate > 0, "Crowdsale: Coin rate must be greater than 0!");
        require(_wallet != address(0), "Crowdsale: Invalid wallet address!");

        chainLinkPriceFeedAddress = AggregatorV3Interface(
            _chainLinkPriceFeedAddress
        );
        rate = _rate;
        wallet = _wallet;
        token = _token;
        TARGET_USD_TO_BE_RAISED = targetUSDToRaise;
    }

    //automatically be executed and performs buyToken operation.
    /**
     * @dev fallback function ***DO NOT OVERRIDE***
     */
    fallback() external payable {
        buyTokens(msg.sender);
    }

    receive() external payable {
        /**TODO: How to handle this?/** */
    }

    modifier buyValidation() {
        if (
            msg.value.getConversionRate(chainLinkPriceFeedAddress) < MINIMUM_USD
        ) {
            revert Crowdsale_NotEnoughEthPaid();
        }
        _;
    }

    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     * @param _beneficiary Address performing the token purchase
     */
    function buyTokens(address _beneficiary) public payable onlyWhenOpen {
        uint256 weiAmount = msg.value;

        _preValidatePurchase(_beneficiary);

        uint256 noOfTokensBuyerGets = _getTokenAmount(weiAmount);

        _updatePurchasingState(_beneficiary, weiAmount, noOfTokensBuyerGets);
        _deliverTokens(_beneficiary, noOfTokensBuyerGets);
        emit TokenPurchase(
            msg.sender,
            _beneficiary,
            weiAmount,
            noOfTokensBuyerGets
        );
    }

    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met. Use super to concatenate validations.
     * @param _beneficiary Address performing the token purchase
     */
    function _preValidatePurchase(address _beneficiary) internal buyValidation {
        require(_beneficiary != address(0), "Invalid beneficiary address.");
    }

    function _postValidatePurchase() internal {}

    /**
     * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends its tokens.
     * @param _beneficiary Address performing the token purchase
     * @param _tokenAmount Number of tokens to be emitted
     */
    function _deliverTokens(address _beneficiary, uint256 _tokenAmount)
        internal
    {
        token.mint(_beneficiary, _tokenAmount);
    }

    /**
     * @dev Override for extensions that require an internal state to check for validity (current user contributions, etc.)
     * @param _beneficiary Address receiving the tokens
     * @param _tokens quantity _beneficiary will receive
     * @param _weiAmount Value in wei involved in the purchase
     */
    function _updatePurchasingState(
        address _beneficiary,
        uint256 _tokens,
        uint256 _weiAmount
    ) internal {
        // update state
        weiRaised += _weiAmount;
        addressToRedeemFunds[_beneficiary] += _weiAmount;
        addressToRedeemTokens[_beneficiary] += _tokens;
    }

    /**
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param _weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 _weiAmount)
        internal
        view
        returns (uint256)
    {
        return _weiAmount * rate;
    }

    function redeemFunds() public payable onlyWhenFailed {
        uint256 amount = addressToRedeemFunds[msg.sender];
        require(amount <= 0, "Unauthorized request!");

        (bool callSuccess, ) = payable(msg.sender).call{value: amount}("");
        require(callSuccess, "Redeem failed.");
    }

    function calculateCrowdSaleResult() external onlyOwner onlyWhenClosed {
        if (weiRaised < (TARGET_USD_TO_BE_RAISED * 1e18)) {
            crowdSaleSuccess = false;
        } else if (weiRaised >= (TARGET_USD_TO_BE_RAISED * 1e18)) {
            crowdSaleSuccess = true;
            token.unpause();
        }
    }

    function getResult() public view returns (bool) {
        return crowdSaleSuccess;
    }

    function transferAmountToWallet() external onlyOwner onlyWhenSuccess {
        (bool callSuccess, ) = wallet.call{value: weiRaised}("");
        require(callSuccess, "Transfer failed.");
    }

    function getCrowdSaleState() public view returns (CrowdSaleState) {
        if (block.timestamp >= openingTime && block.timestamp <= closingTime) {
            return CrowdSaleState.OPEN;
        } else if (block.timestamp > closingTime) {
            return CrowdSaleState.CLOSED;
        } else {
            return CrowdSaleState.NOTSTARTED;
        }
    }
}
