package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

// Wallet represents a user's wallet
type Wallet struct {
	PrivateKey *ecdsa.PrivateKey
	PublicKey  []byte
}

// CreateWallet generates a new wallet with ECDSA keys
func CreateWallet() *Wallet {
	private, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		fmt.Println(err)
		return nil
	}
	public := append(private.PublicKey.X.Bytes(), private.PublicKey.Y.Bytes()...)
	return &Wallet{private, public}
}

// GetAddress returns the hex representation of the public key
func (w *Wallet) GetAddress() string {
	return hex.EncodeToString(w.PublicKey)
}

// Sign signs data with the wallet's private key
func (w *Wallet) Sign(data []byte) (string, error) {
	r, s, err := ecdsa.Sign(rand.Reader, w.PrivateKey, data)
	if err != nil {
		return "", err
	}
	signature := append(r.Bytes(), s.Bytes()...)
	return hex.EncodeToString(signature), nil
}

// TODO: Implement SaveToFile and LoadWallet using gob encoding or similar
// For now, we regenerate wallets in memory for the demo.
