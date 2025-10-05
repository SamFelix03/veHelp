import os
import json
import hashlib
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from openai import OpenAI
import boto3
import re
import requests
import time

# Load environment variables
load_dotenv()

# API Configuration
DISASTER_API_URL = "https://disastercreationserver.onrender.com/disasters"
COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=vechain&vs_currencies=usd"

def get_vet_price():
    """Get current VET price in USD from CoinGecko API"""
    try:
        response = requests.get(COINGECKO_API_URL, timeout=1000)
        response.raise_for_status()
        data = response.json()
        vet_price_usd = data["vechain"]["usd"]
        print(f"[API] VET price: ${vet_price_usd}")
        return vet_price_usd
    except Exception as e:
        print(f"[ERROR] Failed to get VET price: {e}")
        return None

def convert_usd_to_vet(usd_amount, vet_price_usd):
    """Convert USD amount to VET amount"""
    if vet_price_usd is None or vet_price_usd <= 0:
        return None
    vet_amount = float(usd_amount) / vet_price_usd
    print(f"[CONVERSION] ${usd_amount} USD = {vet_amount:.2f} VET")
    return vet_amount

def create_disaster_via_api(title, description, target_amount_vet):
    """Create disaster via API call to Express server"""
    try:
        payload = {
            "title": title,
            "metadata": {
                "description": description
            },
            "targetAmountVET": target_amount_vet
        }
        
        print(f"[API] Creating disaster via API: {payload}")
        
        response = requests.post(
            DISASTER_API_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=3000
        )
        response.raise_for_status()
        
        result = response.json()
        if result.get("success"):
            disaster_hash = result.get("disasterHash")
            print(f"[API] Disaster created successfully! Hash: {disaster_hash}")
            print(f"[API] Full API response: {result}")
            print(f"[API] Hash type: {type(disaster_hash)}")
            return disaster_hash
        else:
            print(f"[API] API returned error: {result.get('error')}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to create disaster via API: {e}")
        return None

def get_recent_disaster():
    """Fetch the most recent global disaster using GPT-4o with web search enabled"""
    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # System prompt for structured JSON-style output
        system_prompt = (
            "You are a helpful assistant that finds the most recent natural or human-made disaster "
            "in the world using up-to-date web search. "
            "Respond STRICTLY in the following JSON format:\n\n"
            "{\n"
            '  "title": "short title of the disaster",\n'
            '  "description": "concise summary within 150 characters",\n'
            '  "readmore": "URL to read more",\n'
            '  "location": "place or country where the disaster occurred"\n'
            "}\n\n"
            "MOST IMPORTANT: The output should NEVER have words like ```json and so on. Just the JSON styled output in the specified format should be present"
            "NOTE: The entire content including the title, description, readmore and location should be within 200 characters"
            "Do not include anything else outside this JSON structure."
        )

        # Perform GPT web search
        completion = client.chat.completions.create(
            model="gpt-4o-search-preview",
            max_completion_tokens=500,
            web_search_options={},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Find the most recent natural disaster in the world"},
            ],
        )

        message = completion.choices[0].message
        content = message.content or "No content returned."
        
        print("\nDisaster Info:\n", content)
        return content
        
    except Exception as e:
        print(f"[ERROR] Failed to fetch disaster: {e}")
        return None

def run_disaster_flow():
    # Step 1: Get recent disaster using integrated search functionality
    print("\n🔍 Fetching recent disaster...")
    disaster_json = get_recent_disaster()
    
    if disaster_json is None:
        print("[ERROR] Could not fetch disaster data, exiting...")
        return

    # Parse JSON disaster output
    try:
        disaster_data = json.loads(disaster_json)
        title = disaster_data.get("title", "").strip()
        description = disaster_data.get("description", "").strip()
        read_more = disaster_data.get("readmore", "").strip()
        location = disaster_data.get("location", "").strip()
        
        print(f"\nParsed disaster data:")
        print(f"Title: {title}")
        print(f"Description: {description}")
        print(f"Read More: {read_more}")
        print(f"Location: {location}")
        
    except json.JSONDecodeError as e:
        print(f"[ERROR] Failed to parse disaster JSON: {e}")
        print("Falling back to line-by-line parsing...")
        # Fallback to original parsing method
        lines = disaster_json.split('\n')
        title = lines[0].replace("Title: ", "").strip() if len(lines) > 0 else "Unknown Disaster"
        description = lines[1].replace("Description: ", "").strip() if len(lines) > 1 else "No description available"
        read_more = lines[2].replace("Read More: ", "").strip() if len(lines) > 2 else ""
        location = lines[3].replace("Disaster Location: ", "").strip() if len(lines) > 3 else "Unknown Location"

    # Step 2: Get bounding box using disaster description
    bbox_client = OpenAI(
        base_url="https://api.mosaia.ai/v1/agent",
        api_key=os.getenv("bboxagent")
    )

    bbox_response = bbox_client.chat.completions.create(
        model="6864d6cbca5744854d34c998",
        messages=[{"role": "user", "content": f"🚨 **{title}** 🚨 {description} 🔗 [Read more]({read_more})"}],
    )

    bbox_output = bbox_response.choices[0].message.content.strip()
    print("\nBBox:\n", bbox_output)

    # Step 3: Get weather data
    weather_client = OpenAI(
        base_url="https://api.mosaia.ai/v1/agent",
        api_key=os.getenv("weatheragent")
    )

    weather_response = weather_client.chat.completions.create(
        model="6864dd95ade4d61675d45e4d",
        messages=[{"role": "user", "content": f"```json\n{bbox_output}\n```"}],
    )

    weather_data = weather_response.choices[0].message.content.strip()
    print("\nWeather:\n", weather_data)

    # Step 4: Financial analysis
    analysis_client = OpenAI(
        base_url="https://api.mosaia.ai/v1/agent",
        api_key=os.getenv("analysisagent")
    )

    analysis_input = f"🌧️ **{title}**\n{description}\n\n[Read more]({read_more})\n\n{weather_data}"
    analysis_response = analysis_client.chat.completions.create(
        model="6866162ee2d11c774d448a27",
        messages=[{"role": "user", "content": analysis_input}],
    )

    analysis_output = analysis_response.choices[0].message.content.strip()
    print("\nAnalysis:\n", analysis_output)

    # Step 5: Parse amount (keep USD amount as is)
    amount_match = re.search(r"AMOUNT:\s*[\$]?(?P<amount>[\d,]+)", analysis_output)
    amount_required = amount_match.group("amount").replace(",", "") if amount_match else "Unknown"

    print(f"\nAmount required in USD: ${amount_required}")

    # Step 5.1: Create disaster via API and get disaster hash
    contract_disaster_hash = None
    if amount_required != "Unknown":
        try:
            # Get current VET price
            vet_price_usd = get_vet_price()
            if vet_price_usd is None:
                print("[ERROR] Could not get VET price, skipping disaster creation")
            else:
                # Convert USD to VET
                target_amount_vet = convert_usd_to_vet(amount_required, vet_price_usd)
                if target_amount_vet is None:
                    print("[ERROR] Could not convert USD to VET, skipping disaster creation")
                else:
                    # Create disaster via API
                    contract_disaster_hash = create_disaster_via_api(title, description, target_amount_vet)
                    if contract_disaster_hash:
                        print(f"[API] Disaster hash from API: {contract_disaster_hash}")
                    else:
                        print("[API] Could not create disaster via API")
        except Exception as e:
            print(f"[ERROR] API interaction failed: {e}")

    # Step 6: Construct tweet
    tweet_text = (
        f"🚨 {title} 🚨\n\n"
        f"📝 {description}\n\n"
        f"💸 Amount required: ${amount_required}\n\n"
        f"🔗 Read more: {read_more}"
    )

    print("\nTweet:\n", tweet_text)

    # Step 7: Post to Twitter
    tweet_client = OpenAI(
        base_url="https://api.mosaia.ai/v1/agent",
        api_key=os.getenv("tweetagent")
    )

    tweet_response = tweet_client.chat.completions.create(
        model="6864e70f77520411d032518a",
        messages=[{"role": "user", "content": f'post this content on twitter "{tweet_text}"'}],
    )

    print("\nTwitter Response:\n", tweet_response.choices[0].message.content)

    # Step 8: Store in DynamoDB
    aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    aws_region = os.getenv("AWS_REGION")

    dynamodb = boto3.resource(
        'dynamodb',
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        region_name=aws_region
    )

    table = dynamodb.Table("gods-hand-events")

    # Use contract_disaster_hash if available
    final_disaster_hash = contract_disaster_hash if contract_disaster_hash else hashlib.sha256((title + location).encode()).hexdigest()

    # Create a unique hash and timestamp
    unique_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')

    # Log values before insertion
    print("\nLogging values before DB insert:")
    print("Title:", title)
    print("Description:", description)
    print("Read More:", read_more)
    print("Location:", location)
    print("Amount Required:", amount_required)
    print("Hash:", final_disaster_hash)
    print("ID:", unique_id)
    print("Created At:", created_at)

    # Include all required fields
    dynamodb_item = {
        "id": unique_id,
        "title": title,
        "description": description,
        "source": read_more,
        "disaster_location": location,
        "estimated_amount_required": amount_required,
        "disaster_hash": final_disaster_hash,
        "created_at": created_at
    }

    # Insert into DynamoDB
    table.put_item(Item=dynamodb_item)
    print("\n✅ DynamoDB entry added successfully.")

if __name__ == "__main__":
    while True:
        try:
            run_disaster_flow()
        except Exception as e:
            print(f"[ERROR] Exception in disaster flow: {e}")
        print("\n[INFO] Sleeping for 1 hour before next run...\n")
        time.sleep(3600)
