#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::{String, ToString};
use alloc::vec;

use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};

use casper_types::{
    CLType, EntryPointAccess, EntryPointType, EntryPoints, Parameter,
    contracts::{EntryPoint, NamedKeys},
};

const CONTRACT_KEY: &str = "option_registry";
const CONTRACT_PACKAGE_KEY: &str = "option_registry_package";
const CONTRACT_ACCESS_KEY: &str = "option_registry_access";

const ENTRY_POINT_CREATE_OPTION: &str = "create_option";
const ENTRY_POINT_EXERCISE_OPTION: &str = "exercise_option";

const ARG_ID: &str = "id";
const ARG_STRIKE_PRICE: &str = "strike_price";
const ARG_EXPIRY: &str = "expiry";

fn option_key(id: u64) -> String {
    let mut key = String::from("option_");
    key.push_str(&id.to_string());
    key
}

fn option_exercised_key(id: u64) -> String {
    let mut key = String::from("option_");
    key.push_str(&id.to_string());
    key.push_str("_exercised");
    key
}

#[no_mangle]
pub extern "C" fn create_option() {
    let id: u64 = runtime::get_named_arg(ARG_ID);
    let strike_price: u64 = runtime::get_named_arg(ARG_STRIKE_PRICE);
    let expiry: u64 = runtime::get_named_arg(ARG_EXPIRY);
    
    let key_name = option_key(id);
    
    let id_uref = storage::new_uref(id);
    let strike_uref = storage::new_uref(strike_price);
    let expiry_uref = storage::new_uref(expiry);
    
    runtime::put_key(&key_name, id_uref.into());
    runtime::put_key(&(key_name.clone() + "_strike"), strike_uref.into());
    runtime::put_key(&(key_name.clone() + "_expiry"), expiry_uref.into());
    
    let exercised_key = option_exercised_key(id);
    let exercised_uref = storage::new_uref(false);
    runtime::put_key(&exercised_key, exercised_uref.into());
}

#[no_mangle]
pub extern "C" fn exercise_option() {
    let id: u64 = runtime::get_named_arg(ARG_ID);
    let exercised_key = option_exercised_key(id);
    
    match runtime::get_key(&exercised_key) {
        Some(key) => {
            let uref = key.into_uref().unwrap_or_revert();
            storage::write(uref, true);
        }
        None => {
            let exercised_uref = storage::new_uref(true);
            runtime::put_key(&exercised_key, exercised_uref.into());
        }
    }
}

#[no_mangle]
pub extern "C" fn call() {
    let mut entry_points = EntryPoints::new();
    
    entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_CREATE_OPTION,
        vec![
            Parameter::new(ARG_ID, CLType::U64),
            Parameter::new(ARG_STRIKE_PRICE, CLType::U64),
            Parameter::new(ARG_EXPIRY, CLType::U64),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_EXERCISE_OPTION,
        vec![
            Parameter::new(ARG_ID, CLType::U64),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    let named_keys = NamedKeys::new();
    
    let (contract_hash, _) = storage::new_contract(
        entry_points,
        Some(named_keys),
        Some(CONTRACT_PACKAGE_KEY.to_string()),
        Some(CONTRACT_ACCESS_KEY.to_string()),
        None,
    );
    
    runtime::put_key(CONTRACT_KEY, contract_hash.into());
}
