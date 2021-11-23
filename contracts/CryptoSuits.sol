//
// Halloweeners
// For the spooks.
//
// 6,666 Halloween NFTs
// https://halloweeners.art
//
// Twitter: https://twitter.com/mystoners
//
// Produced by:     @sircryptos
// Art by:          @linedetail
// Code by:         @altcryp
//
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

contract CryptoSuits is ERC721Burnable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // On-Chain Storage
    string public imageTx = '';
    string public metadataTx = '';
    string public baseUri;

    // Sales
    bool public startSale;
    uint256 public price = 20000000000000000; //0.02 ETH
    uint public constant maxPurchase = 20;
    uint public constant maxSupply = 10000;

    // Internals
    event Minted(address minter, address receiver, uint256 tokenId);
    event SaleChanged(bool saleState);

    // Constructor
    constructor() ERC721("CryptoSuit", "CRYPTOSUIT") {}

    /*
    *   Getters.
    */
    function getCurrentId() public view returns(uint256) {
        return _tokenIds.current();
    }

    function exists(uint256 tokenId) public view returns(bool) {
        return _exists(tokenId);
    }

    function saleStarted() public view returns (bool) {
        return startSale;
    }

    /**
    *   Public functions for minting and enforcing requirements.
    */

    function mint(uint numberOfTokens) public payable {
        mint(numberOfTokens, msg.sender);
    }

    function mint(uint numberOfTokens, address owner) public payable {
        require(saleStarted(), "Wait for the sale to start!");
        require(numberOfTokens <= maxPurchase, "Maximum 20!");
        require(_tokenIds.current().add(numberOfTokens) <= maxSupply, "Exceeding max supply!");
        require(price.mul(numberOfTokens) <= msg.value, "Dont fuck around.");

        for(uint i = 0; i < numberOfTokens; i++) {
            _tokenIds.increment();
            _safeMint(owner, _tokenIds.current());
            emit Minted(msg.sender, owner, _tokenIds.current());
        }
    }

    /**
    *   External function for getting all tokens by a specific owner.
    */
    function getByOwner(address _owner) view public returns(uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalTokens = _tokenIds.current();
            uint256 resultIndex = 0;
            for (uint256 t = 1; t <= totalTokens; t++) {
                if (_exists(t) && ownerOf(t) == _owner) {
                    result[resultIndex] = t;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    /*
    *   Owner setters.
    */
    function setBaseUri(string memory _baseUri) public onlyOwner {
        baseUri = _baseUri;
    }

    function setSaleStart(bool _startSale) public onlyOwner {
        startSale = _startSale;
        emit SaleChanged(startSale);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    function setProvenance(string memory _imageTx, string memory _metadataTx) public onlyOwner {
        imageTx = _imageTx;
        metadataTx = _metadataTx;
    }

    /*
    *   Money management.
    */
    function withdraw() public payable onlyOwner {
        uint256 _each = address(this).balance / 3;
        require(payable(0x00796e910Bd0228ddF4cd79e3f353871a61C351C).send(_each));   // sara  @altcryp
        require(payable(0x7fc55376D5A29e0Ee86C18C81bb2fC8F9f490E50).send(_each));   // shaun @sircryptos
        require(payable(0xB58Fb5372e9Aa0C86c3B281179c05Af3bB7a181b).send(_each));   // mark  @linedetail
    }

    function forwardERC20s(IERC20 _token, uint256 _amount) public onlyOwner {
        _token.transfer(msg.sender, _amount);
    }

    /*
    *   On chain storage.
    */
    function uploadImages(bytes calldata s) external onlyOwner {}
    function uploadAttributes(bytes calldata s) external onlyOwner {}

    /*
    *   Overrides
    */
    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    receive () external payable virtual {}
}
