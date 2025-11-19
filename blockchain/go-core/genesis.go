package main

import (
	"math/big"
)

// Decimals is the number of decimal places for the coin
const Decimals = 18

// CoinName is the name of the coin
const CoinName = "Vuser Open Coin"

// CoinSymbol is the symbol of the coin
const CoinSymbol = "VOC"

// TotalSupply is the total supply of coins in the genesis block
// 10^80 coins * 10^18 (decimals) = 10^98 base units
var TotalSupply *big.Int

func init() {
	// Initialize TotalSupply to 10^98
	TotalSupply = new(big.Int)
	base := big.NewInt(10)
	exponent := big.NewInt(80 + 18)
	TotalSupply.Exp(base, exponent, nil)
}
