import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

import server from "./server";

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKeyValue = evt.target.value;
    setPrivateKey(privateKeyValue)

    const publicKey = toHex(secp.getPublicKey(privateKeyValue));

    setAddress(publicKey)

    if (publicKey) {
      const {
        data: { balance },
      } = await server.get(`balance/${publicKey}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type a privateKey" value={privateKey} onChange={onChange}></input>
      </label>

      <label>
        Address
        <input disabled placeholder="Address" value={address}></input>
      </label>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
