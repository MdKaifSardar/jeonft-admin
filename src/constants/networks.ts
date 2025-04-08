export const ETHEREUM_MAINNET = {
  chainId: "0x1",
  name: "Ethereum Mainnet",
  symbol: "ETH",
  displayName: "Ethereum"
};

export const isEthereumMainnet = (chainId: string) => {
  return chainId.toLowerCase() === "0x1" || chainId === "1";
};
