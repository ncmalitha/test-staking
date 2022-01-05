import React, { Component } from "react";
import Navbar from "./Navbar";
import "./App.css";
import * as DaiToken from "../abis/DaiToken.json";
import * as DappToken from "../abis/DappToken.json";
import * as TokenFarm from "../abis/TokenFarm.json";
import Main from "./Main.js";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockChainData();
  }

  async loadBlockChainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    const networkId = await web3.eth.net.getId();

    console.log(networkId);

    this.setState({ account: accounts[0] });

    const daiTokenData = DaiToken.networks[networkId];
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(
        DaiToken.abi,
        daiTokenData.address
      );
      console.log(daiToken);

      this.setState({ daiToken: daiToken });

      console.log("daiToken", this.state.daiToken);

      const daiTokenBalance = await daiToken.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ daiTokenBalance: daiTokenBalance.toString() });
      console.log(daiTokenBalance);
    }

    const dappTokenData = DappToken.networks[networkId];
    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(
        DappToken.abi,
        dappTokenData.address
      );
      console.log(dappToken);

      this.setState({ dappToken: dappToken });

      const dappTokenBalance = await dappToken.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ dappTokenBalance: dappTokenBalance.toString() });
      console.log(dappTokenBalance);
    }

    const tokenFarmData = TokenFarm.networks[networkId];
    console.log(tokenFarmData);
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(
        TokenFarm.abi,
        tokenFarmData.address
      );
      console.log(tokenFarm);

      this.setState({ tokenFarm: tokenFarm });

      const tokenFarmBalance = await tokenFarm.methods
        .stakingBalance(this.state.account)
        .call();
      this.setState({ stakingBalance: tokenFarmBalance.toString() });
      console.log(tokenFarmBalance, "boo");
    }

    this.setState({ loading: false });
  }
  async loadWeb3() {
    const Web3 = require("web3");
    const ethEnabled = () => {
      if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        window.ethereum.enable();
        return true;
      }
      return false;
    };

    if (!ethEnabled()) {
      window.alert("Non Etherium wallet installed!");
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true });
    this.state.daiToken.methods
      .approve(this.state.tokenFarm._address, amount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        console.log(hash);
        console.log(this.state.tokenFarm.methods);

        this.state.tokenFarm.methods
          .stakeTokens(amount)
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            this.setState({ loading: false });
          });
      });
  };

  unstakeTokens = () => {
    this.setState({ loading: true });
    this.state.tokenFarm.methods
      .unstake()
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: "0",
      dappTokenBalance: "0",
      stakingBalance: "0",
      loading: true,
    };
  }

  render() {
    let content;

    if (this.state.loading) {
      content = (
        <p id="loader" className="textCenter">
          Loading ...
        </p>
      );
    } else {
      content = (
        <Main
          daiTokenBalance={this.state.daiTokenBalance}
          dappTokenBalance={this.state.dappTokenBalance}
          stakingBalance={this.state.stakingBalance}
          stakeTokens={this.stakeTokens}
          unstake={this.unstakeTokens}
        ></Main>
      );
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">{content}</div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
