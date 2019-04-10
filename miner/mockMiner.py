import web3,json
import binascii
from web3 import Web3
import requests,json, time,random
import pandas as pd
import hashlib
from Naked.toolshed.shell import execute_js, muterun_js, run_js
from multiprocessing import Process, freeze_support

'''
This miner is to be run with the demo.  
It mines values and then has random parties submit requests for data
It loops through 10 different API's
To do:
Only get address at the beginning
Add requesting data
Random intervals
Different tip amounts and multiple tips before mines
'''
contract_address = "";
node_url ="http://localhost:8545" #https://rinkeby.infura.io/
net_id = 60 #eth network ID
last_block = 0
openApiIds = ["json(https://api.gdax.com/products/BTC-USD/ticker).price",
"json(https://api.gdax.com/products/BTC-USD/ticker).price",
"json(https://api.gdax.com/products/BTC-USD/ticker).price",
"json(https://api.gdax.com/products/BTC-USD/ticker).price",
"json(https://api.gdax.com/products/BTC-USD/ticker).price",
"json(https://api.gdax.com/products/BTC-USD/ticker).price",
"json(https://api.gdax.com/products/BTC-USD/ticker).price",
"json(https://api.gdax.com/products/BTC-USD/ticker).price",
"json(https://api.gdax.com/products/BTC-USD/ticker).price",
"json(https://api.gdax.com/products/BTC-USD/ticker).price",
]
symbols = []

public_keys = ["0xe037ec8ec9ec423826750853899394de7f024fee","0xcdd8fa31af8475574b8909f135d510579a8087d3","0xb9dd5afd86547df817da2d0fb89334a6f8edd891","0x230570cd052f40e14c14a81038c6f3aa685d712b","0x3233afa02644ccd048587f8ba6e99b3c00a34dcc"]
private_keys = ["4bdc16637633fa4b4854670fbb83fa254756798009f52a1d3add27fb5f5a8e16","d32132133e03be292495035cf32e0e2ce0227728ff7ec4ef5d47ec95097ceeed","d13dc98a245bd29193d5b41203a1d3a4ae564257d60e00d6f68d120ef6b796c5","4beaa6653cdcacc36e3c400ce286f2aefd59e2642c2f7f29804708a434dd7dbe","78c1c7e40057ea22a36a0185380ce04ba4f333919d1c5e2effaf0ae8d6431f14"]


apis = []
granularities = [1,10,100,1000,1000000]




def generate_random_number():
    return random.randint(1000000,9999999)


def requestData():
	print("Requesting Data..")
	requests = random.randint(min(1,len(apis)),min(len(apis),3))
	for x in range(requests):
		num = random.randrange(len(apis))
		apiString= apis[num]
		symbol = symbols[num]
		granularity = granularities[random.randrange(len(granularities))]
		tip = random.randint(0,10000)
		apiId = 0;
		j = random.randint(0,4)
		arg_string =""+ apiString + " "+ symbol +" " + str(apiId)+" "+str(granularity)+" "+str(tip)+" "+str(contract_address)+" "+str(public_keys[j])+" "+str(private_keys[j])
		run_js('requestData.js',arg_string);
		openApiIds.push(len(openApiIds) + 2);
		return



def addToTip():
	print("Adding Tips..")
	tips = random.randint(1,3)
	for x in range(tips):
		rand_api= apis[random.randrange(len(openApiIds))]
		value = random.randint(0,10000)
		j = random.randint(0,4)
		arg_string =""+ str(apiId) +" " + str(value)+" "+str(contract_address)+" "+str(public_keys[j])+" "+str(private_keys[j])
		print(arg_string)
		run_js('addTip.js',arg_string);
		return




def getSolution(challenge, public_address, difficulty):
	global last_block, contract_address
	x = 0;
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
			return j;
		if x % 10000 == 0:
			payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_blockNumber"}
			r = requests.post(node_url, data=json.dumps(payload));
			d = jsonParser(r);
			_block = int(d['result'],16)
			if(last_block != _block):
				_challenge,_apiId,_difficulty,_apiString = getVariables();
				if challenge != _challenge:
					return 0;
def mine():
		print("Mining..")
		miners_started = 0;
		challenge,apiId,difficulty,apiString,granularity = getVariables();
		nonce = getSolution(str(challenge),public_keys[miners_started],difficulty);
		if(nonce > 0):
			print ("You guessed the hash!");
			value = max(0,(getAPIvalue(apiString) - miners_started*10) * granularity); #account 2 should always be winner
			arg_string =""+ str(nonce) + " "+ str(apiId) +" " + str(value)+" "+str(contract_address)+" "+str(public_keys[miners_started])+" "+str(private_keys[miners_started])
			print(arg_string)
			run_js('testSubmitter.js',arg_string);
			miners_started += 1 
			if(miners_started == 5):
				print ("New Value Secured");
				return;
		else:
			Print("No nonce found");
			return

def getAPIvalue(_api):
	_api = _api.replace("'", "")
	json = _api.split('(')[0]
	print(json)
	if('json' in json):
		_api = _api.split('(')[1]
		filter = _api.split(').')[1]
	_api = _api.split(')')[0]
	try:
		response = requests.request("GET", _api)
	except:
		response = 0;
		print('API ERROR',_api)
	if('json' in json):
		if(len(filter)):
			price =response.json()[filter]
		else:
			price = response.json()
	else:
		price = response
	print(price)
	return int(float(price))

def getVariables():
	payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_call","params":[{"to":contract_address,"data":"0x94aef022"}, "latest"]}
	r = requests.post(node_url, data=json.dumps(payload));
	val = jsonParser(r);
	val = val['result'];
	print(val);
	_challenge = val[:66]
	val = val[66:]
	_apiId = int(val[:64],16)
	val = val[64:]
	_difficulty = int(val[:64],16);
	val =val[64:]
	val =val[64:]
	print(val[:64]);
	_granularity = int(val[:64],16);
	val =val[64:]
	val =val[64:]
	val = val[:-16]
	_apiString =  str(binascii.unhexlify(val.strip()))
	print('String',_challenge,_apiId,_difficulty,_apiString,_granularity)
	return _challenge,_apiId,_difficulty,_apiString,_granularity

def jsonParser(_info):
	my_json = _info.content
	data = json.loads(my_json)
	s = json.dumps(data, indent=4, sort_keys=True)
	return json.loads(s)

def getAddress():
	global last_block, contract_address
	payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_blockNumber"}
	r = requests.post(node_url, data=json.dumps(payload));
	e = jsonParser(r);
	block = int(e['result'],16)
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
			if len(_contract_address)>0:
				last_block = int(e['result'],16) 
				block = 0;
				contract_address = _contract_address
				print('New Contract Address',contract_address)
				return True;
		except:
			pass
		block = block - 1;
	last_block = int(e['result'],16)
	return False;


def masterMiner():
	#First we get the contract address
	getAddress();
	miners_started = 0
	while True:
		#mine first value
		mine();
		time.sleep(10);
		#request data for 1 - 10 API's
		requestData();
		time.sleep(10);
		#keep track of open API's - randomly select a random number and tip them a random amount
		addToTip();
		time.sleep(10);

	print('Mock System Stopping')

#getVariables()
#masterMiner();
#getAddress();
getAPIvalue('json(https://api.gdax.com/products/BTC-USD/ticker).price')
