pragma solidity ^0.4.24;

// File: contracts\CloneFactory.sol

/**
* @title CloneFactory
* @dev This contracts helps clone an oracle.
* The address of the targeted contract to clone has to be provided.
*/
contract CloneFactory {

    /**
    * @dev Creates oracle clone
    * @param target is the address being cloned
    * @return address for clone
    */
    function createClone(address target) internal returns (address result) {
        bytes memory clone = hex"600034603b57603080600f833981f36000368180378080368173bebebebebebebebebebebebebebebebebebebebe5af43d82803e15602c573d90f35b3d90fd";
        bytes20 targetBytes = bytes20(target);
        for (uint i = 0; i < 20; i++) {
            clone[26 + i] = targetBytes[i];
        }
        assembly {
            let len := mload(clone)
            let data := add(clone, 0x20)
            result := create(0, data, len)
        }
    }
}

// File: contracts\libraries\SafeMath.sol

//Slightly modified SafeMath library - includes a min function
library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }

  function min(uint a, uint b) internal pure returns (uint256) {
    return a < b ? a : b;
  }
}

// File: contracts\Token.sol

/**
* @title Token
* This contracts contains the ERC20 token functions
*/
contract Token  {

    using SafeMath for uint256;

    /*Variables*/
    uint public total_supply;
    mapping (address => uint) public balances;
    mapping(address => mapping (address => uint)) internal allowed;

      
    /*Events*/
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);

    /*Functions*/
    /**
    * @dev Constructor that sets the passed value as the token to be mineable.
    */
    constructor() public{
        total_supply = 1000000 ether;
        balances[msg.sender] = total_supply;
        //balances[address(this)]= 2**256 -  1000000 ether;
        balances[address(this)]= (2**256) - 1 - total_supply;
    }
    

    /**
    * @dev Allows for a transfer of tokens to _to
    * @param _to The address to send tokens to
    * @param _amount The amount of tokens to send
    * @return true if transfer is successful
    */
     function transfer(address _to, uint256 _amount) public returns (bool success) {
        doTransfer(msg.sender, _to, _amount);
        return true;
    }

    /**
    * @notice Send _amount tokens to _to from _from on the condition it
    * is approved by _from
    * @param _from The address holding the tokens being transferred
    * @param _to The address of the recipient
    * @param _amount The amount of tokens to be transferred
    * @return True if the transfer was successful
    */
    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
        require(allowed[_from][msg.sender] >= _amount);
        allowed[_from][msg.sender] -= _amount;
        doTransfer(_from, _to, _amount);
        return true;
    }


    /** 
    * @dev Completes POWO transfers by updating the balances
    * @param _from address to transfer from
    * @param _to addres to transfer to
    * @param _amount to transfer 
    */
    function doTransfer(address _from, address _to, uint _amount) internal {
        require(_amount > 0 && _to != 0);
        balances[_from] = balances[_from].sub(_amount);
        balances[_to] = balances[_to].add(_amount);
        emit Transfer(_from, _to, _amount);
    }

    /**
    * @dev This function approves a _spender an _amount of tokens to use
    * @param _spender address
    * @param _amount amount the spender is being approved for
    * @return true if spender appproved successfully
    */
    function approve(address _spender, uint _amount) public returns (bool) {
        allowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }
    /**
    * @dev Gets balance of owner specified
    * @param _owner is the owner address used to look up the balance
    * @return Returns the balance associated with the passed in _owner
    */
    function balanceOf(address _owner) public constant returns (uint bal) { 
        return balances[_owner]; 
    }

    /**
    * @dev Getter function allows you to view the allowance left based on the _owner and _spender
    * @param _owner address
    * @param _spender address
    * @return Returns the remaining allowance of tokens granted to the _spender from the _owner
    */
    function allowance(address _owner, address _spender) public view returns (uint) {
       return allowed[_owner][_spender]; }

    /**
    *@dev Getter for the total_supply of token
    *@return total supply
    */
    function totalSupply() public view returns(uint){
        return total_supply;
    }
}

// File: contracts\ProofOfWorkToken.sol

//import "./OracleToken.sol";

/**
* @title Proof of Work token
* This is the master token where you deploy new oracles from.  
* Each oracle gets the API value specified
*/

contract ProofOfWorkToken is Token, CloneFactory {

    using SafeMath for uint256;

    /*Variables*/
    string public constant name = "Proof-of-Work Oracle Token";
    string public constant symbol = "POWO";
    uint8 public constant decimals = 18;
    uint public firstDeployedTime;
    uint public firstWeekCount = 0;
    uint public lastDeployedTime;
    address public dud_Oracle;
    address public owner;
    OracleDetails[] public oracle_list;
    mapping(address => uint) oracle_index;

    struct OracleDetails {
        string API;
        address location;
    }

    /*Events*/
    event Deployed(string _api,address _newOracle);
    
    /*Modifiers*/
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /*Functions*/
    constructor(address _dud_Oracle) public{
        owner = msg.sender;
        dud_Oracle = _dud_Oracle;
        firstDeployedTime = now - (now % 86400);
        lastDeployedTime = now - (now % 86400);
        oracle_list.push(OracleDetails({
            API: "",
            location: address(0)
        }));
    }

    /**
    * @dev Deploys new oracles. It allows up to 10 oracles to be deployed the first week 
    * the ProofOfOWorkToken contract is deployed and 1 oracle per week thereafter.  
    * @param _api is the oracle api
    * @param _readFee is the fee for reading oracle information
    * @param _timeTarget for the dificulty adjustment
    * @param _payoutStructure for miners
    */
    function deployNewOracle(string _api,uint _readFee,uint _timeTarget,uint[5] _payoutStructure) public onlyOwner() {
        uint _calledTime = now - (now % 86400);
        uint _payout;
        for(uint i = 0;i<5;i++){
            _payout += _payoutStructure[i];
        }
        require(_payout.mul(86400).div(_timeTarget) <=  25*1e18);
        require(firstWeekCount <= 9 && (_calledTime - firstDeployedTime) <= 604800 || _calledTime >= (lastDeployedTime + 604800));
            if (firstWeekCount <= 9 && (_calledTime - firstDeployedTime) <= 604800){
                firstWeekCount++; 
                deployNewOracleHelper(_api, _readFee, _timeTarget, _payoutStructure);
            } else if (_calledTime >= (lastDeployedTime + 604800)) {
                lastDeployedTime = _calledTime;
                deployNewOracleHelper(_api, _readFee, _timeTarget, _payoutStructure);
            }
    }

    /**
    * @dev Helps Deploy a new oracle 
    * @param _api is the oracle api
    * @param _readFee is the fee for reading oracle information
    * @param _timeTarget for the dificulty adjustment
    * @param _payoutStructure for miners
    * @return new oracle address
    */
    function deployNewOracleHelper(string _api,uint _readFee,uint _timeTarget,uint[5] _payoutStructure) internal returns(address){
        address new_oracle = createClone(dud_Oracle);
        OracleToken(new_oracle).init(address(this),_readFee,_timeTarget,_payoutStructure);
        oracle_index[new_oracle] = oracle_list.length;
        oracle_list.length++;
        OracleDetails storage _current = oracle_list[oracle_list.length-1]; 
        _current.API = _api;
        _current.location = new_oracle; 
        emit Deployed(_api, new_oracle);
        return new_oracle; 
    }

    /**
    * @dev Allows for a transfer of tokens to the first 5 _miners that solve the challenge and 
    * updates the total_supply of the token(total_supply is saved in token.sol)
    * The function is called by the OracleToken.retrievePayoutPool and OracleToken.pushValue.
    * Only oracles that have this ProofOfWOrkToken address as their master contract can call this 
    * function
    * @param _miners The five addresses to send tokens to
    * @param _amount The amount of tokens to send to each address
    * @param _isMine is true if the timestamp has been mined and miners have been paid out
    */
    function batchTransfer(address[5] _miners, uint256[5] _amount, bool _isMine) external{
        require(oracle_index[msg.sender] > 0);
        uint _paid;
        for (uint i = 0; i < _miners.length; i++) {
            if (balanceOf(address(this)) >= _amount[i]
            && _amount[i] > 0
            && balanceOf(_miners[i]).add(_amount[i]) > balanceOf(_miners[i])) {
                doTransfer(address(this),_miners[i],_amount[i]);
                _paid += _amount[i];

            }
        }
        if(_isMine){
            total_supply += _paid;
        }
    }


    /**
    * @dev Allows the OracleToken.RetreiveData to transfer the fee paid to retreive
    * data back to this contract
    * @param _from address to transfer from
    * @param _amount to transfer
    * @return true after transfer 
    */
    function callTransfer(address _from,uint _amount) public returns(bool){
        require(oracle_index[msg.sender] > 0);
        doTransfer(_from,address(this), _amount);
        return true;
    }

    /**
    * @dev Getter function that gets the oracle API
    * @param _oracle is the oracle address to look up
    * @return the API and oracle address
    */
    function getDetails(address _oracle) public view returns(string,address){
        OracleDetails storage _current = oracle_list[oracle_index[_oracle]];
        return(_current.API,_current.location);
    }

    /**
    * @dev Getter function that gets the number of deployed oracles
    * @return the oracle count
    */
    function getOracleCount() public view returns(uint){
        return oracle_list.length-1;
    }

    /**
    * @dev Getter function that gets the index of the specified deployed oracle
    * @param _oracle is the oracle address to look up
    * @return the oracle index
    */
    function getOracleIndex(address _oracle) public view returns(uint){
        return oracle_index[_oracle];
    }
    /**
    *@dev Allows the owner to set a new owner address
    *@param _new_owner the new owner address
    */
    function setOwner(address _new_owner) public onlyOwner() { 
        owner = _new_owner; 
    }
}

// File: contracts\OracleToken.sol

//Instead of valuePool, can we balances of this address?

/**
 * @title Oracle Token
 * @dev Oracle contract where miners can submit the proof of work along with the value.
 * Includes functions for users to read data from, tip the miners and for miners to submit
 * values and get paid out from the master ProofOfWorkToken contract
 */
contract OracleToken{
    using SafeMath for uint256;
    /*Variables*/
    bytes32 public currentChallenge; //current challenge to be solved
    uint public timeOfLastProof; // time of last challenge solved
    uint public timeTarget; //The time between blocks (mined Oracle values)
    uint public timeCreated;//Time the contract was created
    uint public count;//Number of miners who have mined this value so far
    uint public readFee;//Fee in PoWO tokens to read a value
    uint public payoutTotal;//Mining Reward in PoWo tokens given to all miners per value
    uint public miningMultiplier;//This times payout total is the mining reward (it goes down each year)
    uint256 public difficulty; // Difficulty of current block
    uint[5] public payoutStructure;//The structure of the payout (how much uncles vs winner recieve)
    address public master;//Address of master ProofOfWorkToken that created this contract
    mapping(uint => uint) values;//This the time series of values stored by the contract where uint UNIX timestamp is mapped to value
    mapping(uint => address[5]) minersbyvalue;//This maps the UNIX timestamp to the 5 miners who mined that value
    mapping(uint => uint) payoutPool;//This is the payout pool for a given timestamp.  
    mapping(bytes32 => mapping(address=>bool)) miners;//This is a boolean that tells you if a given challenge has been completed by a given miner
    Details[5] first_five;
    struct Details {
        uint value;
        address miner;
    }

    /*Events*/
    event Mine(address sender,address[5] _miners, uint[5] _values);//Emits upon a succesful value mine, indicates the msg.sender, 5 miners included in block, and the mined value
    event NewValue(uint _time, uint _value);//Emits upon a successful Mine, indicates the blocktime at point of the mine and the value mined
    event PoolPayout(address sender,uint _timestamp, address[5] _miners, uint[5] _values);//Emits when a pool is paid out, who is included and the amount(money collected from reads)
    event ValueAddedToPool(address sender,uint _value,uint _time);//Emits upon someone adding value to a pool; msg.sender, amount added, and timestamp incentivized to be mined
    event MiningMultiplierChanged(uint _newMultiplier);//Each year, the mining reward decreases by 1/5 of the initial mining reward
    event DataRetrieved(address _sender, uint _value);//Emits when someone retireves data, this shows the msg.sender and the value retrieved
    event NonceSubmitted(address _miner, string _nonce, uint _value);//Emits upon each mine (5 total) and shows the miner, nonce, and value submitted

    /*Constructors*/
    /**
    * @dev Constructor for cloned oracle that sets the passed value as the token to be mineable.
    * @param _master is the master ProofOfWorkToken.address
    * @param _readFee is the fee for reading oracle information
    * @param _timeTarget for the dificulty adjustment
    * @param _payoutStructure for miners
    */
    constructor(address _master,uint _readFee,uint _timeTarget,uint[5] _payoutStructure) public{
        require(_timeTarget > 60);
        timeOfLastProof = now - now  % _timeTarget;
        timeCreated = now;
        master = _master;
        readFee = _readFee;
        timeTarget = _timeTarget;
        miningMultiplier = 1e18;
        payoutStructure = _payoutStructure;
        currentChallenge = keccak256(abi.encodePacked(timeOfLastProof,currentChallenge, blockhash(block.number - 1)));
        difficulty = 1;
        for(uint i = 0;i<5;i++){
            payoutTotal += _payoutStructure[i];
        }
    }

    /**
    * @dev Constructor for cloned oracle that sets the passed value as the token to be mineable.
    * @param _master is the master ProofOfWorkToken.address
    * @param _readFee is the fee for reading oracle information
    * @param _timeTarget for the dificulty adjustment
    * @param _payoutStructure for miners
    */
    function init(address _master,uint _readFee,uint _timeTarget,uint[5] _payoutStructure) external {
        require (timeOfLastProof == 0 && _timeTarget > 60);
        timeOfLastProof = now - now  % _timeTarget;
        timeCreated = now;
        master = _master;
        readFee = _readFee;
        timeTarget = _timeTarget;
        miningMultiplier = 1e18;
        payoutStructure = _payoutStructure;
        currentChallenge = keccak256(abi.encodePacked(timeOfLastProof,currentChallenge, blockhash(block.number - 1)));
        difficulty = 1;
        for(uint i = 0;i<5;i++){
            payoutTotal += _payoutStructure[i];
        }
    }

    /*Functions*/
    /**
    * @dev Proof of work is called by the miner when they submit the solution (proof of work and value)
    * @param nonce uint submitted by miner
    * @param value of api query
    * @return count of values sumbitted so far and the time of the last successful mine
    */
    function proofOfWork(string nonce, uint value) external returns (uint256,uint256) {
        bytes32 _solution = keccak256(abi.encodePacked(currentChallenge,msg.sender,nonce)); // generate random hash based on input
        uint _rem = uint(_solution) % 3;
        bytes32 n;
        if(_rem == 2){
            n = keccak256(abi.encodePacked(_solution));
        }
        else if(_rem ==1){
            n = sha256(abi.encodePacked(_solution));
        }
        else{
            n = keccak256(abi.encodePacked(ripemd160(abi.encodePacked(_solution))));
        }

        require(uint(n) % difficulty == 0 && value > 0 && miners[currentChallenge][msg.sender] == false); //can we say > 0? I like it forces them to enter a valueS  
        first_five[count].value = value;
        first_five[count].miner = msg.sender;
        count++;
        miners[currentChallenge][msg.sender] = true;
        uint _payoutMultiplier = 1;
        emit NonceSubmitted(msg.sender,nonce,value);
        if(count == 5) { 
            if (now - timeOfLastProof < (timeTarget *60)/100){
                difficulty++;
            }
            else if (now - timeOfLastProof > timeTarget && difficulty > 1){
                difficulty--;
            }
            
            uint i = (now - (now % timeTarget) - timeOfLastProof) / timeTarget;
            timeOfLastProof = now - (now % timeTarget);
            uint valuePool;
            while(i > 0){
                valuePool += payoutPool[timeOfLastProof - (i - 1) * timeTarget];
                i = i - 1;
            }
            if(valuePool >= payoutTotal) {
                _payoutMultiplier = (valuePool + payoutTotal) / payoutTotal; //solidity should always round down
                payoutPool[timeOfLastProof] = valuePool % payoutTotal;
            }
            else{
                payoutPool[timeOfLastProof] = valuePool;
            }
            pushValue(timeOfLastProof,_payoutMultiplier);
            count = 0;
            currentChallenge = keccak256(abi.encodePacked(nonce, currentChallenge, blockhash(block.number - 1))); // Save hash for next proof
         }
     return (count,timeOfLastProof); 
    }

    /**
    * @dev Adds the _tip to the valuePool that pays the miners
    * @param _tip amount to add to value pool
    * @param _timestamp is the timestamp that will be given the _tip once it is mined.
    * It should be the time stamp the user wants to ensure gets mined. They can do that 
    * by adding a _tip to insentivize the miners to submit a value for the time stamp. 
    */
    function addToValuePool(uint _tip, uint _timestamp) public {
        ProofOfWorkToken _master = ProofOfWorkToken(master);
        require(_master.callTransfer(msg.sender,_tip));
        uint _time;
        if(_timestamp == 0){
            _time = timeOfLastProof + timeTarget;
        }
        else{
            _time = _timestamp - (_timestamp % timeTarget);
        }
        payoutPool[_time] = payoutPool[_time].add(_tip);
        emit ValueAddedToPool(msg.sender,_tip,_time);//_time instead of timestamp?
    }


    /**
    * @dev Retrieve payout from the data reads. It pays out the 5 miners.
    * @param _timestamp for which to retreive the payout from
    */
    function retrievePayoutPool(uint _timestamp) public {
        uint _payoutMultiplier = payoutPool[_timestamp] / payoutTotal;
        require (_payoutMultiplier > 0 && values[_timestamp] > 0);
        uint[5] memory _payout = [payoutStructure[4]*_payoutMultiplier,payoutStructure[3]*_payoutMultiplier,payoutStructure[2]*_payoutMultiplier,payoutStructure[1]*_payoutMultiplier,payoutStructure[0]*_payoutMultiplier];
        ProofOfWorkToken(master).batchTransfer(minersbyvalue[_timestamp], _payout,false);
        emit PoolPayout(msg.sender,_timestamp,minersbyvalue[_timestamp], _payout);
    }

    /**
    * @dev Changes the base miner payout by decreasiung by 1/5 for 5 years.
    * After 5 years all miners rewards come from data reads.
    * @return _newTotal after the payout is decreased
    */
    function updatePayoutTotal() public returns(uint _newTotal){
        uint yearsSince = (now - timeCreated) / (86400 * 365);
        if(yearsSince >=5){
            miningMultiplier = 0;
            emit MiningMultiplierChanged(miningMultiplier);
        }
        else if (yearsSince >=1){
            miningMultiplier = 1e18 * (5 - yearsSince)/5;
            emit MiningMultiplierChanged(miningMultiplier);
        }
        return miningMultiplier;
    }

    /**
    * @dev Retreive value from oracle based on timestamp
    * @param _timestamp to retreive data/value from
    * @return value for timestamp submitted
    */
    function retrieveData(uint _timestamp) public returns (uint) {
        ProofOfWorkToken _master = ProofOfWorkToken(master);
        require(isData(_timestamp) && _master.callTransfer(msg.sender,readFee));
        payoutPool[_timestamp] = payoutPool[_timestamp] + readFee;
        emit DataRetrieved(msg.sender,values[_timestamp]);
        return values[_timestamp];
    }

    /**
    * @dev Gets the 5 miners who mined the value for the specified _timestamp 
    * @param _timestamp is the timestampt to look up miners for
    */
    function getMinersByValue(uint _timestamp) public view returns(address[5]){
        return minersbyvalue[_timestamp];
    }

    /**
    * @dev This function tells you if a given challenge has been completed by a given miner
    * @param _challenge the challenge to search for
    * @param _miner address that you want to know if they solved the challenge
    * @return true if the _miner address provided solved the 
    */
    function didMine(bytes32 _challenge,address _miner) public view returns(bool){
        return miners[_challenge][_miner];
    }
    
    /**
    * @dev Checks if a value exists for the timestamp provided
    * @param _timestamp to retreive data/value from
    * @return true if the value exists/is greater than zero
    */
    function isData(uint _timestamp) public view returns(bool){
        return (values[_timestamp] > 0);
    }

    /**
    * @dev Getter function for currentChallenge difficulty
    * @return current challenge and level of difficulty
    */
    function getVariables() external view returns(bytes32, uint){
        return (currentChallenge,difficulty);
    }

    /**
    * @dev Gets the a value for the latest timestamp available
    * @return value for timestamp of last proof of work submited
    */
    function getLastQuery() external returns(uint){
        return retrieveData(timeOfLastProof);
    }

    /**
    * @dev Getter function for the payoutPool total for the specified _timestamp
    * If the _timestamp is not specified(_timestamp=0) it will return the total payoutPool
    * for the _timestamp being mined
    * @param _timestamp to look up the total payoutPool value 
    * @return the value of the total payoutPool
    */
    function getValuePoolAt(uint _timestamp) external view returns(uint){
        if(_timestamp == 0){
            uint _time = timeOfLastProof.add(timeTarget);
            return payoutPool[_time];
        }
        else{
            return payoutPool[_timestamp];
        }
    }

    /**
    * @dev This function rewards the first five miners that submit a value
    * through the proofOfWork function and sorts the value as it is received 
    * so that the median value is 
    * given the highest reward
    * @param _time is the time/date for the value being provided by the miner
    * @param _payoutMultiplier is calculated in the proofOfWork function to 
    * allocate the additional miner tip added via the addToValuePool function
    */
    function pushValue(uint _time, uint _payoutMultiplier) internal {
        Details[5] memory a = first_five;
        uint[5] memory _payout;
        for (uint i = 1;i <5;i++){
            uint temp = a[i].value;
            address temp2 = a[i].miner;
            uint j = i;
            while(j > 0 && temp < a[j-1].value){
                a[j].value = a[j-1].value;
                a[j].miner = a[j-1].miner;   
                j--;
            }
            if(j<i){
                a[j].value = temp;
                a[j].miner= temp2;
            }
        }
        for (i = 0;i <5;i++){
            _payout[i] = payoutStructure[i]*_payoutMultiplier*miningMultiplier/1e18;
        }
        ProofOfWorkToken(master).batchTransfer([a[0].miner,a[1].miner,a[2].miner,a[3].miner,a[4].miner], _payout,true);
        values[_time] = a[2].value;
        minersbyvalue[_time] = [a[0].miner,a[1].miner,a[2].miner,a[3].miner,a[4].miner];
        emit Mine(msg.sender,[a[0].miner,a[1].miner,a[2].miner,a[3].miner,a[4].miner], _payout);
        emit NewValue(timeOfLastProof,a[2].value);
    }
}
