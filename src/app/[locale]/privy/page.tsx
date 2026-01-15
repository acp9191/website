'use client';

import { usePrivy, useWallets, useSignMessage, useSendTransaction } from '@privy-io/react-auth';
import { useState } from 'react';
import { parseEther } from 'viem';

export default function TestPrivy() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    linkEmail,
    linkWallet,
    linkGoogle,
    linkTwitter,
    linkDiscord,
    unlinkEmail,
    unlinkWallet,
    exportWallet,
    getAccessToken,
  } = usePrivy();

  const { signMessage } = useSignMessage();
  const { sendTransaction } = useSendTransaction();

  const { wallets } = useWallets();
  const [accessToken, setAccessToken] = useState<string>('');
  const [signedMessage, setSignedMessage] = useState<string>('');
  const [messageToSign, setMessageToSign] = useState<string>('Hello from Privy!');
  const [txRecipient, setTxRecipient] = useState<string>('');
  const [txAmount, setTxAmount] = useState<string>('0.001');
  const [txHash, setTxHash] = useState<string>('');

  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

  const handleGetAccessToken = async () => {
    const token = await getAccessToken();
    setAccessToken(token || 'No token available');
  };

  const handleSignMessage = async () => {
    if (!embeddedWallet) return;
    try {
      const result = await signMessage(
        { message: messageToSign },
        {
          address: embeddedWallet.address,
          uiOptions: {
            title: 'Sign Message',
            description: 'Please sign this message to verify your wallet',
          },
        }
      );
      setSignedMessage(result.signature);
    } catch (error) {
      console.error('Error signing message:', error);
      setSignedMessage('Error signing message');
    }
  };

  const handleExportWallet = async () => {
    if (!embeddedWallet) return;
    try {
      await exportWallet();
    } catch (error) {
      console.error('Error exporting wallet:', error);
    }
  };

  const handleSendTransaction = async () => {
    if (!embeddedWallet || !txRecipient) return;
    try {
      setTxHash('Sending...');
      const receipt = await sendTransaction({
        to: txRecipient as `0x${string}`,
        value: parseEther(txAmount),
        chainId: embeddedWallet.chainId ? Number(embeddedWallet.chainId.split(':')[1]) : undefined,
      });
      setTxHash(receipt.hash);
    } catch (error) {
      console.error('Error sending transaction:', error);
      setTxHash('Error sending transaction');
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading Privy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-8">Privy Full Feature Demo</h1>

      {/* Authentication Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Status:</span>{' '}
            <span
              className={
                authenticated ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
              }
            >
              {authenticated ? 'Authenticated ✓' : 'Not authenticated'}
            </span>
          </p>
          {authenticated && user && (
            <>
              <p>
                <span className="font-medium">User ID:</span>{' '}
                <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{user.id}</code>
              </p>
              <p>
                <span className="font-medium">Created At:</span>{' '}
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          {!authenticated ? (
            <button
              onClick={login}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
            >
              Log in
            </button>
          ) : (
            <button
              onClick={logout}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
            >
              Log out
            </button>
          )}
        </div>
      </div>

      {authenticated && user && (
        <>
          {/* Linked Accounts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Linked Accounts</h2>
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="font-medium">Email</p>
                  {user.email ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email.address}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not linked</p>
                  )}
                </div>
                {user.email ? (
                  <button
                    onClick={() => unlinkEmail(user.email!.address)}
                    className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-all hover:shadow-lg cursor-pointer"
                  >
                    Unlink
                  </button>
                ) : (
                  <button
                    onClick={linkEmail}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors cursor-pointer"
                  >
                    Link Email
                  </button>
                )}
              </div>

              {/* Google */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="font-medium">Google</p>
                  {user.google ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.google.email}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not linked</p>
                  )}
                </div>
                {!user.google && (
                  <button
                    onClick={linkGoogle}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-all hover:shadow-lg cursor-pointer"
                  >
                    Link Google
                  </button>
                )}
              </div>

              {/* Twitter */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="font-medium">Twitter</p>
                  {user.twitter ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">@{user.twitter.username}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not linked</p>
                  )}
                </div>
                {!user.twitter && (
                  <button
                    onClick={linkTwitter}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-all hover:shadow-lg cursor-pointer"
                  >
                    Link Twitter
                  </button>
                )}
              </div>

              {/* Discord */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="font-medium">Discord</p>
                  {user.discord ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.discord.username}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Not linked</p>
                  )}
                </div>
                {!user.discord && (
                  <button
                    onClick={linkDiscord}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-all hover:shadow-lg cursor-pointer"
                  >
                    Link Discord
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Wallets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Wallets</h2>
            {wallets.length > 0 ? (
              <div className="space-y-3">
                {wallets.map((wallet, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">
                          {wallet.walletClientType === 'privy' ? 'Embedded Wallet' : `External Wallet (${wallet.walletClientType})`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mt-1">
                          {wallet.address}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Chain: {wallet.chainId || 'Unknown'}
                        </p>
                      </div>
                      {wallet.walletClientType !== 'privy' && (
                        <button
                          onClick={() => unlinkWallet(wallet.address)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-all hover:shadow-lg cursor-pointer ml-2"
                        >
                          Unlink
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No wallets connected</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={linkWallet}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-all hover:shadow-lg cursor-pointer"
              >
                Link External Wallet
              </button>
              {embeddedWallet && (
                <button
                  onClick={handleExportWallet}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-all hover:shadow-lg cursor-pointer"
                >
                  Export Wallet
                </button>
              )}
            </div>
          </div>

          {/* Access Token */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Access Token</h2>
            <button
              onClick={handleGetAccessToken}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-all hover:shadow-lg cursor-pointer"
            >
              Get Access Token
            </button>
            {accessToken && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Token:</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded overflow-x-auto">
                  <code className="text-xs break-all">{accessToken}</code>
                </div>
              </div>
            )}
          </div>

          {/* Sign Message */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Sign Message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Message to sign:</label>
                <input
                  type="text"
                  value={messageToSign}
                  onChange={(e) => setMessageToSign(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter message to sign"
                />
              </div>
              <button
                onClick={handleSignMessage}
                disabled={!embeddedWallet}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-all hover:shadow-lg cursor-pointer"
              >
                Sign Message
              </button>
              {signedMessage && (
                <div>
                  <p className="text-sm font-medium mb-2">Signature:</p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded overflow-x-auto">
                    <code className="text-xs break-all">{signedMessage}</code>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Send Transaction */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Send Transaction</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recipient Address:</label>
                <input
                  type="text"
                  value={txRecipient}
                  onChange={(e) => setTxRecipient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount (ETH):</label>
                <input
                  type="text"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.001"
                />
              </div>
              <button
                onClick={handleSendTransaction}
                disabled={!embeddedWallet || !txRecipient}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded transition-all hover:shadow-lg cursor-pointer"
              >
                Send Transaction
              </button>
              {txHash && (
                <div>
                  <p className="text-sm font-medium mb-2">Transaction Hash:</p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded overflow-x-auto">
                    <code className="text-xs break-all">{txHash}</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
