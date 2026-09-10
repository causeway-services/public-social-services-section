---
title: "MUD Framework Architecture: Entity Component Systems on Ethereum"
description: "Technical deep dive into MUD's architecture—the World contract, Store, Tables, Systems, and how it implements the ECS pattern for fully on-chain applications. Covers data encoding, access control, and state separation principles."
date-created: 2026-04-05
domain: blockchain-games
subjects:
  - mud-framework
  - entity-component-system
  - on-chain-state
  - solidity-architecture
  - game-engine
sources:
  - title: "What is MUD? – MUD"
    url: "https://mud.dev/what-is-mud"
  - title: "MUD from zero to v2"
    url: "https://lattice.xyz/blog/mud-zero-to-v2"
  - title: "Tables – MUD"
    url: "https://mud.dev/world/tables"
  - title: "Encoding – MUD"
    url: "https://mud.dev/store/encoding"
  - title: "Systems – MUD"
    url: "https://mud.dev/world/systems"
  - title: "Store hooks – MUD"
    url: "https://mud.dev/store/store-hooks"
  - title: "Account delegation – MUD"
    url: "https://mud.dev/world/account-delegation"
  - title: "How MUD models data – MUD"
    url: "https://mud.dev/store/data-model"
  - title: "MUD: An engine for Autonomous Worlds"
    url: "https://lattice.xyz/blog/mud-an-engine-for-autonomous-worlds"
  - title: "Unleashing the Potential of Onchain Web3 Gaming: Exploring MUD Framework"
    url: "https://medium.com/coinmonks/unleashing-the-potential-of-onchain-web3-gaming-exploring-mud-framework-1dadb57dbdad"
---

## MUD Framework Architecture

MUD is a framework for building multichain on-chain applications on any EVM-compatible blockchain. Its core innovation is applying the Entity Component System (ECS) architectural pattern—long established in game development—to Solidity smart contracts, with a central data storage layer that separates state from logic.

The framework consists of two main layers: **Store**, the low-level data storage engine with custom encoding, and **World**, which builds on Store to add access control, system registration, and delegation. Together, they enable developers to build complex, upgradeable on-chain applications where third-party developers can extend without forking.

## The Store: Custom-Encoded On-Chain Storage

Store is MUD's foundational data layer. It replaces Solidity's native storage model with a custom-encoded key-value database optimized for gas efficiency and dynamic table registration.

### Why Custom Encoding?

Standard Solidity storage pads every value to 32 bytes (one storage slot), regardless of actual size. MUD's encoding scheme is tightly packed, similar to `abi.encodePacked` but with critical differences:

- **Array elements are tightly packed without padding.** An `address[3]` (96 bytes) uses only 2 storage slots in MUD instead of 3 in standard Solidity—a 33% reduction.
- **Dynamic field lengths pack into a single slot.** Tables can have up to 5 dynamic fields; their lengths all fit in one storage slot. In standard Solidity, each length requires its own slot.
- **Static fields are size-aware.** Bytes1 and uint8 occupy 1 byte each, not 32 bytes.

This encoding is essential because on-chain games can have millions of entities with frequent state updates. Storage cost is the primary gas expense; tighter encoding directly enables larger games.

### Schema Definition

Every table has two schema definitions, both encoded as bytes32:

1. **Key schema**: Composite key fields (up to 28 static-length types). Dynamic types are not allowed in keys because keys are used for lookups.
2. **Value schema**: Data columns (up to 28 fields total, up to 5 dynamic). This is everything not in the key.

Each schema encoding stores:
- Total byte length of all static-length fields
- Number of static-length fields
- Number of dynamic-length fields
- Up to 28 column type identifiers

Once a table schema is registered, it is immutable. If new fields are needed, a new table must be created with the same key schema plus new value fields.

### Table Libraries and Type Wrapping

Store automatically generates a library for each table that acts as a type wrapper. These libraries provide strongly-typed getter and setter functions that:

1. Take native Solidity types as parameters
2. Encode them using Store's encoding scheme
3. Pass them to Store's low-level methods
4. Decode results before returning

This shields developers from MUD's encoding details while maintaining gas efficiency.

### Dynamic Table Registration

Unlike Solidity, which requires storage types to be known at compile time, Store allows new tables with arbitrary schemas to be registered after deployment. This enables:

- Third-party systems to add new tables without modifying core contracts
- Progressive feature addition to live worlds
- Composability: different developers can add different game mechanics

## The World: Kernelized Access Control

World extends Store and adds three critical abstractions:

1. **Namespaces** — organizational boundaries for tables and systems
2. **Access control** — programmable rules for who can read/write what
3. **System routing** — entry point that dispatches calls to stateless logic contracts

### Namespaces

Tables and Systems are registered in a namespace, like a filesystem path (e.g., `/mudswap/BalanceTable`). Namespaces serve two purposes:

- **Organization** — group related tables and systems
- **Access control** — by default, a System has write access only to tables in its own namespace

A System in namespace `/game/` can read any table in the world (reads are permissionless), but can only write to tables under `/game/`. This prevents unintended cross-system interference while allowing transparent observation.

### Access Control Architecture

The World performs all access checks before dispatching to Systems. If a request is authorized, it forwards the call to the appropriate System. Otherwise, it reverts. This means:

- Systems never need to duplicate access control logic
- Access rules can be changed without modifying Systems
- Different Systems can share the same data with different permissions

The framework includes delegation primitives so that any entity (a human wallet, a DAO, or a contract) can authorize another account to perform actions on its behalf. This enables client-side account abstraction: users can approve a contract to handle gas, signatures, and batching while maintaining custody.

### The Stateless System Pattern

All logic in a MUD world lives in stateless System contracts. A System:

- Has zero internal state
- Reads and writes only to World tables
- Is called through the World, never directly
- Can be upgraded by redeploying and re-registering under the same route

This statelessness provides massive benefits:

- **Upgradability**: Redeploy a System and the World automatically routes all calls to the new version.
- **Composability**: Multiple Systems can operate on the same tables without state conflicts.
- **Auditability**: All state changes flow through World's access layer.

For example, a "heal" action in an RPG reads a Player table, updates its health, and calls hooks—all through World table reads/writes. If the healing calculation logic needs to change, deploy a new System and re-register it. Old client code continues to work; the World routes all calls to the new logic.

## Separation of Concerns: State vs. Logic

The core architectural principle is strict separation:

- **State lives in Tables (Components)** — immutable schema, key-value organized, globally readable
- **Logic lives in Systems** — stateless, namespace-scoped write access, handles all mutations

This mirrors the ECS pattern from game development but adapted for blockchain:

- **Entities**: Composite keys in tables (e.g., a player identified by address)
- **Components**: Table columns (e.g., health, position, inventory)
- **Systems**: Smart contract functions operating on Components (e.g., takeDamage, move)

The separation enables:

1. **Orthogonal persistence** — data outlives code; Systems are upgradeability without loss
2. **Composability** — Systems operate on public data; new Systems can be added without changing old ones
3. **Determinism** — all state is on-chain and cryptographically verifiable
4. **Permissionless extension** — anyone can add new Systems if they control a namespace

## Store Hooks: Observer Pattern for State Changes

Store implements the observer pattern. Any contract can register as a hook on a table to react to state changes (SetRecord, SpliceStaticData, SpliceDynamicData).

A hook contract implements the `IStoreHook` interface and is called either:

- **Before** a write (onBeforeSetRecord, etc.) — can revert to block invalid changes
- **After** a write (onAfterSetRecord, etc.) — can trigger side effects

Hooks are registered with a bitmap that specifies which operations trigger them and whether they run before or after. Common uses:

- Validation hooks that enforce invariants
- Reactive hooks that update derived data
- Event hooks that emit high-level game events

This allows complex business logic to be layered on top of core state mutations without baking it into Systems.

## Version 2: Addressing V1 Limitations

MUD v1 had three foundational problems that v2 solves:

### Problem 1: Inefficient Data Encoding

V1 used `abi.encode`, which applied Solidity's 32-byte padding to every field plus 32 bytes of metadata. Events and storage were bloated. V2's custom encoding (described above) reduced on-chain data footprint dramatically.

### Problem 2: Fragmented State Architecture

V1 treated each Component as its own contract, and Systems were called directly by clients. There was no central place to put shared logic like access control. V2 introduced the World contract as a single kernel that mediates all state access and provides hooks, delegation, and upgrades.

### Problem 3: Limited Developer Experience for Third-Party Extension

V1 made it difficult for third-party developers to extend an existing world. V2's permissionless namespace system and automatic event emission for offchain indexing make it easy: deploy a new System and table under your namespace, and the indexer picks up your changes automatically. No forking required.

## Comparison to Traditional ECS

Traditional game engines (Bevy, Unity DOTS, Unreal) use ECS for performance: components are laid out in memory for cache locality, and systems iterate over entities matching a query pattern.

MUD's ECS differs because it runs on Ethereum:

- **Tables are sparse key-value stores, not dense arrays.** You query by key, not by iterating.
- **All access is mediated by World contract calls.** No direct memory access.
- **Gas is the performance metric.** Optimization is about storage cost and computation per transaction, not CPU cache efficiency.
- **Determinism and auditability are harder requirements** than raw speed.

MUD's ECS is thus a translation of the pattern to a constrained execution model. The fundamental principle—separation of state from logic, composition over inheritance—is preserved. But the concrete implementation reflects blockchain constraints.

## Indexers: Off-Chain State Mirrors

MUD emits events for every table write operation. Off-chain indexers listen to these events and maintain SQL databases that mirror the on-chain state.

For small games, the client can fetch all state directly from the Store contract. For large games (millions of entities), this is infeasible. Indexers solve this by:

1. Listening to all Store_SetRecord, Store_SpliceStaticData, etc. events
2. Maintaining a SQL database with the same schema as the on-chain tables
3. Exposing a query API (MUD QDSL or tRPC) so clients can fetch subsets of data

The client still authorizes transactions and signs them; the indexer is just a read replica. This enables O(1) lookups and filtering without hitting the on-chain database.

---

## See Also

- [Autonomous Worlds](../autonomous-worlds.md) — the conceptual vision that MUD enables
- [Entity Component System](../terms/entity-component-system.md) — the foundational pattern
- [Dark Forest](./dark-forest-zero-knowledge-games.md) — the pioneering on-chain game that influenced MUD's design
- [OPCraft and Sky Strife](./mud-games.md) — games built on MUD demonstrating its capabilities
