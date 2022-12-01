//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    // Type declaration
    using PriceConverter for uint256;

    // State  variables
    // This minimum earnest is a general earnest fee that is set as a condition
    uint256 public constant MINIMUM_EARNEST = 1500 * 1e18;
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;
    AggregatorV3Interface public priceFeed;

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    // This escrow amount is set for individual nfts and not the same as the minimum earnest
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;

    constructor(
        address _priceFeedAddress,
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller {
        // Transfer NFT from seller to this contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    // Put Under Contract (only buyer - payable escrow)
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(
            msg.value.getConversionRate(priceFeed) >= escrowAmount[_nftID] &&
                msg.value.getConversionRate(priceFeed) >= MINIMUM_EARNEST,
            "Your deposit is insufficient!"
        );
    }

    // Update Inspection Status (only inspector)
    function updateInspectionStatus(uint256 _nftID, bool _passed) public onlyInspector {
        inspectionPassed[_nftID] = _passed;
    }

    // Approve Sale
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    // Finalize Sale
    // -> Require inspection status (add more items here, like appraisal)
    // -> Require sale to be authorized
    // -> Require funds to be correct amount
    // -> Transfer NFT to buyer
    // -> Transfer Funds to Seller
    function finalizeSale(uint256 _nftID) public {
        require(inspectionPassed[_nftID]);
        require(approval[_nftID][buyer[_nftID]]);
        require(approval[_nftID][seller]);
        require(approval[_nftID][lender]);
        require(address(this).balance >= purchasePrice[_nftID]);

        isListed[_nftID] = false;

        (bool success, ) = payable(seller).call{value: address(this).balance}("");
        require(success);

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
    }

    // Cancel Sale (handle earnest deposit)
    // -> if inspection status is not approved, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        if (inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getEscrowAmount(uint256 _nftID) public view returns (uint256) {
        return escrowAmount[_nftID];
    }

    function getInspectionPassed(uint256 _nftID) public view returns (bool) {
        return inspectionPassed[_nftID];
    }

    function getApproval(uint256 _nftID) public view returns (bool) {
        return approval[_nftID][msg.sender];
    }

    function getIsListed(uint256 _nftID) public view returns (bool) {
        return isListed[_nftID];
    }

    function getPurchasePrice(uint256 _nftID) public view returns (uint256) {
        return purchasePrice[_nftID];
    }

    function getMinimumEarnest() public pure returns (uint256) {
        return MINIMUM_EARNEST;
    }

    function getNftAddress() public view returns (address) {
        return nftAddress;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
