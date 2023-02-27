import React from "react";
import { ethers } from "ethers";
import contractAbi from "./abi/NFT.json";
import {
  Button,
  Card,
  Container,
  Nav,
  Navbar,
  Form,
  Spinner,
} from "react-bootstrap";

const contractAddress = "0x0B5f20cb8a764Df011abA9f76385Be9CbBcB7e80"; // Replace with your contract address
function App() {
  const [walletAddress, setWalletAddress] = React.useState(null);
  const [spinner, setSpinner] = React.useState(false);

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

  const mintNFT = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi.abi,
        signer
      );
     
        setSpinner(true);
        await contract.safeMint({ from: walletAddress });
        setSpinner(false);
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
  }, []);
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
            <Nav.Link href="viewnft">View NFTs</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Container>
        <Card style={{ width: "18rem" }} className="mx-auto mt-5">
          <Card.Img
            variant="top"
            src={`data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHZpZXdCb3g9IjAgMCAzNTAgMzUwIj48c3R5bGU+LmJhc2UgeyBmaWxsOiB3aGl0ZTsgZm9udC1mYW1pbHk6IHNlcmlmOyBmb250LXNpemU6IDE0cHg7IH08L3N0eWxlPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9ImJsYWNrIiAvPjx0ZXh0IHg9IjEwIiB5PSIyMCIgY2xhc3M9ImJhc2UiPkNFTE9FVVI8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjQwIiBjbGFzcz0iYmFzZSI+UHJpY2UgOjczMjAwMDwvdGV4dD48dGV4dCB4PSIxMCIgeT0iNjAiIGNsYXNzPSJiYXNlIj48L3RleHQ+PC9zdmc+`}
          />
          <Card.Body>
            <Form>
             
              {walletAddress && (
                <>
                  {spinner === false ? (
                    <Button variant="primary" onClick={mintNFT}>
                      Mint NFT
                    </Button>
                  ) : (
                    <Button variant="primary" disabled>
                      <Spinner
                        as="span"
                        animation="grow"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      Loading...
                    </Button>
                  )}
                </>
              )}
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default App;
