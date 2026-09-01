## Project Summary

Hive LP index token, first run by a bot and then smart contracts

## Token Description

The HINDEX token is a decentralized index token representing a portfolio of Hive Engine’s most active and liquid tokens paired with SWAP.HIVE. Its value is directly tied to the portfolio’s holdings, which are dynamically rebalanced to maintain equal allocations among the top tokens selected based on liquidity and 30-day volume. Each HINDEX token represents a proportional share of the portfolio, with its Net Asset Value (NAV) determined entirely in SWAP.HIVE. Users can redeem HINDEX tokens through the HINDEX:SWAP.HIVE liquidity pool, where pricing is determined by the pool’s constant product formula, ensuring a fair and transparent valuation.

HINDEX offers a seamless way for users to gain diversified exposure to Hive Engine’s ecosystem. By holding HINDEX, users indirectly benefit from the portfolio’s performance without needing to manage individual token positions or liquidity pools. The portfolio is managed automatically, with rebalancing triggered whenever the HINDEX price deviates by more than 0.5% from its NAV. This rebalancing process ensures that the HINDEX:SWAP.HIVE pool remains liquid and accurately reflects the portfolio’s value, making HINDEX a stable and reliable tool for both passive exposure and active trading within the Hive Engine ecosystem.

## Bot Description
The HINDEX bot is designed to maintain and manage an index token, HINDEX, that represents a portfolio of Hive Engine tokens paired with SWAP.HIVE. The bot dynamically determines the top tokens to include in the portfolio based on liquidity and 30-day volume, selecting the most active and liquid tokens to ensure portfolio stability. These tokens are held in liquidity pools paired with SWAP.HIVE, and their combined value determines the Net Asset Value (NAV) of HINDEX. The HINDEX:SWAP.HIVE liquidity pool provides users with a decentralized mechanism for swapping HINDEX directly for SWAP.HIVE, ensuring fair pricing and liquidity.

The bot operates by continuously monitoring the HINDEX:SWAP.HIVE pool to ensure its price reflects the portfolio's NAV. If the pool's price deviates by more than 0.5% from the NAV, the bot triggers a rebalancing process. During rebalancing, the bot withdraws a proportional amount of SWAP.HIVE and paired tokens from the portfolio's liquidity pools. It then swaps some paired tokens back into SWAP.HIVE and deposits the necessary SWAP.HIVE into the HINDEX:SWAP.HIVE pool to replenish liquidity and align the price with NAV. This mechanism maintains the integrity of HINDEX as a reliable representation of the underlying portfolio while ensuring users can redeem tokens seamlessly.
## Demo Script
```python
import time
from typing import Dict, List

# Simulated functions for Hive Engine interactions
# Replace with actual API calls or library methods
def get_liquidity_pool_data(pair: str) -> Dict[str, float]:
    """
    Fetches data for a given liquidity pool.
    Returns a dictionary with reserves for both tokens.
    """
    # Example response: {"token1_reserve": 1000.0, "token2_reserve": 500.0}
    pass

def swap_tokens(pair: str, amount: float, token: str):
    """
    Swaps a specific amount of a token in a liquidity pool.
    """
    pass

def deposit_to_pool(pair: str, token1_amount: float, token2_amount: float):
    """
    Adds liquidity to a given pool.
    """
    pass

def withdraw_from_pool(pair: str, percentage: float):
    """
    Withdraws a percentage of liquidity from a given pool.
    """
    pass

def calculate_nav(portfolio: Dict[str, Dict[str, float]], hindex_supply: float) -> float:
    """
    Calculates the NAV per HINDEX token based on the portfolio's SWAP.HIVE value.
    """
    total_value_hive = sum(
        pool["hive_reserve"] * 2 for pool in portfolio.values()
    )
    return total_value_hive / hindex_supply

def get_top_tokens_by_criteria(liquidity_data: List[Dict[str, float]], volume_data: List[Dict[str, float]], top_n: int) -> List[str]:
    """
    Determines the top tokens to include in the portfolio based on liquidity and volume criteria.
    """
    combined_data = []
    for liquidity, volume in zip(liquidity_data, volume_data):
        token = liquidity["pair"]
        combined_score = liquidity["liquidity"] + volume["volume"]
        combined_data.append({"token": token, "score": combined_score})

    # Sort by combined score and select top_n tokens
    top_tokens = sorted(combined_data, key=lambda x: x["score"], reverse=True)[:top_n]
    return [entry["token"] for entry in top_tokens]

# Configuration
REBALANCE_THRESHOLD = 0.005  # 0.5%
PORTFOLIO_PAIRS = []  # Will be dynamically determined
HINDEX_POOL = "HINDEX:SWAP.HIVE"
HINDEX_SUPPLY = 10000.0  # Total supply of HINDEX tokens
TOP_N_TOKENS = 10

# Main Bot Loop
def hindex_bot():
    """Main loop for monitoring and rebalancing."""
    portfolio = {}

    while True:
        # Step 1: Determine the top tokens for the portfolio
        liquidity_data = []  # Fetch liquidity data for all pools
        volume_data = []  # Fetch volume data for all pools
        PORTFOLIO_PAIRS.clear()
        PORTFOLIO_PAIRS.extend(get_top_tokens_by_criteria(liquidity_data, volume_data, TOP_N_TOKENS))

        # Step 2: Fetch portfolio and HINDEX pool data
        for pair in PORTFOLIO_PAIRS:
            portfolio[pair] = get_liquidity_pool_data(pair)
        hindex_pool_data = get_liquidity_pool_data(HINDEX_POOL)

        # Step 3: Calculate NAV and HINDEX price
        nav_per_hindex = calculate_nav(portfolio, HINDEX_SUPPLY)
        hindex_price = hindex_pool_data["hive_reserve"] / hindex_pool_data["hindex_reserve"]

        # Step 4: Check if rebalancing is needed
        price_deviation = abs(hindex_price - nav_per_hindex) / nav_per_hindex
        if price_deviation > REBALANCE_THRESHOLD:
            print("Rebalancing triggered.")

            # Step 5: Replenish HINDEX pool (withdraw from portfolio LPs)
            shortfall = nav_per_hindex - hindex_price
            shortfall_hive = shortfall * hindex_pool_data["hindex_reserve"]

            for pair in PORTFOLIO_PAIRS:
                withdraw_amount = shortfall_hive / len(PORTFOLIO_PAIRS)  # Equal distribution
                withdraw_from_pool(pair, withdraw_amount / portfolio[pair]["hive_reserve"])

                # Swap paired tokens back to SWAP.HIVE if necessary
                paired_token = pair.split(":")[1]
                swap_tokens(pair, withdraw_amount, paired_token)

            # Step 6: Deposit replenished funds back to HINDEX pool
            deposit_to_pool(HINDEX_POOL, shortfall_hive, shortfall_hive / nav_per_hindex)

        # Step 7: Sleep before the next iteration
        time.sleep(60)  # Check every 60 seconds

if __name__ == "__main__":
    hindex_bot()

```

## Smart Contracts

The HINDEX smart contracts manage the token and its portfolio entirely on-chain, ensuring transparency, automation, and decentralization. The contracts collectively facilitate the creation, management, and redemption of the HINDEX token while dynamically maintaining its value. The **Portfolio Management Contract** tracks the holdings of the portfolio across selected liquidity pools, selecting the top tokens based on liquidity and trading volume to ensure alignment with the most active assets. This contract automatically updates the portfolio's composition and maintains a balance among the selected tokens.

The **Rebalancing Contract** monitors the HINDEX:SWAP.HIVE liquidity pool to compare the HINDEX price to its Net Asset Value (NAV), which is calculated based on the portfolio’s combined value in SWAP.HIVE. If the HINDEX price deviates significantly (e.g., by more than 0.5%) from the NAV, the contract automatically adjusts by withdrawing or depositing funds across the portfolio's liquidity pools. This ensures the HINDEX:SWAP.HIVE pool remains sufficiently funded and aligned with the portfolio’s value. All rebalancing operations occur via decentralized token swaps within the liquidity pools, maintaining fair pricing and reducing manual interventions.

Together, these smart contracts provide a fully decentralized and automated system for managing HINDEX, allowing users to gain exposure to a diverse portfolio of Hive Engine tokens while relying on the contracts to handle rebalancing and liquidity management. By operating entirely through on-chain logic, the system ensures transparency and aligns with the decentralized ethos of the Hive ecosystem.


# HINDEX Bot and Smart Contract Transition Plan

## Overview
The HINDEX project introduces an index token backed by a portfolio of Hive Engine tokens paired with SWAP.HIVE. The token’s value is directly tied to the portfolio's holdings, dynamically maintained through automated rebalancing and portfolio management. Initially, a Python-based bot will demonstrate the mechanics, ensuring the system is robust before transitioning to on-chain smart contracts for full decentralization and automation.

---

## Features
- **Dynamic Portfolio Management**: Selects top tokens based on liquidity and 30-day volume.
- **Net Asset Value (NAV) Alignment**: HINDEX token value remains tied to the portfolio’s SWAP.HIVE holdings.
- **Automated Rebalancing**: Maintains alignment with NAV by adjusting liquidity pools.
- **Transparent Redemptions**: Users can redeem HINDEX for SWAP.HIVE via a liquidity pool.

---

## Roadmap

### Phase 1: Bot Development
1. **Design and Implement Bot**
   - Build a Python bot to manage a mock HINDEX token and portfolio.
   - Implement key features:
     - NAV calculation.
     - Token selection based on liquidity and volume.
     - Automated rebalancing logic.
   - Use simulated liquidity pools and token swaps.

2. **Testing and Validation**
   - Test the bot under various scenarios:
     - High redemption demand.
     - Price fluctuations in portfolio tokens.
     - Changes in token rankings by liquidity/volume.
   - Refine logic based on test results.

3. **Demonstration**
   - Showcase the bot’s functionality using a mock token and LPs.
   - Validate that HINDEX stays backed by the portfolio’s value.

### Phase 2: Smart Contract Prototyping
1. **Define Smart Contract Architecture**
   - **Portfolio Management Contract**: Tracks portfolio holdings and rebalances liquidity.
   - **Rebalancing Contract**: Monitors HINDEX price and triggers adjustments.
   - **HINDEX Issuance Contract**: Manages token creation and initial liquidity setup.

2. **Implement on Testnet**
   - Translate the bot’s logic into Solidity or another suitable language.
   - Deploy contracts on a testnet for iterative development.

3. **Simulate Real Scenarios**
   - Stress-test contracts under edge cases identified during bot testing.
   - Validate on-chain operations: token issuance, redemption, and rebalancing.

4. **Auditing and Optimization**
   - Perform security and performance audits.
   - Optimize gas costs and transaction efficiency.

### Phase 3: Mainnet Deployment
1. **Deploy Smart Contracts**
   - Launch the finalized contracts on the Hive blockchain or another compatible platform.

2. **Migration from Bot**
   - Transition existing HINDEX holders and liquidity to the new system.
   - Ensure seamless migration with clear communication to stakeholders.

3. **Launch and Monitor**
   - Activate the system and monitor its performance.
   - Address any post-launch issues promptly.

---

## How It Works
1. **Token Issuance**:
   - HINDEX tokens are distributed via a presale, with proceeds used to fund the portfolio’s liquidity pools.
   - A HINDEX:SWAP.HIVE liquidity pool is created for token redemption.

2. **Portfolio Management**:
   - The bot (or smart contracts) selects top tokens by liquidity and volume, allocating funds equally across their SWAP.HIVE pairs.

3. **Rebalancing**:
   - The system monitors the HINDEX:SWAP.HIVE pool and compares the token’s price to its NAV.
   - If the price deviates by more than 0.5%, the portfolio is rebalanced by withdrawing or depositing funds in liquidity pools.

4. **Redemption**:
   - Users redeem HINDEX for SWAP.HIVE through the HINDEX:SWAP.HIVE pool, with pricing determined by the pool’s reserves.

---

## Future Goals
- Expand token selection criteria to include additional metrics, such as stability and long-term performance.
- Develop a governance mechanism for HINDEX holders to vote on portfolio composition.
- Explore cross-chain functionality to integrate with other ecosystems.

---

## Contributions
Contributions to the project are welcome! Please reach out if you have expertise in:
- Python development for DeFi bots.
- Smart contract development and auditing.
- Hive Engine or related blockchain ecosystems.

---

## Contact
For more information, please contact the project team or join our development community.
