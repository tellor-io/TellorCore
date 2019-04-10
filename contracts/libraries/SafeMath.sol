pragma solidity ^0.5.0;

//Slightly modified SafeMath library - includes a min and max function
library SafeMath {
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a / b;
    return c;
  }

  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }


  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function min(uint a, uint b) internal pure returns (uint256) {
    return a < b ? a : b;
  }
  
  function max(uint a, uint b) internal pure returns (uint256) {
    return a > b ? a : b;
  }

  function max(int256 a, int256 b) internal pure returns (uint256) {
    return a > b ? uint(a) : uint(b);
  }
}
