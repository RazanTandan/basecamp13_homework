use starknet::contract_address;
use snforge_std::Token::STRK;
use openzeppelin_testing::deploy;
use starknet::ContractAddress; 
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait,EventSpyAssertionsTrait, spy_events, start_cheat_caller_address, stop_cheat_caller_address, set_balance}; 
use contracts::counter::{ICounterDispatcher, ICounterDispatcherTrait};
use contracts::counter::CounterContract::{CounterChanged, ChangedReason, Event};
use contracts::utils::{strk_address, strk_to_fri};
use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

fn owner_address() -> ContractAddress { 
    'owner'.try_into().unwrap()
}

fn user_address() -> ContractAddress { 
    'user'.try_into().unwrap()
}

fn deploy_counter(init_counter: u32) -> ICounterDispatcher { 
 let contract = declare("CounterContract").unwrap().contract_class();
    let owner_address: ContractAddress = 'owner'.try_into().unwrap(); 
    let contract = declare("CounterContract").unwrap().contract_class();

    let mut constructor_args = array![];
    init_counter.serialize(ref constructor_args); 
    owner_address.serialize(ref constructor_args); 

    let (contract_address, _) = contract.deploy(@constructor_args).unwrap();
    let dispatcher = ICounterDispatcher{ contract_address};

    dispatcher
}

#[test]
fn test_contract_initialization() { 
    let dispatcher = deploy_counter(5);


    let current_counter = dispatcher.get_counter(); 
    assert!(current_counter == 5, "Initialization of counter failed");
}

#[test]
fn test_counter_increase() { 
    let init_counter: u32 = 0; 
    let dispatcher = deploy_counter(init_counter);

    dispatcher.increase_counter(); 
    let current_counter = dispatcher.get_counter(); 

    assert!(current_counter == 1, "Increase counter function doesn't work");
}

#[test]
fn test_counter_decrease() { 
    let init_counter: u32 = 5; 
    let dispatcher = deploy_counter(init_counter);

    dispatcher.decrease_counter(); 
    let current_counter = dispatcher.get_counter(); 

    assert!(current_counter == 4, "Decrease counter function doesn't work");
}

#[test]
#[should_panic(expected: "The counter can't be negative")]
fn test_counter_decrease_fail_path() { 
    let init_counter: u32 = 0; 
    let dispatcher = deploy_counter(init_counter);

    dispatcher.decrease_counter(); 
    dispatcher.get_counter(); 
}



#[test]
fn test_counter_increase_events() { 
    let init_counter: u32 = 0; 
    let dispatcher = deploy_counter(init_counter);
    let mut spy = spy_events();

    start_cheat_caller_address(dispatcher.contract_address, user_address());
    dispatcher.increase_counter(); 
    stop_cheat_caller_address(dispatcher.contract_address); 

    let current_counter = dispatcher.get_counter(); 

    assert!(current_counter == 1, "Increase counter function doesn't work"); 

    let expected_event = CounterChanged { 
        caller: user_address(), 
        old_value: 0, 
        new_value: 1, 
        reason: ChangedReason::Increase,
    };

    spy.assert_emitted(@array![(
        dispatcher.contract_address, 
        Event::CounterChanged(expected_event),
    )]);
    
}


#[test]
fn test_counter_decrease_events() { 
    let init_counter: u32 = 10; 
    let dispatcher = deploy_counter(init_counter);
    let mut spy = spy_events();

    start_cheat_caller_address(dispatcher.contract_address, user_address());
    dispatcher.decrease_counter(); 
    stop_cheat_caller_address(dispatcher.contract_address); 

    let current_counter = dispatcher.get_counter(); 

    assert!(current_counter == 9, "Decrease counter function doesn't work"); 

    let expected_event = CounterChanged { 
        caller: user_address(), 
        old_value: 10, 
        new_value: 9, 
        reason: ChangedReason::Decrease,
    };

    spy.assert_emitted(@array![(
        dispatcher.contract_address, 
        Event::CounterChanged(expected_event),
    )]);
    
}


#[test]
fn test_set_counter_owner() { 
    let init_counter: u32 = 8; 
    let dispatcher = deploy_counter(init_counter);
    let mut spy = spy_events();

    let new_counter: u32 = 15; 
    start_cheat_caller_address(dispatcher.contract_address, owner_address());
    dispatcher.set_counter(new_counter); 
    stop_cheat_caller_address(dispatcher.contract_address);

    assert!(dispatcher.get_counter() == new_counter, "The owner is unable to reset the counter");

    let expected_event = CounterChanged { 
        caller: owner_address(), 
        old_value: init_counter, 
        new_value: new_counter, 
        reason: ChangedReason::Set,
    };

    spy.assert_emitted(@array![(
        dispatcher.contract_address, 
        Event::CounterChanged(expected_event),
    )]);

}


#[test]
#[should_panic]
fn test_set_counter_non_owner() { 
    let init_counter: u32 = 15; 
    let dispatcher = deploy_counter(init_counter); 

    let new_counter: u32 = 15; 
    start_cheat_caller_address(dispatcher.contract_address, user_address());
    dispatcher.set_counter(new_counter); 
    stop_cheat_caller_address(dispatcher.contract_address);
}


#[test]
#[should_panic(expected: "User doesn't have enough balance")]
fn test_reset_counter_insufficient_balance() { 
    let init_counter: u32 = 8; 
    let dispatcher = deploy_counter(init_counter);

    start_cheat_caller_address(dispatcher.contract_address, user_address()); 
    dispatcher.reset_counter(); 
}

#[test]
#[should_panic(expected: "Contract is not allowded to spend enough STRK")]
fn test_reset_counter_insufficient_allowance() { 
    let init_counter: u32 = 8; 
    let dispatcher = deploy_counter(init_counter); 
    let caller = user_address(); 
    set_balance(caller, strk_to_fri(10), STRK);

    start_cheat_caller_address(dispatcher.contract_address, caller); 
    dispatcher.reset_counter(); 
}


#[test]
fn test_reset_counter_success() { 
    let init_counter: u32 = 8; 
    let counter = deploy_counter(init_counter); 
    let mut spy = spy_events();

    let user = user_address(); 

    set_balance(user, strk_to_fri(10), STRK);
    let erc_20 = IERC20Dispatcher{contract_address: strk_address()};
    start_cheat_caller_address(erc_20.contract_address, user); 
    erc_20.approve(counter.contract_address, strk_to_fri(5) );
    stop_cheat_caller_address(erc_20.contract_address);

    start_cheat_caller_address(counter.contract_address, user); 
    counter.reset_counter();
    stop_cheat_caller_address(counter.contract_address);

    assert!(counter.get_counter() == 0, "Unable to reset counter even with enought STRK");

    let expected_event = CounterChanged { 
        caller: user, 
        old_value: init_counter, 
        new_value: 0, 
        reason: ChangedReason::Reset,
    };

    spy.assert_emitted(@array![(
        counter.contract_address, 
        Event::CounterChanged(expected_event),
    )]);

    assert!(erc_20.balance_of(user) == strk_to_fri(9), "Balance not deducted correctly");
    assert!(erc_20.balance_of(owner_address()) == strk_to_fri(1), "Balance not increased correctly");
}



