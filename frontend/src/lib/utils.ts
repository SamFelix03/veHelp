import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import dotenv from "dotenv";
import { CONTRACT_ADDRESS } from "./constants";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// CoinGecko API (no API key required, CORS-friendly)
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";

/**
 * Convert USD amount to VET tokens using CoinGecko API (CORS-friendly)
 * @param usdAmount - Amount in USD to convert
 * @returns Promise<number> - Equivalent amount in VET tokens
 */
export async function convertUsdToVet(usdAmount: number): Promise<number> {
  try {
    // Use CoinGecko API which is CORS-friendly and doesn't require API key
    const response = await fetch(
      `${COINGECKO_API_URL}?ids=vechain&vs_currencies=usd`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // CoinGecko returns: { "vechain": { "usd": price_in_usd } }
    if (data.vechain && data.vechain.usd) {
      const vetPriceInUsd = data.vechain.usd;
      const vetAmount = usdAmount / vetPriceInUsd;
      return vetAmount;
    } else {
      throw new Error("Invalid API response structure - VET price not found");
    }
  } catch (error) {
    console.error("Error converting USD to VET:", error);
    // Fallback rate: $0.02381 per VET
    // So 1 USD = 1 / 0.02381 = 42.01 VET
    return usdAmount / 0.02381;
  }
}

/**
 * Format VET amount for display
 * @param vetAmount - Amount in VET tokens
 * @returns string - Formatted VET amount
 */
export function formatVetAmount(vetAmount: number): string {
  return `${vetAmount.toFixed(4)} VET`;
}

// VeChain donation fetching using REST API
export async function fetchRecentDonations(disasterHash: string): Promise<{
  donor: string;
  amount: string;
  timestamp: string;
  formattedTime: string;
}[]> {
  try {
    // Ensure disaster hash has 0x prefix
    let formattedDisasterHash = disasterHash;
    if (!disasterHash.startsWith('0x')) {
      formattedDisasterHash = '0x' + disasterHash;
    }

    // Function selector for getDisasterDonations(bytes32)
    const GET_DISASTER_DONATIONS_SELECTOR = '0x4df2b56b';
    
    // Encode the function call: selector + disaster hash (without 0x)
    const encodedData = GET_DISASTER_DONATIONS_SELECTOR + formattedDisasterHash.slice(2);

    // Call VeChain REST API to read from contract
    const response = await fetch('https://testnet.vechain.org/accounts/*', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        clauses: [{
          to: CONTRACT_ADDRESS,
          value: '0x0',
          data: encodedData
        }]
      })
    });

    if (!response.ok) {
      console.warn(`VeChain API error: ${response.status}`);
      return [];
    }

    const result = await response.json();
    
    // Check if we got valid data
    if (!result || !result[0] || !result[0].data || result[0].data === '0x') {
      console.log("No donations found for this disaster");
      return [];
    }

    // Parse the returned data
    // The response format is an array of tuples: (address donor, uint256 amount, uint256 timestamp)[]
    const data = result[0].data;
    
    // Skip the first 64 chars (0x + offset pointer)
    // Then parse array length and elements
    if (data.length <= 66) {
      return []; // No donations
    }

    const donations: {
      donor: string;
      amount: string;
      timestamp: string;
      formattedTime: string;
    }[] = [];

    try {
      // Remove '0x' prefix
      const hexData = data.slice(2);
      
      // First 32 bytes (64 chars) is the offset to the array
      // Next 32 bytes (64 chars) is the array length
      const arrayLengthHex = hexData.slice(64, 128);
      const arrayLength = parseInt(arrayLengthHex, 16);
      
      // Each donation is 3 * 32 bytes = 96 bytes = 192 hex chars
      for (let i = 0; i < arrayLength; i++) {
        const offset = 128 + (i * 192); // Start after length + (index * tuple size)
        
        // Extract donor address (first 32 bytes, address is last 20 bytes)
        const donorHex = '0x' + hexData.slice(offset + 24, offset + 64);
        
        // Extract amount (next 32 bytes)
        const amountHex = hexData.slice(offset + 64, offset + 128);
        const amountBigInt = BigInt('0x' + amountHex);
        
        // Extract timestamp (next 32 bytes)
        const timestampHex = hexData.slice(offset + 128, offset + 192);
        const timestamp = parseInt(timestampHex, 16);
        
        // Format the donor address for privacy (show first 6 and last 4 characters)
        const formattedDonor = `${donorHex.substring(0, 6)}...${donorHex.substring(38)}`;
        
        // Format amount in VET (divide by 10^18)
        const formattedAmount = (Number(amountBigInt) / 1e18).toFixed(4);
        
        // Format timestamp
        const date = new Date(timestamp * 1000);
        const formattedTime = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        donations.push({
          donor: formattedDonor,
          amount: `${formattedAmount} VET`,
          timestamp: timestamp.toString(),
          formattedTime
        });
      }
      
      return donations;
    } catch (parseError) {
      console.error("Failed to parse donation data:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch donations:", error);
    return [];
  }
}
