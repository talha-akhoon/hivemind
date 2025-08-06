import {
  Client,
  TokenCreateTransaction,
  TokenMintTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  Hbar,
  PrivateKey
} from "@hashgraph/sdk"

const accountId = process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID as string
const privateKey = PrivateKey.fromString(process.env.NEXT_HEDERA_PRIVATE_KEY as string)
const client = Client.forTestnet().setOperator(
    accountId,
    privateKey,
)

// 1. Create token when dataset is uploaded (no minting yet)
export async function createDatasetToken({ datasetId, title }) {
  const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName(`${title.substring(0, 20)} Access`)
      .setTokenSymbol("DATA")
      .setDecimals(0)
      .setInitialSupply(0) // Start with 0 tokens
      .setTokenMemo(`Access token for dataset: ${datasetId}`)
      .setTreasuryAccountId(accountId) // Platform owns treasury
      .setSupplyKey(privateKey.publicKey) // Platform can mint

  const tokenCreateSubmit = await tokenCreateTx.execute(client)
  const tokenCreateRx = await tokenCreateSubmit.getReceipt(client)

  return {
    tokenId: tokenCreateRx.tokenId.toString(),
    status: 'created'
  }
}

// 2. Purchase dataset - mint token to buyer, pay seller
export async function purchaseDatasetAccess({
                                              tokenId,
                                              buyerWallet,
                                              sellerWallet,
                                              priceHbar
                                            }) {
  try {
    // Step 1: Transfer HBAR from buyer to seller (95%) and platform (5%)
    const sellerAmount = Math.floor(priceHbar * 0.95)
    const platformFee = priceHbar - sellerAmount

    const paymentTx = new TransferTransaction()
        .addHbarTransfer(buyerWallet, new Hbar(-priceHbar))
        .addHbarTransfer(sellerWallet, new Hbar(sellerAmount))
        .addHbarTransfer(accountId, new Hbar(platformFee))

    const paymentSubmit = await paymentTx.execute(client)
    const paymentRx = await paymentSubmit.getReceipt(client)

    // Step 2: Mint 1 access token to buyer
    const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(1)

    const mintSubmit = await mintTx.execute(client)
    const mintRx = await mintSubmit.getReceipt(client)

    // Step 3: Transfer the minted token to buyer
    const transferTx = new TransferTransaction()
        .addTokenTransfer(tokenId, accountId, -1)
        .addTokenTransfer(tokenId, buyerWallet, 1)

    const transferSubmit = await transferTx.execute(client)
    const transferRx = await transferSubmit.getReceipt(client)

    return {
      success: true,
      paymentTxId: paymentRx.transactionId.toString(),
      tokenTxId: transferRx.transactionId.toString(),
      tokensReceived: 1
    }

  } catch (error) {
    console.error('Purchase failed:', error)
    throw error
  }
}

// 3. Check if user has access token
export async function verifyDatasetAccess(userWallet, tokenId) {
  try {
    const balance = await new AccountBalanceQuery()
        .setAccountId(userWallet)
        .execute(client)

    const tokenBalance = balance.tokens.get(tokenId)
    return tokenBalance && tokenBalance.toNumber() > 0
  } catch (error) {
    console.error('Access verification failed:', error)
    return false
  }
}