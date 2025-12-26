//! Property-based tests for the option-registry contract
//!
//! These tests verify the correctness properties defined in the design document:
//! - Property 1: Option Creation Persistence
//! - Property 2: Option Count Monotonicity
//! - Property 3: Exercise Idempotence
//! - Property 4: Storage Key Uniqueness

use casper_engine_test_support::{
    ExecuteRequestBuilder, InMemoryWasmTestBuilder, DEFAULT_ACCOUNT_ADDR,
    DEFAULT_RUN_GENESIS_REQUEST, PRODUCTION_RUN_GENESIS_REQUEST,
};
use casper_execution_engine::storage::global_state::in_memory::InMemoryGlobalState;
use casper_types::{
    account::AccountHash, runtime_args, ContractHash, Key, RuntimeArgs, U256, U512,
};
use proptest::prelude::*;
use std::path::PathBuf;

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const CONTRACT_WASM: &str = "option-registry.wasm";
const CONTRACT_KEY: &str = "option_registry";
const OPTION_COUNT_KEY: &str = "option_count";

// Entry points
const ENTRY_POINT_CREATE_OPTION: &str = "create_option";
const ENTRY_POINT_EXERCISE_OPTION: &str = "exercise_option";

// Arguments
const ARG_ID: &str = "id";
const ARG_STRIKE_PRICE: &str = "strike_price";
const ARG_EXPIRY: &str = "expiry";

/// Get the path to the compiled WASM file
fn get_wasm_path() -> PathBuf {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("..");
    path.push("option-registry");
    path.push("target");
    path.push("wasm32-unknown-unknown");
    path.push("release");
    path.push(CONTRACT_WASM);
    path
}

// ============================================================================
// TEST HELPERS
// ============================================================================

/// Creates a new test builder with the contract installed
fn setup_contract() -> InMemoryWasmTestBuilder {
    let mut builder = InMemoryWasmTestBuilder::default();
    builder.run_genesis(&DEFAULT_RUN_GENESIS_REQUEST).commit();

    // Install the contract
    let install_request = ExecuteRequestBuilder::standard(
        *DEFAULT_ACCOUNT_ADDR,
        &get_wasm_path().to_string_lossy(),
        RuntimeArgs::new(),
    )
    .build();

    builder.exec(install_request).expect_success().commit();
    builder
}

/// Gets the contract hash from the builder
fn get_contract_hash(builder: &InMemoryWasmTestBuilder) -> ContractHash {
    builder
        .get_expected_account(*DEFAULT_ACCOUNT_ADDR)
        .named_keys()
        .get(CONTRACT_KEY)
        .expect("Contract not found")
        .into_hash()
        .map(ContractHash::new)
        .expect("Invalid contract hash")
}

/// Gets the option count from contract storage
fn get_option_count(builder: &InMemoryWasmTestBuilder, contract_hash: ContractHash) -> u64 {
    let contract = builder
        .get_contract(contract_hash)
        .expect("Contract not found");
    
    let count_key = contract
        .named_keys()
        .get(OPTION_COUNT_KEY)
        .expect("Option count key not found");
    
    builder
        .query(None, *count_key, &[])
        .expect("Failed to query option count")
        .as_cl_value()
        .expect("Not a CLValue")
        .clone()
        .into_t::<u64>()
        .expect("Failed to parse as u64")
}

/// Creates an option via the contract
fn create_option(
    builder: &mut InMemoryWasmTestBuilder,
    contract_hash: ContractHash,
    id: u64,
    strike_price: U256,
    expiry: u64,
) {
    let create_request = ExecuteRequestBuilder::contract_call_by_hash(
        *DEFAULT_ACCOUNT_ADDR,
        contract_hash,
        ENTRY_POINT_CREATE_OPTION,
        runtime_args! {
            ARG_ID => id,
            ARG_STRIKE_PRICE => strike_price,
            ARG_EXPIRY => expiry,
        },
    )
    .build();

    builder.exec(create_request).expect_success().commit();
}

/// Exercises an option via the contract
fn exercise_option(
    builder: &mut InMemoryWasmTestBuilder,
    contract_hash: ContractHash,
    id: u64,
) {
    let exercise_request = ExecuteRequestBuilder::contract_call_by_hash(
        *DEFAULT_ACCOUNT_ADDR,
        contract_hash,
        ENTRY_POINT_EXERCISE_OPTION,
        runtime_args! {
            ARG_ID => id,
        },
    )
    .build();

    builder.exec(exercise_request).expect_success().commit();
}

/// Checks if an option exists in storage
fn option_exists(
    builder: &InMemoryWasmTestBuilder,
    account: AccountHash,
    id: u64,
) -> bool {
    let key_name = format!("option_{}", id);
    builder
        .get_expected_account(account)
        .named_keys()
        .contains_key(&key_name)
}

/// Checks if an option is exercised
fn is_option_exercised(
    builder: &InMemoryWasmTestBuilder,
    account: AccountHash,
    id: u64,
) -> bool {
    let key_name = format!("option_{}_exercised", id);
    if let Some(key) = builder
        .get_expected_account(account)
        .named_keys()
        .get(&key_name)
    {
        builder
            .query(None, *key, &[])
            .ok()
            .and_then(|v| v.as_cl_value().cloned())
            .and_then(|v| v.into_t::<bool>().ok())
            .unwrap_or(false)
    } else {
        false
    }
}

// ============================================================================
// PROPERTY-BASED TESTS
// ============================================================================

proptest! {
    #![proptest_config(ProptestConfig::with_cases(100))]

    /// **Feature: casper-options-hybrid, Property 1: Option Creation Persistence**
    /// 
    /// *For any* valid option parameters (id, strike_price, expiry), when `create_option`
    /// is called, the option data SHALL be queryable from contract storage.
    /// 
    /// **Validates: Requirements 2.1, 2.4**
    #[test]
    fn prop_option_creation_persistence(
        id in 0u64..1000000,
        strike_price in 0u128..u128::MAX,
        expiry in 0u64..u64::MAX,
    ) {
        let mut builder = setup_contract();
        let contract_hash = get_contract_hash(&builder);
        
        // Create the option
        create_option(
            &mut builder,
            contract_hash,
            id,
            U256::from(strike_price),
            expiry,
        );
        
        // Verify option exists in storage
        prop_assert!(
            option_exists(&builder, *DEFAULT_ACCOUNT_ADDR, id),
            "Option {} should exist after creation",
            id
        );
    }

    /// **Feature: casper-options-hybrid, Property 2: Option Count Monotonicity**
    /// 
    /// *For any* sequence of `create_option` calls, the `option_count` value SHALL
    /// increase by exactly 1 after each successful call.
    /// 
    /// **Validates: Requirements 4.2**
    #[test]
    fn prop_option_count_monotonicity(
        num_options in 1usize..10,
    ) {
        let mut builder = setup_contract();
        let contract_hash = get_contract_hash(&builder);
        
        // Initial count should be 0
        let initial_count = get_option_count(&builder, contract_hash);
        prop_assert_eq!(initial_count, 0, "Initial option count should be 0");
        
        // Create multiple options and verify count increases
        for i in 0..num_options {
            let expected_count = i as u64;
            let current_count = get_option_count(&builder, contract_hash);
            prop_assert_eq!(
                current_count,
                expected_count,
                "Option count should be {} before creating option {}",
                expected_count,
                i
            );
            
            create_option(
                &mut builder,
                contract_hash,
                i as u64,
                U256::from(1000u64),
                1735689600u64,
            );
            
            let new_count = get_option_count(&builder, contract_hash);
            prop_assert_eq!(
                new_count,
                expected_count + 1,
                "Option count should be {} after creating option {}",
                expected_count + 1,
                i
            );
        }
    }

    /// **Feature: casper-options-hybrid, Property 3: Exercise Idempotence**
    /// 
    /// *For any* option ID, calling `exercise_option` multiple times SHALL result
    /// in the same final state (option marked as exercised).
    /// 
    /// **Validates: Requirements 3.1, 3.2**
    #[test]
    fn prop_exercise_idempotence(
        id in 0u64..1000000,
        num_exercises in 1usize..5,
    ) {
        let mut builder = setup_contract();
        let contract_hash = get_contract_hash(&builder);
        
        // Create the option first
        create_option(
            &mut builder,
            contract_hash,
            id,
            U256::from(1000u64),
            1735689600u64,
        );
        
        // Exercise multiple times
        for _ in 0..num_exercises {
            exercise_option(&mut builder, contract_hash, id);
            
            // Verify option is exercised after each call
            prop_assert!(
                is_option_exercised(&builder, *DEFAULT_ACCOUNT_ADDR, id),
                "Option {} should be exercised",
                id
            );
        }
    }

    /// **Feature: casper-options-hybrid, Property 4: Storage Key Uniqueness**
    /// 
    /// *For any* two distinct option IDs, their storage keys SHALL be distinct
    /// and non-overlapping.
    /// 
    /// **Validates: Requirements 2.2**
    #[test]
    fn prop_storage_key_uniqueness(
        id1 in 0u64..1000000,
        id2 in 0u64..1000000,
    ) {
        // Skip if IDs are the same
        prop_assume!(id1 != id2);
        
        let mut builder = setup_contract();
        let contract_hash = get_contract_hash(&builder);
        
        // Create both options
        create_option(
            &mut builder,
            contract_hash,
            id1,
            U256::from(1000u64),
            1735689600u64,
        );
        
        create_option(
            &mut builder,
            contract_hash,
            id2,
            U256::from(2000u64),
            1735776000u64,
        );
        
        // Verify both options exist independently
        prop_assert!(
            option_exists(&builder, *DEFAULT_ACCOUNT_ADDR, id1),
            "Option {} should exist",
            id1
        );
        prop_assert!(
            option_exists(&builder, *DEFAULT_ACCOUNT_ADDR, id2),
            "Option {} should exist",
            id2
        );
        
        // Verify storage keys are different
        let key1 = format!("option_{}", id1);
        let key2 = format!("option_{}", id2);
        prop_assert_ne!(key1, key2, "Storage keys should be unique");
    }
}

// ============================================================================
// UNIT TESTS (Examples and Edge Cases)
// ============================================================================

#[test]
fn test_contract_installation() {
    let builder = setup_contract();
    let contract_hash = get_contract_hash(&builder);
    
    // Verify contract was installed
    assert!(
        builder.get_contract(contract_hash).is_some(),
        "Contract should be installed"
    );
}

#[test]
fn test_initial_option_count_is_zero() {
    let builder = setup_contract();
    let contract_hash = get_contract_hash(&builder);
    
    let count = get_option_count(&builder, contract_hash);
    assert_eq!(count, 0, "Initial option count should be 0");
}

#[test]
fn test_create_single_option() {
    let mut builder = setup_contract();
    let contract_hash = get_contract_hash(&builder);
    
    create_option(
        &mut builder,
        contract_hash,
        1,
        U256::from(1000000u64),
        1735689600u64,
    );
    
    assert!(
        option_exists(&builder, *DEFAULT_ACCOUNT_ADDR, 1),
        "Option 1 should exist"
    );
    
    let count = get_option_count(&builder, contract_hash);
    assert_eq!(count, 1, "Option count should be 1");
}

#[test]
fn test_exercise_option() {
    let mut builder = setup_contract();
    let contract_hash = get_contract_hash(&builder);
    
    // Create option
    create_option(
        &mut builder,
        contract_hash,
        1,
        U256::from(1000000u64),
        1735689600u64,
    );
    
    // Exercise option
    exercise_option(&mut builder, contract_hash, 1);
    
    assert!(
        is_option_exercised(&builder, *DEFAULT_ACCOUNT_ADDR, 1),
        "Option 1 should be exercised"
    );
}

#[test]
fn test_create_multiple_options() {
    let mut builder = setup_contract();
    let contract_hash = get_contract_hash(&builder);
    
    for i in 0..5 {
        create_option(
            &mut builder,
            contract_hash,
            i,
            U256::from(1000000u64 * (i + 1)),
            1735689600u64 + i * 86400,
        );
    }
    
    let count = get_option_count(&builder, contract_hash);
    assert_eq!(count, 5, "Option count should be 5");
    
    for i in 0..5 {
        assert!(
            option_exists(&builder, *DEFAULT_ACCOUNT_ADDR, i),
            "Option {} should exist",
            i
        );
    }
}

#[test]
fn test_edge_case_zero_strike_price() {
    let mut builder = setup_contract();
    let contract_hash = get_contract_hash(&builder);
    
    create_option(
        &mut builder,
        contract_hash,
        1,
        U256::zero(),
        1735689600u64,
    );
    
    assert!(
        option_exists(&builder, *DEFAULT_ACCOUNT_ADDR, 1),
        "Option with zero strike price should exist"
    );
}

#[test]
fn test_edge_case_max_values() {
    let mut builder = setup_contract();
    let contract_hash = get_contract_hash(&builder);
    
    create_option(
        &mut builder,
        contract_hash,
        u64::MAX - 1,
        U256::MAX,
        u64::MAX,
    );
    
    assert!(
        option_exists(&builder, *DEFAULT_ACCOUNT_ADDR, u64::MAX - 1),
        "Option with max values should exist"
    );
}
