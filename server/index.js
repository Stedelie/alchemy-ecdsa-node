const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { sha256 } = require("ethereum-cryptography/sha256");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
	"04294e7fa6c6ffe755caa6aadf92c3fa505d065717fb61f5cd8e5d09ffebac5d398c1e5668578559f3fe074810262aa26092a5ceb3e9965829dd083b6e88265065": 100, // privateKey: "f010b78db37d2734fb8d5ada949adef7d977650e363fcc26d4cd0d3ad0244fe7"
	"04feba697df23d6f3e3d213b4a73aa96fabf93ab5615be7f0121422805d33276466bdb14a4f8805fc23ee2fcd6169726b869366acbcd75ece8a89f32e90c516637": 50, // privateKey: "6b78972667337f58d1e4205303b1bc770dda620160922de8170f53cd53ead124"
	"04970ed4583ba4b4002f291a7fdf43f2a78869aee539e2483b828045ab90f774781fb68366f31b8a44580bcf5c711feaf3e304330b6aa3689153d45d17eaf2094b": 75, // privateKey: "5335ac6928427a4d0ed1ac8c97a1f115ec2abaae1f4e86e21dc0bffd81a6864b"
};

app.get("/balance/:address", (req, res) => {
	const { address } = req.params;
	const balance = balances[address] || 0;
	res.send({ balance });
});

app.post("/send", (req, res) => {
	const { signature, recovery, transactionHash, transaction } = req.body;

	const publicKey = toHex(
		secp.recoverPublicKey(transactionHash, signature, recovery)
	);

	const sender = publicKey;
	const recipient = transaction.to;
	const amount = transaction.amount;

	setInitialBalance(sender);
	setInitialBalance(recipient);

	if (
		// verify that the message is the same as the hashed message
		toHex(sha256(utf8ToBytes(JSON.stringify(transaction)))) !==
			transactionHash ||
		// and that the signature verify the message
		!secp.verify(signature, transactionHash, publicKey)
	)
		res.status(400).send({ message: "Message is compromised" });

	if (balances[sender] < amount) {
		res.status(400).send({ message: "Not enough funds!" });
	} else {
		balances[sender] -= amount;
		balances[recipient] += amount;
		res.send({ balance: balances[sender] });
	}
});

app.listen(port, () => {
	console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
	if (!balances[address]) {
		balances[address] = 0;
	}
}
