
var OracleToken = artifacts.require("OracleToken");
var _OracleToken = "0x8925103283b3016e2d3bb1b1be9c4ba957eab6b9";
var _date = (Date.now()/1000- (Date.now()/1000)%60);

module.exports =async function(callback) {
    var count= 20;
    var value= 100;

    for(i = 1; i <= count; i++){
    	
        value++;
        let oracle = await OracleToken.at(_OracleToken);
        await oracle.testAdd(_date, value);
        var link = "".concat('<https://rinkeby.etherscan.io/address/',_OracleToken,'>' );
        var ar = [i, _date, _OracleToken, link, value];
        console.log(ar.join(', '));   
        _date = _date+60; 

  	}
  	console.log("added", count, "values")  
}