// Chargement Web3 et connexion a metamask
if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask ok');
    ethereum.request({ method: 'eth_requestAccounts' });
}

const web3 = new Web3(window.ethereum);
const contractAddress = '0x3Ae46b82Cd1E012f088773bc261986D3FB1Bf3f1'; // Adresse a changer apres migrate
const abi = [ // tableau à changer après chaque migrate
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "enum SupplyChain.State",
                "name": "state",
                "type": "uint8"
            }
        ],
        "name": "ProductUpdated",
        "type": "event"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "productCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "products",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "enum SupplyChain.State",
                "name": "state",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            }
        ],
        "name": "createProduct",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_productId",
                "type": "uint256"
            },
            {
                "internalType": "enum SupplyChain.State",
                "name": "_state",
                "type": "uint8"
            }
        ],
        "name": "updateState",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_productId",
                "type": "uint256"
            }
        ],
        "name": "getProduct",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "enum SupplyChain.State",
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

const supplyChain = new web3.eth.Contract(abi, contractAddress);

async function createProduct() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const name = document.getElementById('productName').value;

    supplyChain.methods.createProduct(name).send({ from: accounts[0] })
        .on('receipt', (receipt) => {
            console.log('Product Created:', receipt);
        });
}

async function updateProductState() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const productId = document.getElementById('productId').value;
    const state = document.getElementById('productState').value;

    supplyChain.methods.updateState(productId, state).send({ from: accounts[0] })
        .on('receipt', (receipt) => {
            console.log('Product State Updated:', receipt);
        });
}

async function getProduct() {
    const productId = document.getElementById('productIdInfo').value;

    const product = await supplyChain.methods.getProduct(productId).call();
    document.getElementById('productInfo').innerText = `Product ID: ${product[0]}, Name: ${product[1]}, State: ${product[2]}`;
}
