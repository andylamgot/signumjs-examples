function getRecipientAccountId() {
  let accountId = document.getElementById('address-field').value.trim();
  if (b$util.isBurstAddress(accountId)) {
    accountId = b$util.convertAddressToNumericId(accountId);
  }
  return accountId;
}

function getPassphrase() {
  return document.getElementById('passphrase-field').value.trim();
}

function getMessage() {
  return document.getElementById('message-field').value.trim();
}

function validateForm() {
  const recipientId = getRecipientAccountId()
  const passphrase = getPassphrase()
  const message = getMessage()

  const ne = s => s && s.length > 0

  const isValid = ne(recipientId) && ne(passphrase) && ne(message)
  if (isValid) {
    document
      .getElementById('send-button')
      .removeAttribute('disabled')
  } else {
    document
      .getElementById('send-button')
      .setAttribute('disabled', 'disabled')
  }
}


async function sendMessage() {
  const recipientId = getRecipientAccountId()
  const passphrase = getPassphrase()
  const message = getMessage()

  const keys = b$crypto.generateMasterKeys(passphrase)

  const params = {
    feePlanck: b$util.BurstValue.fromBurst(0.025).getPlanck(),
    recipientId,
    message,
    messageIsText: true,
    senderPrivateKey: keys.signPrivateKey,
    senderPublicKey: keys.publicKey
  }

  console.log('params', params)

  try {
    await window.BurstApi.message.sendMessage(params)
  } catch (e) {
    console.error('Oh Snap', e.message)
  }
}

function updateNetwork(newNodeHost) {
  if (window.ApiSettings.nodeHost !== newNodeHost) {
    window.ApiSettings.nodeHost = newNodeHost;
    window.BurstApi = b$.composeApi(window.ApiSettings);
  }
}

function listenAndValidate(id) {
  document.getElementById(id).addEventListener('keyup', validateForm)
}

function main() {

  const networkSelector = document.getElementById('network-selector');
  networkSelector.addEventListener('change', e => {
    updateNetwork(e.target.value)
  });

  listenAndValidate('passphrase-field')
  listenAndValidate('address-field')
  listenAndValidate('message-field')

  window.ApiSettings = new b$.ApiSettings(networkSelector.value, "burst");
  window.BurstApi = b$.composeApi(window.ApiSettings);

}
