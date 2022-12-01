//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./lib/GenesisUtils.sol";
import "./interfaces/ICircuitValidator.sol";
import "./verifiers/ZKPVerifier.sol";

// Main Contract for the
contract RealEstateVerifier is ERC721URIStorage, ZKPVerifier {
    // Variables
    uint64 public constant TRANSFER_REQUEST_ID = 1;
    string private erc721Name;
    string private erc721Symbol;
    mapping(uint256 => address) public idToAddress;
    mapping(address => uint256) public addressToId;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event CreatedNFT(uint256 indexed tokenId, uint64 requestId);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        erc721Name = name_;
        erc721Symbol = symbol_;
    }

    /**
     * @dev _beforeProofSubmit
     */
    function _beforeProofSubmit(
        uint64 /* requestId */,
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal view override {
        // check that challenge input of the proof is equal to the msg.sender
        address addr = GenesisUtils.int256ToAddress(inputs[validator.getChallengeInputIndex()]);
        require(_msgSender() == addr, "address in proof is not a sender address");
    }

    /**
     * @dev _afterProofSubmit
     */
    function _afterProofSubmit(
        uint64 requestId,
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal override {
        require(
            requestId == TRANSFER_REQUEST_ID && addressToId[_msgSender()] == 0,
            "proof can not be submitted more than once"
        );

        uint256 id = inputs[validator.getChallengeInputIndex()];
        // execute the mint
        if (idToAddress[id] == address(0)) {
            // _tokenIds.increment();

            // uint256 newItemId = _tokenIds.current();
            // _mint(_msgSender(), newItemId);
            // _setTokenURI(newItemId, tokenURI);
            uint256 newItemId = _tokenIds.current();
            _tokenIds.increment();
            _safeMint(_msgSender(), newItemId);
            addressToId[_msgSender()] = id;
            idToAddress[id] = _msgSender();

            emit CreatedNFT(newItemId, TRANSFER_REQUEST_ID);

            // return newItemId;
        }
    }

    // function mint(string memory tokenURI) public returns (uint256) {
    //     _tokenIds.increment();

    //     uint256 newItemId = _tokenIds.current();
    //     _mint(msg.sender, newItemId);
    //     _setTokenURI(newItemId, tokenURI);

    //     return newItemId;
    // }

    function _beforeTransfer(uint256 /* amount */) internal view /* override */ {
        require(
            proofs[_msgSender()][TRANSFER_REQUEST_ID] == true,
            "only identities who provided proof are alllowed to create/mint new NFTs"
        );
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
