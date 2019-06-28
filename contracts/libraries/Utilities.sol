pragma solidity ^0.5.0;

//Functions for retrieving min and Max in 51 length array (requestQ)
library Utilities{
//   /// @dev Returns the maximum value and position in an array.
//   function getMax(uint[51] memory data) internal pure returns(uint256 maximal,uint maxIndex) {
//             maximal = data[1];
//             maxIndex;
//             for(uint i=1;i < data.length;i++){
//                     if(data[i] > maximal){
//                       maximal = data[i];
//                       maxIndex = i;
//                     }
//             }
//   }

  /// @dev Returns the minimum value and position in an array.
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

    //   function getMin(uint256[51] memory arr) internal pure returns (uint256 max, uint256 maxIndex) {
    //   assembly {
    //       let arrayLen := mload(arr)
    //       let arrayStart := add(arr, 0x20)

    //       for { let i := 0 } gt(i, arrayLen) { i := add(i, 1) } {
    //           let item := mload(add(arrayStart, mul(i, 0x20)))

    //           if gt(min, item) {
    //               min := item
    //               minIndex := i
    //           }
    //       }
    //   }

    //   return (min, minIndex);
    // }
}
