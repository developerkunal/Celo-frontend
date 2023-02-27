import React from "react";
import { ethers } from "ethers";
import contractAbi from "./abi/NFT.json";
import {
  Card,
  Container,
  Nav,
  Navbar,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";

const contractAddress = "0x0B5f20cb8a764Df011abA9f76385Be9CbBcB7e80"; // Replace with your contract address
function App() {
  const [walletAddress, setWalletAddress] = React.useState(null);
  const [userNFt, setuserNFT] = React.useState(null);
  const connectToWallet = async () => {
    try {
      await window.ethereum.enable();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      console.log("Wallet connected:", walletAddress);
    } catch (error) {
      console.error(error);
    }
  };

  const disconnectFromWallet = async () => {
    try {
      await window.ethereum.request({
        method: "eth_requestAccounts",
        accounts: [],
      });
      setWalletAddress(null);
      console.log("Wallet disconnected");
    } catch (error) {
      console.error(error);
    }
  };
  React.useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum.isConnected()) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        console.log("Wallet connected:", walletAddress);
      } else {
        console.log("Wallet not connected");
      }
    };
    checkWalletConnection();
    if (walletAddress) {
      listTokensOfOwner();
    }
  }, [walletAddress]);
  async function listTokensOfOwner() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const contract = new ethers.Contract(
      contractAddress,
      contractAbi.abi,
      provider
    );

    const sentLogs = await contract.queryFilter(
      contract.filters.Transfer(walletAddress, null)
    );
    const receivedLogs = await contract.queryFilter(
      contract.filters.Transfer(null, walletAddress)
    );

    const logs = sentLogs
      .concat(receivedLogs)
      .sort(
        (a, b) =>
          a.blockNumber - b.blockNumber ||
          a.transactionIndex - b.transactionIndex
      );

    const owned = new Set();

    for (const log of logs) {
      const { from, to, tokenId } = log.args;

      if (addressEqual(to, walletAddress)) {
        owned.add(tokenId.toString());
      } else if (addressEqual(from, walletAddress)) {
        owned.delete(tokenId.toString());
      }
    }

    const uri = [];
    for (const own of owned) {
      const tokenuri = await tokenUri(own);
      const response = await axios.get(tokenuri);

      uri.push(response.data);
    }
    setuserNFT(uri);
  }
  console.log(userNFt);
  async function tokenUri(id) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const contract = new ethers.Contract(
      contractAddress,
      contractAbi.abi,
      provider
    );
    const url = await contract.tokenURI(id);
    return url.toString();
  }
  function addressEqual(a, b) {
    return a.toLowerCase() === b.toLowerCase();
  }
  return (
    <div style={{ backgroundColor: "white" }}>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="/">NFT Minter</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            {!walletAddress ? (
              <>
                <Nav.Link href="#" onClick={connectToWallet}>
                  Connect
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link href="#" onClick={disconnectFromWallet}>
                  Disconnect
                </Nav.Link>
              </>
            )}
            <Nav.Link href="/viewnft">View NFTs</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Container>
        {walletAddress && (
          <>
            <Row xs={1} md={4} className="g-4">
              {userNFt &&
                userNFt.map((item, i) => {
                  return (
                    <Col>
                      <Card style={{ width: "18rem" }} className="mx-auto mt-5">
                        <Card.Img variant="top" src={item.image} />
                        <Card.Body>
                          <Card.Title>{item.name}</Card.Title>
                          <Card.Text>{item.description}</Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

export default App;
