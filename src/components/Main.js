import React, { Component } from "react";

class Main extends Component {
  render() {
    return (
      <div>
      
        <table className="table table-borderless text-muted text-center">
          <thead>
            <tr>
              <th scope="col">Staking Balance</th>
              <th scope="col">Reward Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {window.web3.utils.fromWei(this.props.stakingBalance, "Ether")} MDAI
              </td>
              <td>
                {window.web3.utils.fromWei(
                  this.props.dappTokenBalance,
                  "Ether"
                )} DAPP
              </td>
            </tr>
          </tbody>
        </table>

        <div className="card mb-4">
          <div className="card-body">
            <form className="mb-3" onSubmit={(event) => {
              event.preventDefault();
              let amount;
              amount = this.input.value.toString();
              amount = window.web3.utils.toWei(amount, 'Ether');
              this.props.stakeTokens(amount)
            }}>
              <div>
                <label className="float-left">
                  <b>Stake Tokens</b>
                </label>
                <span className="float-right text-muted">
                Balance: {window.web3.utils.fromWei(this.props.daiTokenBalance, "Ether")} MDAI
                  
                </span>
              </div>
              <div className="input-group mb-4">
                <input
                  type="number"
                  ref={(input) => { this.input = input}}
                  className="form-control form-control-lg"
                  placeholder="0"
                  required
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    {/* <img src={dai} height="32" alt=""/> */}
                    &nbsp; mDAI
                  </div>
                </div>

                
              </div>
              <button type="submit" className="btn btn-primary btn-lg">Stake</button>
              <button type="submit" className="btn btn-secondary btn-lg" onClick={(input) => { 
                let amount = this.input.value.toString();
                amount = window.web3.utils.toWei(amount, 'Ether');
                this.props.unstakeTokenWithAmount(amount);
              }
                }>Withdraw</button>
              <button type="submit" className="btn btn-link btn-block btn-lg" onClick={(input) => {this.props.unstake()}}>Withdraw All</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
