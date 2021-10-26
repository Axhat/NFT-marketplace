Moralis.initialize('bO1WB9EvEUSN4HJr5QDi2uPuAtn9ZQb5Mh9DpyWG');
Moralis.serverURL = 'https://i8yg7a7uekwm.usemoralis.com:2053/server'
const TOKEN_CONTRACT_ADDRESS = "0x612789008e911C588870DFE498d1aCd466F5c5C8";

init = async () => {
    hideElements(userInfo);
    hideElements(createItemForm);
    window.web3 = await Moralis.Web3.enable();
    window.tokenContract = new web3.eth.Contract(tokenContractAbi,TOKEN_CONTRACT_ADDRESS);
    initUser();
}

initUser = async () => {
    if(await Moralis.User.current())
    {
        hideElements(userConnectButton);
        showElements(userProfileButton);
        showElements(openCreateItemButton);
    }else{
        showElements(userConnectButton);
        hideElements(userProfileButton);
        hideElements(openCreateItemButton);
    }
}

login = async () => {
    try{
        await Moralis.Web3.authenticate();
        initUser();
    }catch (error) {
        alert(error)
    }
}

logout = async () => {
    await Moralis.User.logOut();
    hideElements(userInfo);
    initUser();
}

openUserInfo = async () => {
    user = await Moralis.User.current();
    if (user) {
        const email = user.get('Email');
        if(email){
            userEmailField.value = email;
        }else{
            userEmailField.value = "";
        }

        userUsernameField.value = user.get('Username');

        const userAvatar = user.get('Avatar');
        if(userAvatar){
            userAvatarImg.src = userAvatar.url();
            showElements(userAvatarImg);
        }else{
            hideElements(userAvatarImg);
        }
        showElements(userInfo);
    }else{
        login();
    }
}


saveUserInfo = async () => {
    console.log("ok ok");
    user.set('Email', userEmailField.value);
    user.set('Username', userUsernameField.value);

    if (userfileAvatar.files.length > 0) {
        const avatar = new Moralis.File("avatar1.jpg", userfileAvatar.files[0]);
        user.set('Avatar', avatar);
    }

    await user.save();
    alert("User info saved successfully!");
    openUserInfo();
}

createItem = async () => {
    
    const nftFile = new Moralis.File("nftFile.jpg",createItemFile.files[0]);
    await nftFile.saveIPFS();

    const nftFilePath = nftFile.ipfs();
    const nftFileHash = nftFile.hash();

    const metadata = {
        name : createItemNameField.value,
        description: createItemDescriptionField.value,
        image : nftFilePath
    };

    const nftFileMetadataFile = new Moralis.File("file.json", {base64 : btoa(JSON.stringify(metadata.json))});
    await nftFile.saveIPFS();

    const nftFileMetadataFilePath = nftFile.ipfs();
    const nftFileHashMetadataFile = nftFile.hash();

    const nftid = await mintNft(nftFileMetadataFile);

    // Simple syntax to create a new subclass of Moralis.Object.
    const Item = Moralis.Object.extend("Item");
    // Create a new instance of that class.
    const item = new Item();
    item.set('name',createItemNameField.value);
    item.set('description',createItemDescriptionField.value);
    item.set('nftFilePath',nftFilePath);
    item.set('nftFileHash',nftFileHash);
    item.set('metadataFilePath',nftFileMetadataFilePath);
    item.set('metadataFileHash',nftFileHashMetadataFile);
    item.set('nftid',nftid);
    item.set('nftContractAddress',TOKEN_CONTRACT_ADDRESS);
    await item.save();
    console.log(item);
}

mintNft = async (metadataUrl) => {
    const receipt = await tokenContract.methods.createItem(metadataUrl).send({from: ethereum.selectedAddress});
    console.log(receipt);
    return receipt.events.Transfer.returnValues.tokenId;
}

hideElements = (element) => element.style.display = 'none';
showElements = (element) => element.style.display = 'block';

const userConnectButton = document.getElementById("connectWallet");
userConnectButton.onclick = login;

const userProfileButton = document.getElementById("profile");
userProfileButton.onclick = openUserInfo;

//User Creation
const userInfo = document.getElementById("userInfo");
const userUsernameField = document.getElementById("Username");
const userEmailField = document.getElementById("Email");
const userAvatarImg = document.getElementById("Avatar");
const userfileAvatar = document.getElementById("fileAvatar");

document.getElementById("btnClose").onclick = () => hideElements(userInfo);
document.getElementById("btnLogout").onclick = logout;
document.getElementById("btnSaveUserInfo").onclick = saveUserInfo;

//Item Creation
const createItemForm = document.getElementById("createItem");

const createItemNameField = document.getElementById("txtCreateItemName");
const createItemDescriptionField = document.getElementById("txtCreateItemDescription");
const createItemPriceField = document.getElementById("numCreateItemPrice");
const createItemStatusField = document.getElementById("selectCreateItemStatus");
const createItemFile = document.getElementById("fileCreateItemFile");
document.getElementById("btnCloseCreateItem").onclick = () => hideElement(createItemForm);
document.getElementById("btnCreateItem").onclick = createItem;

const openCreateItemButton = document.getElementById("btnOpenCreateItem");
openCreateItemButton.onclick = () => showElements(createItemForm);
document.getElementById("btnCloseCreateItem").onclick = () => hideElements(createItemForm);
document.getElementById("btnCreateItem").onclick = createItem;

init();

btnOpenCreateItem