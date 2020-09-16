import web3,json
import binascii
from web3 import Web3
import requests,json, time,random
import pandas as pd
import hashlib
from Naked.toolshed.shell import execute_js, muterun_js, run_js
contract_address = "";
node_url ="http://localhost:8545" 
net_id = 60 #eth network ID
last_block = 0


public_keys =  ["0xe010aC6e0248790e08F42d5F697160DEDf97E024", 
 "0xcdd8FA31AF8475574B8909F135d510579a8087d3", 
 "0xb9dD5AfD86547Df817DA2d0Fb89334A6F8eDd891", 
 "0x230570cD052f40E14C14a81038c6f3aa685d712B", 
 "0x3233afA02644CCd048587F8ba6e99b3C00A34DcC", 
 "0xE037EC8EC9ec423826750853899394dE7F024fee", 
 "0x5d4eD2cC2C46f4144EC45C39C5aF9B69C7CDa8E8", 
 "0xE7E5c22A8f366B4418a06Dab6438fbA3a7259ceA", 
 "0x7290C7292864aCc2E7f9a069E34BC91e929e64Af", 
 "0xe0d7BAE200F0994B11423E8BE8F386060bBdd808"]

private_keys = ["3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216", 
 "d32132133e03be292495035cf32e0e2ce0227728ff7ec4ef5d47ec95097ceeed", 
 "d13dc98a245bd29193d5b41203a1d3a4ae564257d60e00d6f68d120ef6b796c5", 
 "4beaa6653cdcacc36e3c400ce286f2aefd59e2642c2f7f29804708a434dd7dbe", 
 "78c1c7e40057ea22a36a0185380ce04ba4f333919d1c5e2effaf0ae8d6431f14", 
 "4bdc16637633fa4b4854670fbb83fa254756798009f52a1d3add27fb5f5a8e16", 
 "42ef6879f87950460bc162070839a42690ad76200e2460e30e944f69026a7f0b", 
 "fa991490959b6cf3c31115271c8ee63070dd57b6078582a6b8b5be97ca9a8061", 
 "37ed7b1172f31891e6fb38a361c72768954031f46c3e4018f9f8578ea2b6804c", 
 "8b73fa2c839ccea66e8eddf0aa95f6bc4c6aaa11e2fa126c1d9334985b0e7666"] 

def generate_random_number():
    return random.randint(1000000,9999999)

def mine(challenge, public_address, difficulty):
                global last_block, contract_address
                x = 0;
                print('starting to mine')
                while True:
                                x += 1;
                                j = generate_random_number()
                                nonce = Web3.toHex(str.encode(str(j)))
                                _string = str(challenge).strip() + public_address[2:].strip() + str(nonce)[2:].strip()
                                v = Web3.toHex(Web3.sha3(hexstr=_string));
                                z= hashlib.new('ripemd160',bytes.fromhex(v[2:])).hexdigest()
                                n = "0x" + hashlib.new('sha256',bytes.fromhex(z)).hexdigest()
                                hash1 = int(n,16);
                                if hash1 % difficulty == 0:
                                                print('solution found')
                                                return j;
                                if x % 10000 == 0:
                                                payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_blockNumber"}
                                                r = requests.post(node_url, data=json.dumps(payload));
                                                d = jsonParser(r);
                                                _block = int(d['result'],16)
                                                if(last_block != _block):
                                                                _challenge,_apiId,_difficulty = getVariables(5);
                                                                if challenge != _challenge:
                                                                                return 0;


def masterMiner():
                miners_started = 0
                challenge,apiId,difficulty = getVariables(70);
                if difficulty > 0:
                    while True:
                                    nonce = mine(str(challenge),public_keys[miners_started],difficulty);
                                    if(nonce > 0):
                                                    print ("You guessed the hash!");
                                                    value = [1000,2000,3000,4000,5000]
                                                    print('Value',value);
                                                    xxx = 0
                                                    apiIdstring=""
                                                    valuestring=""
                                                    while xxx < 5:
                                                        apiIdstring += str(apiId[xxx]) +" "
                                                        valuestring += str(value[xxx]) +" "
                                                        xxx += 1

                                                    arg_string =""+ str(nonce) + " "+ str(apiIdstring) +" " + str(valuestring)+" "+str(contract_address)+" "+str(public_keys[miners_started])+" "+str(private_keys[miners_started])
                                                    print("arg string", arg_string)
                                                    execute_js('testSubmitterv2.js',arg_string);
                                                    miners_started += 1 
                                                    if(miners_started % 5 == 0):
                                                                    time.sleep(20);
                                                                    challenge,apiId,difficulty= getVariables(0);
                                                                    if(miners_started == 10):
                                                                        miners_started = 0;
                                    else:
                                                    challenge,apiId,difficulty = getVariables(0); 
                                                    print('variables grabbed')
                print('Miner Stopping')

def getVariables(_offset):
                getAddress(_offset);
                payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_call","params":[{"to":contract_address,"data":"0x4049f198"}, "latest"]}
                tries = 1;
                while tries < 5:
                                try:
                                                r = requests.post(node_url, data=json.dumps(payload));
                                                val = jsonParser(r);
                                                val = val['result'];
                                                print("val",val)
                                                _challenge = val[:66]
                                                val = val[66:]
                                                _apiId1 = int(val[:64],16)
                                                val = val[64:]
                                                _apiId2 = int(val[:64],16)
                                                val = val[64:]
                                                _apiId3 = int(val[:64],16)
                                                val = val[64:]
                                                _apiId4 = int(val[:64],16)
                                                val = val[64:]
                                                _apiId5 = int(val[:64],16)
                                                val = val[64:]
                                                _difficulty = int(val[:64],16);
                                                val =val[64:]
                                                val =val[64:]
                                                print('String',_challenge,[_apiId1,_apiId2,_apiId3,_apiId4,_apiId5],_difficulty)
                                                return _challenge,[_apiId1,_apiId2,_apiId3,_apiId4,_apiId5],_difficulty
                                except:
                                                tries += 1
                                                print('Oh no...not working')
                return 0,0,0

def jsonParser(_info):
                my_json = _info.content
                data = json.loads(my_json)
                s = json.dumps(data, indent=4, sort_keys=True)
                return json.loads(s)

def getAddress(_offset):
                global last_block, contract_address
                payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_blockNumber"}
                r = requests.post(node_url, data=json.dumps(payload));
                e = jsonParser(r);
                block = int(e['result'],16)-_offset
                while(block > last_block):
                                print('block',block);
                                try:
                                                payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_getTransactionByBlockNumberAndIndex","params":[hex(block),0]}
                                                r = requests.post(node_url, data=json.dumps(payload));
                                                d = jsonParser(r);
                                                tx = d['result']
                                                payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_getTransactionReceipt","params":[tx['hash']]}
                                                r = requests.post(node_url, data=json.dumps(payload));
                                                d = jsonParser(r);
                                                tx = d['result']
                                                _contract_address =tx['contractAddress']
                                                if len(_contract_address)>0 and tx['logs'][6]['topics'][0] == '0xc2d1449eb0b6547aa426e09d9942a77fa4fc8cd3296305b3163e22452e0bcb8d':
                                                                last_block = int(e['result'],16) 
                                                                block = 0;
                                                                contract_address = _contract_address
                                                                print('New Contract Address',_contract_address)
                                                                return True;
                                except:
                                                pass
                                block = block - 1;
                last_block = int(e['result'],16)
                return False;

#getVariables()
masterMiner();
#getAddress();
