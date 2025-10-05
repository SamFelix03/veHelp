"use client";

import React, { useState, useEffect } from "react";
import {
  Event,
  ClaimWithOrganization,
} from "../lib/types/database";
import { eventsService } from "../lib/dynamodb/events";
import { claimsService } from "../lib/dynamodb/claims";
import { fetchRecentDonations } from "../lib/utils";
import Header from "./Header";
import DivineLoader from "./DivineLoader";
import DecryptedText from "./DecryptedText";
import DonationModal from "./DonationModal";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import RequestFundsModal from "./RequestFundsModal";
import VotingModal from "./VotingModal";
import ClaimModal from "./ClaimModal";
import LotteryCountdown from "./LotteryCountdown";
import { lotteryTimerService } from "../lib/services/lotteryTimer";

interface EventDetailClientProps {
  eventId: string;
}

export default function EventDetailClient({ eventId }: EventDetailClientProps) {
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [claims, setClaims] = useState<ClaimWithOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<{
    donor: string;
    amount: string;
    timestamp: string;
    formattedTime: string;
  }[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [selectedVote, setSelectedVote] = useState<{
    [claimId: string]: string;
  }>({});
  const [hasVoted, setHasVoted] = useState<{ [claimId: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<"donations" | "claims">(
    "donations"
  );
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isRequestFundsModalOpen, setIsRequestFundsModalOpen] = useState(false);
  const [votingModal, setVotingModal] = useState<{
    isOpen: boolean;
    claimId: string;
    organizationName: string;
    organizationAztecAddress: string;
    claimedAmount: number;
    reason: string;
  }>({
    isOpen: false,
    claimId: "",
    organizationName: "",
    organizationAztecAddress: "",
    claimedAmount: 0,
    reason: "",
  });
  const [claimModal, setClaimModal] = useState<{
    isOpen: boolean;
    claimId: string;
    organizationName: string;
    organizationAztecAddress: string;
    claimedAmount: number;
  }>({
    isOpen: false,
    claimId: "",
    organizationName: "",
    organizationAztecAddress: "",
    claimedAmount: 0,
  });

  // Consistent date formatting function to avoid hydration mismatch
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  };

  // Consistent datetime formatting function
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Fetch event and claims data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch event details
        const eventData = await eventsService.getEventById(eventId);
        if (!eventData) {
          console.error("Event not found");
          return;
        }
        setEvent(eventData);

        // Add event to lottery timer service
        try {
          await lotteryTimerService.addEvent(eventData);
        } catch (error) {
          console.warn("Failed to add event to lottery timer service:", error);
        }

        // Fetch claims for this event
        const claimsData = await claimsService.getClaimsByEventId(eventId);
        // Filter out rejected claims - they shouldn't be visible for voting
        const visibleClaims = claimsData.filter(claim => claim.claim_state !== "rejected");
        setClaims(visibleClaims);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [eventId]);

  // Fetch donations when event data is available
  useEffect(() => {
    async function loadDonations() {
      if (!event?.disaster_hash) return;
      
      setDonationsLoading(true);
      try {
        const donationData = await fetchRecentDonations(event.disaster_hash);
        setDonations(donationData);
      } catch (error) {
        console.error("Error fetching donations:", error);
        setDonations([]); // Fall back to empty array
      } finally {
        setDonationsLoading(false);
      }
    }

    loadDonations();
  }, [event?.disaster_hash]);

  const handleVote = async (claimId: string, voteType: string) => {
    setSelectedVote((prev) => ({ ...prev, [claimId]: voteType }));
    setHasVoted((prev) => ({ ...prev, [claimId]: true }));
    console.log(`Voted ${voteType} for claim ${claimId}`);
  };

  const openVotingModal = (claim: ClaimWithOrganization) => {
    setVotingModal({
      isOpen: true,
      claimId: claim.id,
      organizationAztecAddress: claim.organization_aztec_address || "",
      organizationName: claim.organization_name || "Unknown Organization",
      claimedAmount: claim.claimed_amount,
      reason: claim.reason,
    });
  };

  const openClaimModal = (claim: ClaimWithOrganization) => {
    setClaimModal({
      isOpen: true,
      claimId: claim.id,
      organizationName: claim.organization_name || "Unknown Organization",
      organizationAztecAddress: claim.organization_aztec_address || "",
      claimedAmount: claim.claimed_amount,
    });
  };

  const refreshDonations = async () => {
    if (!event?.disaster_hash) return;
    
    setDonationsLoading(true);
    try {
      const donationData = await fetchRecentDonations(event.disaster_hash);
      setDonations(donationData);
    } catch (error) {
      console.error("Error refreshing donations:", error);
    } finally {
      setDonationsLoading(false);
    }
  };

  const getClaimStateColor = (state: string) => {
    switch (state) {
      case "voting":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "waiting_for_ai":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "claimed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getClaimStateText = (state: string) => {
    switch (state) {
      case "voting":
        return "Open for Voting";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "waiting_for_ai":
        return "Under Review";
      case "claimed":
        return "Funds Claimed";
      default:
        return state;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Divine Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af8c] via-[#c9a876] to-[#b8956a]"></div>
        <div className="absolute inset-0 opacity-60">
          <img
            src="/assets/clouds.png"
            alt="Divine Clouds"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Divine Header */}
      <Header hidden={isRequestFundsModalOpen || isDonationModalOpen} />

      <main
        className="relative z-10 max-w-7xl mx-auto px-6 py-8"
        style={{ paddingTop: "100px" }}
      >
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-700 hover:text-gray-900 font-['Cinzel'] transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Back to Events
          </button>
        </div>

        {/* Loading State */}
        {loading && <DivineLoader message="Loading Details..." size="large" />}

        {/* Event Not Found */}
        {!loading && !event && (
          <div className="text-center py-16">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-['Cinzel'] text-lg">
              Event not found.
            </p>
          </div>
        )}

        {/* Event Content */}
        {!loading && event && (
          <>
            {/* Event Header */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 font-['Cinzel']">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center text-gray-700 font-['Cinzel']">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {event.disaster_location}
                    </div>
                    <div className="flex items-center text-gray-700 font-['Cinzel']">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(event.created_at)}
                    </div>
                  </div>
                  <p className="text-gray-700 font-['Cinzel'] leading-relaxed mb-6">
                    {event.description}
                  </p>
                  <a
                    href={event.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-white/20 hover:bg-white/30 text-gray-800 font-medium py-2 px-3 rounded-lg transition-colors font-['Cinzel'] text-sm backdrop-blur-sm border border-white/30"
                  >
                    <svg
                      className="w-3 h-3 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    View Source
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {/* Total Amount Display */}
                  <div className="text-center p-4 bg-amber-100/20 rounded-xl border border-amber-200/30 backdrop-blur-sm">
                    <p className="text-sm text-gray-700 font-['Cinzel'] mb-1">
                      Total Needed
                    </p>
                    <p className="text-3xl font-bold text-gray-900 font-['Cinzel'] drop-shadow-sm">
                      ${event.estimated_amount_required.toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsDonationModalOpen(true)}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] font-['Cinzel'] text-xl"
                  >
                    Donate Now
                  </button>
                </div>
              </div>
            </div>

            {/* Lottery Countdown Component */}
            <LotteryCountdown event={event} />

            {/* Approved Claims Section - Separate Important Section */}
            {claims.filter(claim => claim.claim_state === "approved").length > 0 && (
              <div className="mb-8 bg-gradient-to-r from-green-50/30 to-emerald-50/30 backdrop-blur-xl rounded-3xl border-2 border-green-300/50 p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 font-['Cinzel'] drop-shadow-lg bg-gradient-to-b from-green-700 to-green-800 bg-clip-text text-transparent">
                    Approved Fund Claims
                  </h2>
                  <p className="text-gray-800 font-['Cinzel'] text-lg font-medium">
                    These organizations have been approved by the community to receive disaster relief funds
                  </p>
                </div>

                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {claims
                    .filter(claim => claim.claim_state === "approved")
                    .map((claim) => (
                      <div
                        key={claim.id}
                        className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-green-300/50 hover:bg-white/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 font-['Cinzel'] drop-shadow-sm">
                              {claim.organization_name || "Unknown Organization"}
                            </h3>
                            <div className="text-2xl font-black text-green-700 font-['Cinzel'] font-bold mt-2 drop-shadow-sm">
                              ${claim.claimed_amount.toLocaleString()}
                            </div>
                          </div>
                          <span className="px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200 font-['Cinzel'] drop-shadow-sm">
                            ✓ Approved
                          </span>
                        </div>

                        <p className="text-gray-800 font-['Cinzel'] text-base mb-4 leading-relaxed font-medium">
                          {claim.reason}
                        </p>

                        {/* Claims Hash Button */}
                        {claim.claims_hash && (
                          <div className="mb-4">
                            <a
                              href={`https://evm-testnet.flowscan.io/tx/0x${claim.claims_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors font-['Cinzel'] inline-flex items-center"
                            >
                              Claim Hash
                            </a>
                          </div>
                        )}

                        <div className="mt-4 text-sm text-gray-600 font-['Cinzel'] font-medium">
                          Approved: {formatDateTime(claim.created_at)}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Tabbed Content Section */}
            <div className="mb-8">
              {/* Tab Navigation */}
              <div className="flex mb-6 bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-lg">
                <button
                  onClick={() => setActiveTab("donations")}
                  className={`flex-1 flex items-center justify-center py-3 px-6 rounded-xl font-['Cinzel'] font-semibold transition-all duration-300 ${
                    activeTab === "donations"
                      ? "bg-amber-700 text-white shadow-lg"
                      : "text-gray-700 hover:bg-white/20"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Recent Donations
                </button>
                <button
                  onClick={() => setActiveTab("claims")}
                  className={`flex-1 flex items-center justify-center py-3 px-6 rounded-xl font-['Cinzel'] font-semibold transition-all duration-300 ${
                    activeTab === "claims"
                      ? "bg-amber-700 text-white shadow-lg"
                      : "text-gray-700 hover:bg-white/20"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Active Fund Claims ({claims.filter(claim => claim.claim_state !== "approved").length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === "donations" ? (
                    <motion.div
                      key="donations"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <h2 className="text-3xl font-bold text-gray-900 mb-8 font-['Cinzel'] flex items-center drop-shadow-sm">
                        <svg
                          className="w-8 h-8 mr-4 text-amber-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        Recent Donations
                      </h2>

                      {/* Futuristic Encrypted Donations Table */}
                      <div className="bg-transparent rounded-lg p-4 border border-gray-300/50">
                        {/* Table Header */}
                        <div className="grid grid-cols-3 gap-4 text-center py-2 border-b border-gray-300/30 mb-3">
                          <div className="font-mono text-black text-sm font-bold">
                            DONOR_ID
                          </div>
                          <div className="font-mono text-black text-sm font-bold">
                            AMOUNT
                          </div>
                          <div className="font-mono text-black text-sm font-bold">
                            TIMESTAMP
                          </div>
                        </div>

                        {/* Real or Loading Donation Rows */}
                        <div className="space-y-2">
                          {donationsLoading ? (
                            // Loading state
                            Array.from({ length: 3 }).map((_, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-3 gap-4 text-center py-1 animate-pulse"
                              >
                                <div className="font-mono text-black text-sm">
                                  Loading...
                                </div>
                                <div className="font-mono text-black text-sm">
                                  Loading...
                                </div>
                                <div className="font-mono text-black text-sm">
                                  Loading...
                                </div>
                              </div>
                            ))
                          ) : donations.length > 0 ? (
                            // Real donation data
                            donations.slice(0, 8).map((donation, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-3 gap-4 text-center py-1 hover:bg-gray-100/20 transition-colors rounded"
                              >
                                <div className="font-mono text-black text-sm">
                                  <DecryptedText
                                    text={donation.donor}
                                    animateOn="view"
                                    speed={60}
                                    maxIterations={12}
                                    characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?"
                                    className="font-mono text-black"
                                    encryptedClassName="text-black"
                                  />
                                </div>
                                <div className="font-mono text-black text-sm">
                                  <DecryptedText
                                    text={donation.amount}
                                    animateOn="view"
                                    speed={80}
                                    maxIterations={15}
                                    characters="$@#%&*!?0123456789ABCDEF"
                                    className="font-mono text-black"
                                    encryptedClassName="text-black"
                                  />
                                </div>
                                <div className="font-mono text-black text-sm">
                                  <DecryptedText
                                    text={donation.formattedTime}
                                    animateOn="view"
                                    speed={70}
                                    maxIterations={10}
                                    characters="0123456789:#-ABCDEF"
                                    className="font-mono text-black"
                                    encryptedClassName="text-black"
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            // No donations fallback - show encrypted placeholder
                            [
                              {
                                donor: "X7K9#M2@P5L",
                                amount: "$#@!%*&",
                                time: "2024:##:##",
                              },
                              {
                                donor: "Q3R8@N4$W7",
                                amount: "*&%#$@!",
                                time: "2024:##:##",
                              },
                              {
                                donor: "Z9F2#K5@M8L",
                                amount: "#$%&*@",
                                time: "2024:##:##",
                              },
                              {
                                donor: "B6H3@R7$Q2",
                                amount: "@!#%*&",
                                time: "2024:##:##",
                              },
                              {
                                donor: "V4N8#L1@K9",
                                amount: "*&#@%$",
                                time: "2024:##:##",
                              },
                              {
                                donor: "T2M7@F5#P8",
                                amount: "%$#@!*",
                                time: "2024:##:##",
                              },
                              {
                                donor: "D1Q6#R3@N4",
                                amount: "&*%#@$",
                                time: "2024:##:##",
                              },
                              {
                                donor: "S8L5@K2#M7",
                                amount: "#@!%*&",
                                time: "2024:##:##",
                              },
                            ].map((donation, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-3 gap-4 text-center py-1 hover:bg-gray-100/20 transition-colors rounded"
                              >
                                <div className="font-mono text-black text-sm">
                                  <DecryptedText
                                    text={donation.donor}
                                    animateOn="view"
                                    speed={60}
                                    maxIterations={12}
                                    characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?"
                                    className="font-mono text-black"
                                    encryptedClassName="text-black"
                                  />
                                </div>
                                <div className="font-mono text-black text-sm">
                                  <DecryptedText
                                    text={donation.amount}
                                    animateOn="view"
                                    speed={80}
                                    maxIterations={15}
                                    characters="$@#%&*!?0123456789ABCDEF"
                                    className="font-mono text-black"
                                    encryptedClassName="text-black"
                                  />
                                </div>
                                <div className="font-mono text-black text-sm">
                                  <DecryptedText
                                    text={donation.time}
                                    animateOn="view"
                                    speed={70}
                                    maxIterations={10}
                                    characters="0123456789:#-ABCDEF"
                                    className="font-mono text-black"
                                    encryptedClassName="text-black"
                                  />
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Show message if no real donations but not loading */}
                        {!donationsLoading && donations.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-gray-600 font-['Cinzel'] text-sm italic">
                              No donations found. The encrypted data above is for demonstration.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="claims"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <h2 className="text-3xl font-bold text-gray-900 mb-8 font-['Cinzel'] flex items-center drop-shadow-sm">
                        <svg
                          className="w-8 h-8 mr-4 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Active Fund Claims ({claims.filter(claim => claim.claim_state !== "approved").length})
                      </h2>
                      <div className="space-y-6 max-h-96 overflow-y-auto">
                        {claims
                          .filter(claim => claim.claim_state !== "approved") // Exclude approved claims
                          .map((claim) => (
                          <div
                            key={claim.id}
                            className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/25 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 font-['Cinzel'] drop-shadow-sm">
                                  {claim.organization_name ||
                                    "Unknown Organization"}
                                </h3>
                                <div className="text-2xl font-black text-amber-800 font-['Cinzel'] font-bold mt-2 drop-shadow-lg">
                                  ${claim.claimed_amount.toLocaleString()}
                                </div>
                              </div>
                              <span
                                className={`px-4 py-2 rounded-full text-sm font-bold border ${getClaimStateColor(
                                  claim.claim_state
                                )} font-['Cinzel'] drop-shadow-sm`}
                              >
                                {getClaimStateText(claim.claim_state)}
                              </span>
                            </div>

                            <p className="text-gray-800 font-['Cinzel'] text-base mb-4 leading-relaxed font-medium">
                              {claim.reason}
                            </p>

                            {claim.claim_state === "voting" && (
                              <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                                <h4 className="font-bold text-gray-900 mb-3 font-['Cinzel'] text-lg">
                                  Community Voting:
                                </h4>
                                {hasVoted[claim.id] ? (
                                  <div className="text-center py-4">
                                    <div className="inline-flex items-center text-green-700 font-['Cinzel'] font-bold text-lg">
                                      <svg
                                        className="w-6 h-6 mr-2"
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
                                      Vote submitted: {selectedVote[claim.id]}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <button
                                      onClick={() => openVotingModal(claim)}
                                      className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 px-8 rounded-lg transition-colors font-['Cinzel'] shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                    >
                                      Cast Your Vote
                                    </button>
                                    <p className="text-blue-700 font-['Cinzel'] text-xs mt-2 italic">
                                      Age verification required via ZKPassport
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Claims Hash Button */}
                            {claim.claims_hash && (
                              <div className="mb-4">
                                <a
                                  href={`https://evm-testnet.flowscan.io/tx/0x${claim.claims_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors font-['Cinzel'] inline-flex items-center"
                                >
                                  Claim Hash
                                </a>
                              </div>
                            )}

                            <div className="mt-4 text-sm text-gray-600 font-['Cinzel'] font-medium">
                              Submitted: {formatDateTime(claim.created_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Fund Claiming Information & Request Button */}
            <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 font-['Cinzel'] drop-shadow-lg bg-gradient-to-b from-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Request Relief Funds
                </h2>
                <p className="text-gray-800 font-['Cinzel'] text-lg max-w-3xl mx-auto leading-relaxed font-medium">
                  Organizations can submit funding requests for relief efforts.
                  All requests go through a transparent community voting process
                  to ensure funds reach legitimate causes.
                </p>
              </div>

              {/* How Fund Claiming Works */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100/60 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg
                      className="w-8 h-8 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-['Cinzel'] mb-3 drop-shadow-sm">
                    1. Submit Request
                  </h3>
                  <p className="text-gray-700 font-['Cinzel'] font-medium">
                    Submit your funding request with detailed justification and
                    required amount
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100/60 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg
                      className="w-8 h-8 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-['Cinzel'] mb-3 drop-shadow-sm">
                    2. Community Review
                  </h3>
                  <p className="text-gray-700 font-['Cinzel'] font-medium">
                    The community votes to accept, reject, or adjust your
                    funding request
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100/60 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-['Cinzel'] mb-3 drop-shadow-sm">
                    3. Receive Funds
                  </h3>
                  <p className="text-gray-700 font-['Cinzel'] font-medium">
                    Approved requests receive funds directly for disaster relief
                    operations
                  </p>
                </div>
              </div>

              {/* Request Button */}
              <div className="text-center">
                <button
                  onClick={() => setIsRequestFundsModalOpen(true)}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] font-['Cinzel'] text-xl"
                >
                  Request Funds
                </button>
                <p className="text-gray-600 font-['Cinzel'] text-sm mt-4 italic">
                  💡 Anonymous voting ensures fair and transparent fund
                  distribution
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        eventTitle={event?.title || "Disaster Relief Event"}
        disasterHash={event?.disaster_hash || ""}
        refreshDonations={refreshDonations}
      />

      {/* Request Funds Modal */}
      <RequestFundsModal
        isOpen={isRequestFundsModalOpen}
        onClose={() => setIsRequestFundsModalOpen(false)}
        eventTitle={event?.title || "Disaster Relief Event"}
        eventId={event?.id || ""}
        disasterHash={event?.disaster_hash || ""}
      />

      {/* Voting Modal */}
      {votingModal.isOpen && (
        <VotingModal
          isOpen={votingModal.isOpen}
          disasterHash={event?.disaster_hash || ""}
          organizationAztecAddress={votingModal.organizationAztecAddress || ""}
          onClose={() =>
            setVotingModal({
              isOpen: false,
              claimId: "",
              organizationAztecAddress: "",
              organizationName: "",
              claimedAmount: 0,
              reason: "",
            })
          }
          claimId={votingModal.claimId}
          organizationName={votingModal.organizationName}
          claimedAmount={votingModal.claimedAmount}
          reason={votingModal.reason}
          onVoteComplete={(voteType) =>
            handleVote(votingModal.claimId, voteType)
          }
        />
      )}

      {/* Claim Modal */}
      {claimModal.isOpen && (
        <ClaimModal
          isOpen={claimModal.isOpen}
          onClose={() => setClaimModal({
            isOpen: false,
            claimId: "",
            organizationName: "",
            organizationAztecAddress: "",
            claimedAmount: 0,
          })}
          claimId={claimModal.claimId}
          organizationName={claimModal.organizationName}
          organizationAztecAddress={claimModal.organizationAztecAddress}
          claimedAmount={claimModal.claimedAmount}
        />
      )}
    </div>
  );
}
