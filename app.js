// Chargement Web3 et connexion a metamask
if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask ok');
    ethereum.request({ method: 'eth_requestAccounts' });
}

//instance supply chain
const web3 = new Web3(window.ethereum);

// chargement de l'ABI et l'adresse d'un contrat à partir des fichiers json buildés
async function loadContractData(contractName) {
    try {
        const response = await fetch(`./build/contracts/${contractName}.json`);
        const contractData = await response.json();
        return {
            abi: contractData.abi,
            address: contractData.networks[Object.keys(contractData.networks)[0]].address
        };
    } catch (error) {
        console.error(`Erreur lors du chargement des données du contrat ${contractName}:`, error);
        throw error;
    }
}

let auth, supplyChain;

//init des contrats auth et SupplyChain
async function initializeContracts() {
    try {
        const authContractData = await loadContractData('Auth');
        auth = new web3.eth.Contract(authContractData.abi, authContractData.address);
        console.log(`Contrat Auth chargé : Adresse ${authContractData.address}`);

        const supplyChainContractData = await loadContractData('SupplyChain');
        supplyChain = new web3.eth.Contract(supplyChainContractData.abi, supplyChainContractData.address);
        console.log(`Contrat SupplyChain chargé : Adresse ${supplyChainContractData.address}`);
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des contrats:', error);
    }
}

// fct qui se declenche au chargement de la page
window.onload = async () => {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask détecté');
        await ethereum.request({ method: 'eth_requestAccounts' });
        await initializeContracts();
    } else {
        console.log('MetaMask non détecté');
    }
};


async function updateProductStateWithAuth() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    try{
        const username = await auth.methods.authenticate().call({ from: accounts[0] });
        console.log(`Utilisateur authentifié : ${username}`)

    }
    catch (error) {
        console.error('Erreur d\'authentification:', error);
        alert('Vous devez être enregistré pour mettre à jour un produit.');
    }
    const productId = document.getElementById('productId').value;
    const state = document.getElementById('productState').value;

    supplyChain.methods.updateState(productId, state).send({ from: accounts[0] })
        .on('receipt', (receipt) => {
            console.log('Product State Updated:', receipt);
        });

}

async function getProductWithAuth() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    try{
        const username = await auth.methods.authenticate().call({ from: accounts[0] });
        console.log(`Utilisateur authentifié : ${username}`)
        const productId = document.getElementById('productIdInfo').value;
        const product = await supplyChain.methods.getProduct(productId).call();
        document.getElementById('productInfo').innerText = `Product ID: ${product[0]}, Name: ${product[1]}, State: ${product[2]}`;}
    catch (error) {
        console.error('Erreur d\'authentification:', error);
        alert('Vous devez être enregistré pour obtenir un produit.');
    }

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



