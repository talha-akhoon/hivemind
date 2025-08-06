import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
    Client,
    TransferTransaction,
    TokenMintTransaction,
    TransactionId,
    Hbar,
    PrivateKey
} from "@hashgraph/sdk";
import { NextRequest, NextResponse } from 'next/server';
import { CreatePurchaseDto, PaymentVerification } from "@/lib/db/entities/purchase.entity";

const accountId = process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID as string;
const privateKey = PrivateKey.fromString(process.env.NEXT_HEDERA_PRIVATE_KEY as string);
const client = Client.forTestnet().setOperator(accountId, privateKey);

async function transferHbarToSeller(sellerWallet: string, amount: number) {
    try {
        const transferTx = new TransferTransaction()
            .addHbarTransfer(accountId, new Hbar(-amount))
            .addHbarTransfer(sellerWallet, new Hbar(amount));

        const transferSubmit = await transferTx.execute(client);
        await transferSubmit.getReceipt(client); // Wait for confirmation

        return { transactionId: transferSubmit.transactionId.toString() };
    } catch (error) {
        console.error('Failed to transfer HBAR to seller:', error);
        throw error;
    }
}

async function mintAndTransferToken(tokenId: string, buyerWallet: string) {
    try {
        // Mint 1 access token
        const mintTx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .setAmount(1);

        const mintSubmit = await mintTx.execute(client);
        await mintSubmit.getReceipt(client); // Wait for confirmation

        // Transfer the minted token to buyer
        const transferTx = new TransferTransaction()
            .addTokenTransfer(tokenId, accountId, -1)
            .addTokenTransfer(tokenId, buyerWallet, 1);

        const transferSubmit = await transferTx.execute(client);
        await transferSubmit.getReceipt(client); // Wait for confirmation

        return {
            mintRx: { transactionId: mintSubmit.transactionId.toString() },
            transferRx: { transactionId: transferSubmit.transactionId.toString() }
        };
    } catch (error) {
        console.error('Failed to mint and transfer token:', error);
        throw error;
    }
}

interface Dataset {
    id: string;
    price: string;
    owner_wallet: string;
    token_id: string;
}

interface Transfer {
    account: string;
    amount: string;
}

async function recordPurchase(
    dataset: Dataset,
    buyerWallet: string,
    paymentTxId: string,
    mintRx: { transactionId: string },
    transferRx: { transactionId: string },
    userId: string
): Promise<{ purchase: any; insertError: any }> {
    const supabase = await createSupabaseServerClient();

    const purchaseData: CreatePurchaseDto = {
        user_id: userId, // Now using the userId parameter
        dataset_id: dataset.id,
        buyer_wallet: buyerWallet,
        seller_wallet: dataset.owner_wallet,
        token_id: dataset.token_id,
        price_paid: parseFloat(dataset.price || '0'), // Convert string to number
        payment_tx_id: paymentTxId,
        mint_tx_id: mintRx.transactionId,
        transfer_tx_id: transferRx.transactionId,
        status: 'completed',
        metadata: {
            platform_fee: parseFloat(dataset.price || '0') * 0.05,
            seller_amount: parseFloat(dataset.price || '0') * 0.95,
            network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet'
        }
    };

    const { data: purchase, error: insertError } = await supabase
        .from('purchases')
        .insert(purchaseData)
        .select()
        .single();

    return {
        purchase,
        insertError
    };
}

async function verifyPaymentTransaction(
    paymentTxId: string,
    expectedAmount: number,
    buyerWallet: string
): Promise<PaymentVerification> {
    const verification: PaymentVerification = {
        isValid: false,
        transactionExists: false,
        amountMatches: false,
        recipientCorrect: false,
        isRecent: false,
        isUnused: false
    };

    try {
        // Parse transaction ID - handle both SDK format and Mirror Node format
        let formattedTxId = paymentTxId;

        // Convert Mirror Node format (0.0.6422477@1753915564.688173084) to SDK format
        if (paymentTxId.includes('@')) {
            console.log('paymentTxId is in Mirror Node format:', paymentTxId);
            const [accountId, timestamp] = paymentTxId.split('@');
            console.log('Parsing Mirror Node txId:', paymentTxId);
            const [seconds, nanoseconds] = timestamp.split('.');
            console.log('Parsing Mirror Node txId:', timestamp);
            formattedTxId = `${accountId}-${seconds}-${nanoseconds}`;
        }

        console.log('Original txId:', paymentTxId, 'Formatted txId:', formattedTxId);

        // Verify it's a valid transaction ID format
        TransactionId.fromString(paymentTxId);

        // Add a delay to allow Mirror Node to process the transaction
        console.log('Waiting 5 seconds for Mirror Node to process transaction...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Query Hedera Mirror Node API to get transaction details
        const mirrorNodeUrl = process.env.NEXT_PUBLIC_ENV === 'production'
            ? 'https://mainnet-public.mirrornode.hedera.com'
            : 'https://testnet.mirrornode.hedera.com';

        const apiUrl = `${mirrorNodeUrl}/api/v1/transactions/${formattedTxId}`;
        console.log('Attempting to fetch from:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; HiveMinds/1.0)',
            }
        });

        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response body:', errorText);
            verification.errorReason = `Transaction not found in Mirror Node (${response.status}: ${response.statusText})`;
            return verification;
        }

        verification.transactionExists = true;
        const transactionData = await response.json();
        const transaction = transactionData.transactions[0];

        // Check if transaction was successful
        if (transaction.result !== 'SUCCESS') {
            verification.errorReason = `Transaction was not successful: ${transaction.result}`;
            return verification;
        }

        // Check if the transaction is a transfer
        if (transaction.name !== 'CRYPTOTRANSFER') {
            verification.errorReason = 'Transaction is not a crypto transfer';
            return verification;
        }

        // Verify the transfers in the transaction
        const transfers = transaction.transfers;

        // Convert HBAR to tinybars (1 HBAR = 100,000,000 tinybars)
        // Use parseFloat to handle decimal HBAR amounts properly
        const expectedTinybars = Math.round(parseFloat(expectedAmount.toString()) * 100000000);

        // Check if platform received the payment (should be positive in platform transfer)
        const platformTransfer = transfers.find((t: Transfer) => t.account === accountId);
        if (platformTransfer) {
            const platformTinybars = parseInt(platformTransfer.amount);
            // Allow for small rounding differences (within 1 tinybar)
            if (Math.abs(platformTinybars - expectedTinybars) <= 1 && platformTinybars > 0) {
                verification.recipientCorrect = true;
                verification.amountMatches = true;
            } else {
                console.error('Platform transfer amount mismatch. Expected:', expectedTinybars, 'Got:', platformTinybars);
            }
        }

        // Check if transaction is recent (within last 24 hours)
        const transactionTimestamp = parseFloat(transaction.consensus_timestamp);
        const now = Date.now() / 1000;
        const maxAge = 24 * 60 * 60; // 24 hours in seconds

        if (now - transactionTimestamp <= maxAge) {
            verification.isRecent = true;
        }

        // Check if transaction hasn't been used before
        const supabase = await createSupabaseServerClient();
        const { data: existingPurchase } = await supabase
            .from('purchases')
            .select('id')
            .eq('payment_tx_id', paymentTxId)
            .single();

        if (!existingPurchase) {
            verification.isUnused = true;
        }

        // Set overall validity
        verification.isValid = verification.transactionExists &&
                             verification.amountMatches &&
                             verification.recipientCorrect &&
                             verification.isRecent &&
                             verification.isUnused;

        if (!verification.isValid && !verification.errorReason) {
            const failedChecks = [];
            if (!verification.amountMatches) failedChecks.push('amount mismatch');
            if (!verification.recipientCorrect) failedChecks.push('wrong recipient');
            if (!verification.isRecent) failedChecks.push('transaction too old');
            if (!verification.isUnused) failedChecks.push('transaction already used');
            verification.errorReason = `Verification failed: ${failedChecks.join(', ')}`;
        }

        return verification;

    } catch (error) {
        verification.errorReason = `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        return verification;
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { datasetId, buyerWallet, paymentTxId } = body;

        // Validate required fields
        if (!datasetId || !buyerWallet || !paymentTxId) {
            return NextResponse.json({
                error: 'Missing required fields: datasetId, buyerWallet, paymentTxId'
            }, { status: 400 });
        }

        const supabase = await createSupabaseServerClient();

        // Get authenticated user from session
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized - user must be logged in' }, { status: 401 });
        }
        console.log('datasetId', datasetId, 'buyerWallet', buyerWallet, 'paymentTxId', paymentTxId);
        // Get dataset info
        const { data: dataset, error: datasetError } = await supabase
            .from('dataset')
            .select('*')
            .eq('id', datasetId)
            .single();

        console.log('Dataset query result:', { dataset, datasetError, datasetId });

        if (datasetError) {
            console.error('Dataset query error:', datasetError);
            return NextResponse.json({
                error: 'Failed to fetch dataset',
                details: datasetError.message,
                datasetId
            }, { status: 500 });
        }

        if (!dataset) {
            return NextResponse.json({ error: 'Dataset not found', datasetId }, { status: 404 });
        }

        // Verify payment was received (check Hedera transaction)
        const verification = await verifyPaymentTransaction(
            paymentTxId,
            parseFloat(dataset.price || '0'), // Convert string to number
            buyerWallet
        );

        if (!verification.isValid) {
            return NextResponse.json({
                error: 'Payment verification failed',
                details: verification.errorReason,
                verification: {
                    transactionExists: verification.transactionExists,
                    amountMatches: verification.amountMatches,
                    recipientCorrect: verification.recipientCorrect,
                    isRecent: verification.isRecent,
                    isUnused: verification.isUnused
                }
            }, { status: 400 });
        }

        // Define priceHbar for clarity
        const priceHbar = parseFloat(dataset.price || '0');

        // 1. Pay seller (95% of price)
        await transferHbarToSeller(dataset.owner_wallet, priceHbar * 0.95);

        // 2. Mint and transfer access token
        const { mintRx, transferRx } = await mintAndTransferToken(dataset.token_id, buyerWallet);

        // 3. Record purchase with authenticated user ID
        const { purchase, insertError } = await recordPurchase(dataset, buyerWallet, paymentTxId, mintRx, transferRx, user.id);

        if (insertError) {
            console.error('Database insert error:', insertError);
            return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
        }

        // Return purchase details in the response
        return NextResponse.json({
            success: true,
            purchase,
            verification: {
                transactionExists: verification.transactionExists,
                amountMatches: verification.amountMatches,
                recipientCorrect: verification.recipientCorrect,
                isRecent: verification.isRecent,
                isUnused: verification.isUnused
            }
        });

    } catch (error) {
        console.error('Purchase error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}