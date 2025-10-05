"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { convertUsdToVet, formatVetAmount} from "../lib/utils";
import { CONTRACT_ADDRESS } from "../lib/constants";
import { useVeChainWallet } from "./VeChainWalletContext";
import { DAppKitUI } from "@vechain/dapp-kit-ui";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  disasterHash: string;
  refreshDonations?: () => Promise<void>;
}

// Function selector for donateToDisaster(bytes32)
const DONATE_SELECTOR = '0x4cc3da6b';

export default function DonationModal({
  isOpen,
  onClose,
  eventTitle,
  disasterHash,
  refreshDonations,
}: DonationModalProps) {
  const { address, isConnected, connect, disconnect } = useVeChainWallet();
  const [step, setStep] = useState<"wallet" | "amount" | "success">("wallet");
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [vetAmount, setVetAmount] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [isConvertingCurrency, setIsConvertingCurrency] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [donatedAmount, setDonatedAmount] = useState<string>("");
  const [totalDonated, setTotalDonated] = useState<string>("");

  // Auto-proceed to amount step if already connected
  useEffect(() => {
    if (isOpen && isConnected && step === "wallet") {
      setStep("amount");
    }
  }, [isOpen, isConnected]);

  // Convert USD to VET when donation amount changes
  useEffect(() => {
    const convertCurrency = async () => {
      if (donationAmount && parseFloat(donationAmount) > 0) {
        setIsConvertingCurrency(true);
        try {
          const usdAmount = parseFloat(donationAmount);
          const vetTokens = await convertUsdToVet(usdAmount);
          setVetAmount(vetTokens);
        } catch (error) {
          console.error("Currency conversion failed:", error);
          // Use fallback rate: $0.02381 per VET
          setVetAmount(parseFloat(donationAmount) / 0.02381);
        } finally {
          setIsConvertingCurrency(false);
        }
      } else {
        setVetAmount(0);
      }
    };

    const debounceTimer = setTimeout(convertCurrency, 500);
    return () => clearTimeout(debounceTimer);
  }, [donationAmount]);

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0 || vetAmount <= 0) return;

    if (!DAppKitUI.wallet.state.address) {
      setConnectionStatus("Please connect your wallet first");
      connect();
      return;
    }

    setIsConnecting(true);
    setConnectionStatus("Preparing transaction...");

    try {
      // Convert VET to wei (1 VET = 10^18 wei)
      const amountInWei = BigInt(Math.floor(vetAmount * 1e18));
      const amountHex = '0x' + amountInWei.toString(16);
      
      // Ensure disaster hash has 0x prefix
      let formattedDisasterHash = disasterHash;
      if (!disasterHash.startsWith('0x')) {
        formattedDisasterHash = '0x' + disasterHash;
      }
      
      const encodedData = DONATE_SELECTOR + formattedDisasterHash.slice(2);

      setConnectionStatus("Please confirm the transaction in VeWorld...");

      const result = await DAppKitUI.signer?.sendTransaction({
        clauses: [{
          to: CONTRACT_ADDRESS,
          value: amountHex,
          data: encodedData,
        }],
        comment: `Donate ${vetAmount} VET to veHelp`,
      });

      setTxHash((result as any)?.txid || '');
      setDonatedAmount(vetAmount.toFixed(4));
      
      setConnectionStatus("Donation successful!");
      setStep("success");
      setIsConnecting(false);

      if (refreshDonations) {
        await refreshDonations();
      }

    } catch (error: any) {
      console.error("Donation error:", error);
      
      let errorMessage = "Transaction failed";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setConnectionStatus(`Error: ${errorMessage}`);
      setIsConnecting(false);
    }
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setConnectionStatus("Opening wallet connection...");

    try {
      connect();
      setConnectionStatus("Please connect your wallet...");
    } catch (error: unknown) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect";
      setConnectionStatus(`Error: ${errorMessage}`);
      setIsConnecting(false);
    }
  };

  const handleBack = () => {
    if (step === "amount") {
      setStep("wallet");
    } else if (step === "success") {
      setStep("amount");
    }
    setConnectionStatus("");
    setIsConnecting(false);
  };

  const handleNewDonation = () => {
    setStep("amount");
    setDonationAmount("");
    setVetAmount(0);
    setTxHash("");
    setDonatedAmount("");
    setTotalDonated("");
    setConnectionStatus("");
  };

  const resetModal = () => {
    setStep(isConnected ? "amount" : "wallet");
    setDonationAmount("");
    setVetAmount(0);
    setConnectionStatus("");
    setIsConnecting(false);
    setIsConvertingCurrency(false);
    setTxHash("");
    setDonatedAmount("");
    setTotalDonated("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Scroll Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: 15 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative max-w-md w-full"
          >
            {/* Ancient Scroll Design */}
            <div
              className="relative rounded-2xl border-4 border-amber-800 shadow-2xl"
              style={{ backgroundColor: "#cbb287" }}
            >
              {/* Scroll Decorations */}
              <div className="absolute -top-2 left-4 right-4 h-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-full"></div>
              <div className="absolute -bottom-2 left-4 right-4 h-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-full"></div>

              {/* Scroll Ends */}
              <div className="absolute -left-3 top-2 bottom-2 w-6 bg-gradient-to-b from-amber-800 to-amber-900 rounded-full shadow-lg"></div>
              <div className="absolute -right-3 top-2 bottom-2 w-6 bg-gradient-to-b from-amber-800 to-amber-900 rounded-full shadow-lg"></div>

              {/* Content */}
              <div className="p-8 pt-12 pb-12">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-amber-900 hover:text-black transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Back Button */}
                {(step === "amount" || step === "success") && (
                  <button
                    onClick={handleBack}
                    className="absolute top-4 left-4 text-amber-900 hover:text-black transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}

                {/* Step 1: Wallet Selection */}
                {step === "wallet" && (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 font-['Cinzel'] mb-2 drop-shadow-sm">
                        Connect Your Wallet
                      </h2>
                      <div className="mt-2 text-gray-800 font-['Cinzel'] text-xs italic">
                        For: {eventTitle}
                      </div>
                      <div className="mt-2 text-gray-800 font-['Cinzel'] text-xs">
                        VeChain Testnet Network
                      </div>
                    </div>

                    {connectionStatus && (
                      <div className="mb-6 p-3 bg-amber-200/70 rounded-lg border border-amber-600/50">
                        <p className="text-gray-900 font-['Cinzel'] text-sm text-center font-medium">
                          {connectionStatus}
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        {isConnected ? (
                          <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 font-['Cinzel'] mb-2">
                                Wallet Connected
                              </h4>
                              <p className="text-gray-700 font-['Cinzel'] text-sm break-all">
                                {address?.substring(0, 6)}...{address?.substring(38)}
                              </p>
                              <button
                                onClick={() => {
                                  disconnect();
                                  setStep("wallet");
                                }}
                                className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline font-['Cinzel']"
                              >
                                Disconnect
                              </button>
                            </div>
                            <button
                              onClick={() => setStep("amount")}
                              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-['Cinzel']"
                            >
                              Continue to Donation Amount
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={handleConnectWallet}
                              disabled={isConnecting}
                              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 disabled:bg-gray-400/20 disabled:border-gray-400/30 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none font-['Cinzel'] flex items-center justify-center"
                            >
                              {isConnecting ? "Opening Wallet..." : "Connect VeWorld Wallet"}
                            </button>
                            <p className="text-gray-700 font-['Cinzel'] text-xs text-center italic px-2">
                              Connect your VeWorld wallet to continue
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Amount Input */}
                {step === "amount" && (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 font-['Cinzel'] mb-2 drop-shadow-sm">
                        Enter Donation Amount
                      </h2>
                      <div className="mt-2 text-gray-800 font-['Cinzel'] text-sm">
                        Network: <span className="font-bold">VeChain Testnet</span>
                      </div>
                      {address && (
                        <div className="mt-1 text-gray-600 font-['Cinzel'] text-xs">
                          {address.substring(0, 6)}...{address.substring(38)}
                          <button
                            onClick={() => {
                              disconnect();
                              setStep("wallet");
                            }}
                            className="ml-2 text-gray-500 hover:text-gray-700 underline"
                          >
                            disconnect
                          </button>
                        </div>
                      )}
                      <div className="mt-1 text-gray-800 font-['Cinzel'] text-xs italic">
                        For: {eventTitle}
                      </div>
                    </div>

                    {connectionStatus && (
                      <div className="mb-6 p-3 bg-amber-200/70 rounded-lg border border-amber-600/50">
                        <p className="text-gray-900 font-['Cinzel'] text-sm text-center font-medium">
                          {connectionStatus}
                        </p>
                      </div>
                    )}

                    <div className="mb-6">
                      <label className="block text-gray-900 font-['Cinzel'] font-bold mb-3 text-lg">
                        Amount (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 font-['Cinzel'] text-xl font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-4 bg-white/20 backdrop-blur-sm border-2 border-amber-600/50 rounded-xl text-gray-900 font-['Cinzel'] text-xl font-bold placeholder-gray-600 focus:outline-none focus:border-amber-700 focus:bg-white/30 transition-all"
                        />
                      </div>
                      
                      {/* VET Amount Display */}
                      {donationAmount && parseFloat(donationAmount) > 0 && (
                        <div className="mt-3 p-3 bg-amber-100/30 rounded-lg border border-amber-200/50">
                          <div className="text-center">
                            <p className="text-gray-800 font-['Cinzel'] text-sm">
                              Equivalent in VET:
                            </p>
                            <p className="text-gray-900 font-['Cinzel'] text-lg font-bold">
                              {isConvertingCurrency ? (
                                <span className="animate-pulse">Converting...</span>
                              ) : (
                                formatVetAmount(vetAmount)
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleDonate}
                      disabled={
                        !donationAmount ||
                        parseFloat(donationAmount) <= 0 ||
                        vetAmount <= 0 ||
                        isConnecting ||
                        isConvertingCurrency
                      }
                      className="w-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 disabled:bg-gray-400/20 disabled:border-gray-400/30 disabled:text-gray-500 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none font-['Cinzel']"
                    >
                      {isConnecting ? "Processing..." : 
                       isConvertingCurrency ? "Converting..." : 
                       "Donate Now"}
                    </button>
                  </>
                )}

                {/* Step 3: Success Screen */}
                {step === "success" && (
                  <>
                    <div className="text-center mb-8">
                      <div className="mb-4">
                        <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 font-['Cinzel'] mb-2 drop-shadow-sm">
                        Donation Successful!
                      </h2>
                      <div className="mt-2 text-gray-800 font-['Cinzel'] text-xs italic">
                        Thank you for your generosity
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {/* Transaction Hash */}
                      <div className="p-3 bg-amber-100/30 rounded-lg border border-amber-200/50">
                        <p className="text-gray-800 font-['Cinzel'] text-sm font-bold mb-1">
                          Transaction Hash:
                        </p>
                        <p className="text-gray-900 font-['Cinzel'] text-xs font-mono break-all">
                          {txHash}
                        </p>
                        <a
                          href={`https://explore-testnet.vechain.org/transactions/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-800 hover:text-amber-900 font-['Cinzel'] text-xs underline mt-1 inline-block"
                        >
                          View on Explorer →
                        </a>
                      </div>

                      {/* Donation Details */}
                      {donatedAmount && (
                        <div className="p-3 bg-amber-100/30 rounded-lg border border-amber-200/50">
                          <p className="text-gray-800 font-['Cinzel'] text-sm font-bold mb-1">
                            Your Donation:
                          </p>
                          <p className="text-gray-900 font-['Cinzel'] text-lg font-bold">
                            {parseFloat(donatedAmount).toFixed(4)} VET
                          </p>
                        </div>
                      )}

                      {/* Total Donated */}
                      {totalDonated && (
                        <div className="p-3 bg-amber-100/30 rounded-lg border border-amber-200/50">
                          <p className="text-gray-800 font-['Cinzel'] text-sm font-bold mb-1">
                            Total Raised:
                          </p>
                          <p className="text-gray-900 font-['Cinzel'] text-lg font-bold">
                            {totalDonated ? parseFloat(totalDonated).toFixed(4) : '0.0000'} VET
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleNewDonation}
                        className="w-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-['Cinzel']"
                      >
                        Donate Again
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full bg-amber-700/20 backdrop-blur-xl border border-amber-600/50 hover:bg-amber-700/30 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all duration-300 font-['Cinzel']"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}

                <div className="mt-8 text-center">
                  <p className="text-gray-800 font-['Cinzel'] text-xs italic">
                    ✨ Your generosity brings divine blessings ✨
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
