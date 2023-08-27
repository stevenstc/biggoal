import React, { Component } from "react";

const BigNumber = require('bignumber.js');

export default class Swap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      inventario: [],
      itemsMarket: [(
        <div className="col-12 p-3 mb-5 text-center monedas position-relative" key={`items-0`}>
          <h2 className=" pb-2">Loading... please wait</h2>
        </div>
    )],
      balance: "Loading...",
      balanceTOKEN: 0,
      balanceUSD: 0
    }

    this.balance = this.balance.bind(this);
    this.buypack = this.buypack.bind(this);
    this.update = this.update.bind(this);

  }

  async componentDidMount() {
    this.update();
    setInterval(()=>{
      this.update();
    },15*1000)
    
  }

  async update() {

    this.balance();

  }

  async balance() {
    var balance = await this.props.wallet.contractPreSale.methods
        .TOTAL_PREVENTA()
        .call({ from: this.props.currentAccount });

    balance = new BigNumber(balance).shiftedBy(-18).decimalPlaces(6).toString(10);

    var balanceTOKEN = await this.props.wallet.contractToken.methods
        .balanceOf(this.props.currentAccount)
        .call({ from: this.props.currentAccount });

        balanceTOKEN = new BigNumber(balanceTOKEN).shiftedBy(-18).decimalPlaces(6).toString(10);

    var balanceUSD = await this.props.wallet.contractUSDT.methods
        .balanceOf(this.props.currentAccount)
        .call({ from: this.props.currentAccount });

    balanceUSD = new BigNumber(balanceUSD).shiftedBy(-18).decimalPlaces(6).toString(10);

    this.setState({
      balance: balance,
      balanceUSD: balanceUSD,
      balanceTOKEN: balanceTOKEN
    });
  }


  async buypack() {

    var aprovado = await this.props.wallet.contractUSDT.methods
    .allowance(this.props.currentAccount, this.props.wallet.contractPreSale._address)
    .call({ from: this.props.currentAccount });

    console.log(this.props.currentAccount, this.props.wallet.contractPreSale._address)

    aprovado = new BigNumber(aprovado).shiftedBy(-18).decimalPlaces(2).toNumber(10);

    console.log(aprovado)
    if(aprovado <= 0){
      alert("insuficient aproved balance")
      await this.props.wallet.contractUSDT.methods
      .approve(this.props.wallet.contractPreSale._address, "115792089237316195423570985008687907853269984665640564039457584007913129639935")
      .send({ from: this.props.currentAccount });
    }

    var amount = prompt("how much do you want to buy in BUSD",1)

    var padre = "0x0000000000000000000000000000000000000000"
    if(window.confirm("have refferal?")){
      padre = prompt("entrer wallet of referal", "0x0000000000000000000000000000000000000000")
    }
    
    
    if(amount >= 1){
      amount = new BigNumber(amount).shiftedBy(18).decimalPlaces(0).toString(10);
      await this.props.wallet.contractPreSale.methods.comprar(amount,padre).send({ from: this.props.currentAccount });

    }else{
      alert("error: amount")
    }
    this.update();
    alert("BGOL Buyed!")
    
  }


  render() {
    return (
      <>
      <img className="img-fluid" src="assets/img/banner-nft.png" alt="" width="100%"></img>

      <header className="masthead text-center ">
      <div className="masthead-content">
        <div className="container px-5">
        <div className="row">
            <div className="col-lg-12 col-md-12 p-4 text-center  text-white">
              <h2 className=" pb-4">BGOL available in presale: {this.state.balance}</h2>
            </div>

          </div>
          <div className="row mt-1" style={{backgroundColor: "#461829", borderRadius: "30px"}}>
            <div className="col-12 p-4 text-center">
              <h2 className=" pb-4">Swap</h2>
            </div>

            <div className="col-lg-6 col-md-12 p-4 text-center"  style={{cursor: "pointer"}} >
              <img className="img-fluid" src="assets/img/pack1.png" alt="" ></img>
              <input type="number" ></input>
              <h2 className=" pb-4"><button className="btn btn-warning btn-lg" onClick={()=>{this.buypack(1)}}><b>Buy for 715 BUSD</b></button></h2>
            </div>

            <div className="col-lg-6 col-md-12 text-center"  style={{cursor: "pointer"}} >
              <img className="img-fluid" src="assets/img/pack2.png" alt="" ></img>
              <input type="number" ></input>
              <h2 className=" pb-4"><button className="btn btn-warning btn-lg" onClick={()=>{this.buypack(2)}}><b>Sell for 430 BUSD</b></button></h2>
              
            </div>

          </div>
          <div className="row">
            <div className="col-12 p-4 text-center">
              <h2 className=" pb-4">My BGOL: {this.state.balanceTOKEN}</h2>
            </div>

            
          </div>
        </div>
      </div>
    </header>

      </>
    );
  }
}
