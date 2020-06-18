from web3 import Web3
import hashlib

challenge = '0x64966a8be800bd7d993d125a07e5fd93ae291e65f65bd53ae3a03558e4f40dc2'
difficulty =1
public_key = "0xe037ec8ec9ec423826750853899394de7f024fee"
nonce = "0x223"

def mine(nonce,challenge, public_address, difficulty):
		_string = str(challenge).strip() + public_address[2:].strip() + str(nonce)[2:].strip()
		v = Web3.toHex(Web3.sha3(hexstr=_string));
		z= hashlib.new('ripemd160',bytes.fromhex(v[2:])).hexdigest()
		n = "0x" + hashlib.new('sha256',bytes.fromhex(z)).hexdigest()
		hash1 = int(n,16);
		if hash1 % difficulty == 0:
			print ("You guessed the hash!");
		else:
			print ("nonce not found")
	

mine(nonce,str(challenge),public_key,difficulty);
