import React from 'react';

const ropstenAddress = process.env.REACT_APP_ROPSTEN_NOTIFY_ADDRESS;
const mainnetAddress = process.env.REACT_APP_MAINNET_NOTIFY_ADDRESS;
// const testAddress = process.env.REACT_APP_NOTIFY_ADDRESS;

const notifyABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "notify",
		"outputs": [{
			"internalType": "address",
			"name": "notifyToken",
			"type": "address"
		}],
		"stateMutability": "payable",
		"type": "function"
	}
]

const toContract = async (web3) => {
	const net = await web3.eth.net.getNetworkType();
	let notifyAddress;
	if (net == 'main') {
		notifyAddress = mainnetAddress;
	} else if (net == 'ropsten') {
		notifyAddress = ropstenAddress;
	} else throw new Error('Not ropsten or mainnet')
	console.log(`notify address: ${notifyAddress}`)
  return new web3.eth.Contract(notifyABI, notifyAddress);
}

function isAddress(address) {
	if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
		// check if it has the basic requirements of an address
		return false;
	} else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
		// If it's all small caps or all all caps, return true
		return true;
	} else {
		address = address.toLowerCase();
		return /^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)
	}
};

export { isAddress, toContract };