import { useState } from "react";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { sha256 } from "ethereum-cryptography/sha256";
import * as secp from "ethereum-cryptography/secp256k1";

import server from "./server";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    // remember: address is set to the publicKey
    const transaction = {
      from: address,
      to: recipient,
      amount: parseInt(sendAmount)
    }

    const transactionHash = toHex(sha256(utf8ToBytes(JSON.stringify(transaction))))

    const [signature, recovery] = await secp.sign(transactionHash, privateKey, {recovered: true})
    
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: toHex(signature),
        recovery,
        transactionHash,
        transaction,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
