pragma solidity ^0.5.16;

//Functions for retrieving min and Max in 51 length array (requestQ)
//Taken partly from: https://github.com/modular-network/ethereum-libraries-array-utils/blob/master/contracts/Array256Lib.sol

library Utilities {
    /**
    * @dev Returns the max value in an array.
    * The zero position here is ignored. It's because 
    * there's no null in solidity and we map each address 
    * to an index in this array. So when we get 51 parties, 
    * and one person is kicked out of the top 50, we 
    * assign them a 0, and when you get mined and pulled 
    * out of the top 50, also a 0. So then lot's of parties 
    * will have zero as the index so we made the array run 
    * from 1-51 with zero as nothing.
    * @param data is the array to calculate max from
    * @return max amount and its index within the array
    */
    function getMax(uint256[51] memory data) internal pure returns (uint256 max, uint256 maxIndex) {
        maxIndex = 1;
        max = data[maxIndex];
        for (uint256 i = 2; i < data.length; i++) {
            if (data[i] > max) {
                max = data[i];
                maxIndex = i;
            }
        }
    }

    /**
    * @dev Returns the minimum value in an array.
    * @param data is the array to calculate min from
    * @return min amount and its index within the array
    */
    function getMin(uint256[51] memory data) internal pure returns (uint256 min, uint256 minIndex) {
        minIndex = data.length - 1;
        min = data[minIndex];
        for (uint256 i = data.length - 2; i > 0; i--) {
            if (data[i] < min) {
                min = data[i];
                minIndex = i;
            }
        }
    }

    /**
    * @dev Returns the 5 requestsId's with the top payouts in an array.
    * @param data is the array to get the top 5 from
    * @return to 5 max amounts and their respective index within the array
    */
    function getMax5(uint256[51] memory data) internal pure returns (uint256[5] memory max, uint256[5] memory maxIndex) {
        uint256 min5 = data[1];
        uint256 minI = 0;
        for(uint256 j=0;j<5;j++){
            max[j]= data[j+1];//max[0]=data[1]
            maxIndex[j] = j+1;//maxIndex[0]= 1
            if(max[j] < min5){
                min5 = max[j];
                minI = j;
            }
        }
        for(uint256 i = 6; i < data.length; i++) {
            if (data[i] > min5) {
                max[minI] = data[i];
                maxIndex[minI] = i;
                min5 = data[i];
                for(uint256 j=0;j<5;j++){
                    if(max[j] < min5){
                        min5 = max[j];
                        minI = j;
                    }
                }
            }
        }
    }
}
