pragma solidity ^0.5.0;

//Functions for retrieving min and Max in 51 length array (requestQ)
//Taken partly from: https://github.com/modular-network/ethereum-libraries-array-utils/blob/master/contracts/Array256Lib.sol

library Utilities{

  /// @dev Returns the minimum value and position in an array.
    // function getMin(uint256[51] memory arr) internal pure returns (uint256 min, uint256 minIndex) {
    //   assembly {
    //       let arrayLen := mload(arr)
    //       let arrayStart := add(arr, 0x20)
    //       minIndex := sub(arrayLen,1)
    //       min := mload(add(arrayStart, mul(minIndex , 0x20)))
    //       for {let i := minIndex } gt(i,0) { i := sub(i, 1) } {
    //           let item := mload(add(arrayStart, mul(sub(i,1), 0x20)))
    //           if lt(item,min){
    //               min := item
    //               minIndex := sub(i,1)
    //           }
    //       }
    //   }
    // }

  function getMin(uint[51] memory data) internal pure returns(uint256 minimal,uint minIndex) {
        minIndex = data.length - 1;
        minimal = data[minIndex];
        for(uint i = data.length-1;i > 0;i--) {
            if(data[i] < minimal) {
                minimal = data[i];
                minIndex = i;
            }
        }
  }

  function getMax(uint256[51] memory arr) internal pure returns (uint256 max, uint256 maxIndex) {
      assembly {
          let arrayLen := mload(arr)
          let arrayStart := add(arr, 0x20)

          for { let i := 0 } lt(i, arrayLen) { i := add(i, 1) } {
              let item := mload(add(arrayStart, mul(i, 0x20)))

              if lt(max, item) {
                  max := item
                  maxIndex := i
              }
          }
      }

      return (max, maxIndex);
    }

  }
