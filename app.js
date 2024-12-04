// Chargement Web3 et connexion a metamask
if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask ok');
    ethereum.request({ method: 'eth_requestAccounts' });
}

//instance supply chain
const web3 = new Web3(window.ethereum);
const supplyChainAddress = '0x553F970d3f2c6734602EEf0191380C64D4912705'; // Adresse du contratnpm start supply chain a changer apres migrate
const supplyChainabi = [ // tableau à changer après chaque migrate
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
//instance authentification
const authAddress = '0x08Bfd40bf022A00e919Af563a6b05D2501E7f47c'; // Adresse de Auth.sol
const authAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "userAddress",
                "type": "address"
            }
        ],
        "name": "UserAuthenticated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "userAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "username",
                "type": "string"
            }
        ],
        "name": "UserRegistered",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "string",
                "name": "_username",
                "type": "string"
            }
        ],
        "name": "register",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "authenticate",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];
const auth = new web3.eth.Contract(authAbi, authAddress);

const supplyChain = new web3.eth.Contract(supplyChainabi, supplyChainAddress);

async function createProductWithAuth() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    try {
        const username = await auth.methods.authenticate().call({ from: accounts[0] });
        console.log(`Utilisateur authentifié : ${username}`);

        const name = document.getElementById('productName').value;
        await supplyChain.methods.createProduct(name).send({ from: accounts[0] });
        alert('Produit créé avec succès.');
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        alert('Vous devez être enregistré pour créer un produit.');
    }
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


async function registerUser() {
    try {
        // Récupération des comptes disponibles
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const username = document.getElementById('username').value;

        if (!username) {
            console.log("Nom d'utilisateur vide");
            return;
        }

        console.log("Tentative d'enregistrement de l'utilisateur :", username);
        console.log("Adresse utilisée :", accounts[0]);
        console.log("Contrat Auth utilisé :", auth.options.address);

        // Appel de la méthode register
        const receipt = await auth.methods.register(username).send({ from: accounts[0] });

        console.log("Enregistrement réussi :", receipt);
        document.getElementById('userStatus').innerText = "Enregistrement réussi";
    } catch (error) {
        console.error("Erreur d'enregistrement :", error);

        if (error.message.includes("User already registered")) {
            document.getElementById('userStatus').innerText = "Utilisateur déjà enregistré";
        } else {
            document.getElementById('userStatus').innerText = "Erreur d'enregistrement";
        }
    }
}



async function authenticateUser() {
    // Demander à Metamask d'afficher l'adresse
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];  // L'adresse du compte Metamask

    // Appel au contrat intelligent pour récupérer le nom de l'utilisateur
    try {
        const username = await auth.methods.authenticate().call({ from: account });
        document.getElementById('userStatus').innerText = `Nom d'utilisateur : ${username}`;
    } catch (error) {
        console.error('Utilisateur non enregistré:', error);
        document.getElementById('userStatus').innerText = 'Utilisateur non enregistré';
    }
}



