const NftAbi = [
    "function mint(address to) external returns(uint256)"
]

const TokenAbi = [
    "function symbol() public view virtual"
]

const TokenBankAbi = [
    "function mint(address to) external returns(uint256)",
    "function deposit(uint256 amount) external",
    "function withdraw() external onlyOwner",
    "function getUserBalance(address userAddr) external view returns(uint256)"
]

const NftMarketAbi = [
    "function listNFT(uint256 tokenId, uint256 price) external",
    "function buyNFT(uint256 tokenId, uint256 amount) external",
]

export {
    NftAbi,
    TokenBankAbi,
    NftMarketAbi,
    TokenAbi
}