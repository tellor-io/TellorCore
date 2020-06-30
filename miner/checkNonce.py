from web3 import Web3
import hashlib

challenge = '0"3f4c9d63f0b6ab491b417fc701e4055a633cce70bebc68ed6812f6d6fadad28e'
difficulty =839715481359531
public_key = "0x7034e17f11b382545ffd618620ca72e271aea5f6"
nonce ="303038610200000000000778016f240c"

def mine(nonce,challenge, public_address, difficulty):
		_string = str(challenge).strip() + public_address[2:].strip() + str(nonce)[2:].strip()
		#v = Web3.toHex(Web3.sha3(hexstr=_string));
		v="0x303038610200000000000778016f240c"
		z= hashlib.new('ripemd160',bytes.fromhex(v[2:])).hexdigest()
		n = "0x" + hashlib.new('sha256',bytes.fromhex(z)).hexdigest()
		hash1 = int(n,16);
		if hash1 % difficulty == 0:
			print ("You guessed the hash!");
		else:
			print ("nonce not found")
	

mine(nonce,str(challenge),public_key,difficulty);
