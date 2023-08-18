import React, { Component } from "react";
var BigNumber = require('bignumber.js');
BigNumber.config({ ROUNDING_MODE: 3 });

export default class HomeFan extends Component {
  constructor(props) {
    super(props);

    this.state = {
      myInventario: [],
      itemsYoutube: [],
      balanceCSC: 0,
      balanceContract: 0
    };

    this.balance = this.balance.bind(this);
    this.items = this.items.bind(this);
    this.myItems = this.myItems.bind(this);
    this.votar = this.votar.bind(this);
  }

  async componentDidMount() {
    setInterval(() => {
      this.balance();
      this.items();
      this.myItems();
    }, 3 * 1000);
  }

  async balance() {
    var balance = await this.props.wallet.contractToken.methods
    .balanceOf(this.props.currentAccount).call({ from: this.props.currentAccount });

    balance = new BigNumber(balance).shiftedBy(-18).decimalPlaces(6).toString(10);


    var balanceContract = await this.props.wallet.contractToken.methods
    .balanceOf(this.props.wallet.contractMatch2._address).call({ from: this.props.currentAccount });

    balanceContract = new BigNumber(balanceContract).shiftedBy(-18).decimalPlaces(2).toString(10);


    this.setState({
      balanceCSC: balance,
      balanceContract: balanceContract
    });
  }

  async votar(id) {

    var largo = await this.props.wallet.contractMatch2.methods
    .largoFanItems(this.props.currentAccount)
    .call({ from: this.props.currentAccount });

    var votosTeam = 0;

    for (let index = 0; index < largo; index++) {

      var invent = await this.props.wallet.contractMatch2.methods
        .verFanItems(this.props.currentAccount, index)
        .call({ from: this.props.currentAccount });
        
      if (invent) {
        votosTeam++;
      }
    }

    if(votosTeam >= 1){
      alert("max of votes reached");
      return;
    }

    var inicio = await this.props.wallet.contractMatch2.methods
      .inicio()
      .call({ from: this.props.currentAccount });
    inicio = inicio*1000;

    var fin = await this.props.wallet.contractMatch2.methods
      .fin()
      .call({ from: this.props.currentAccount });
    fin = fin*1000;

    if(Date.now() > fin){alert("This vote is over. look for a new match"); return;}

    var aprovado = await this.props.wallet.contractToken.methods
      .allowance(this.props.currentAccount, this.props.wallet.contractMatch2._address)
      .call({ from: this.props.currentAccount });

    var balance = await this.props.wallet.contractToken.methods
    .balanceOf(this.props.currentAccount)
    .call({ from: this.props.currentAccount });

    var valor = await this.props.wallet.contractMatch2.methods
      .valor()
      .call({ from: this.props.currentAccount });

    if(balance/10**18 >= valor/10**18){
      if (aprovado <= 0) {
        await this.props.wallet.contractToken.methods
        .approve(this.props.wallet.contractMatch2._address, "115792089237316195423570985008687907853269984665640564039457584007913129639935")
        .send({ from: this.props.currentAccount });

      }

      if(Date.now() < inicio){alert("Match no started plese wait"); return;}

      await this.props.wallet.contractMatch2.methods
      .votar(id)
      .send({ from: this.props.currentAccount });

      alert("Vote is done");

    }else{
      alert("insuficient Founds")
    }

  }

  async items() {
    var itemsYoutube = [];

    var result = await this.props.wallet.contractMatch2.methods
      .largoItems()
      .call({ from: this.props.currentAccount });

    var inicio = await this.props.wallet.contractMatch2.methods
      .inicio()
      .call({ from: this.props.currentAccount });
    inicio = inicio*1000;

    var fin = await this.props.wallet.contractMatch2.methods
      .fin()
      .call({ from: this.props.currentAccount });
    fin = fin*1000;

    var eliminated = [
      {},{},{},
      {},{},{},
      {},{},{},
      {},{},{},
      {},{},{},
      {},{},{},
      {},{},{},
      {},{},{},
      {},{},{},
      {},{},{},
      {},{}

    ];

    var filterElimitaded = [
      {filter:"grayscale(100%)"},{filter:"grayscale(100%)"},{filter:"grayscale(100%)"},
      {filter:"grayscale(100%)"},{filter:"grayscale(100%)"},{filter:"grayscale(100%)"},
      {filter:"grayscale(100%)"},{filter:"grayscale(100%)"},{filter:"grayscale(100%)"},
      {filter:"grayscale(100%)"},{filter:"grayscale(100%)"},{filter:"grayscale(100%)"},
      {filter:"grayscale(100%)"},{filter:"grayscale(100%)"},{filter:"grayscale(100%)"},
      {filter:"grayscale(100%)"}
    ]

    for (let index = 0; index < result; index++) {

      var valor = await this.props.wallet.contractMatch2.methods
        .valor()
        .call({ from: this.props.currentAccount });

       //console.log(valor)

       valor = valor/10**18 +" GCP";

      if(Date.now() > fin){
        valor = "Finished";
        eliminated = filterElimitaded;
      }

      if(Date.now() < inicio){
        valor = "Soon...";
      }

      if(eliminated[index].filter){
        //valor = "Eliminated";
      }

      var votos = await this.props.wallet.contractMatch2.methods
        .votos(index)
        .call({ from: this.props.currentAccount });

        var imageTeams = ["eeuu.png","Empate.png","wales.png"]
        var nameTeams = ["EEUU","Empate","Wales"]

      itemsYoutube[index] = (
          <div className="col-sm-4 p-3 mb-5 text-center monedas position-relative"  key={`items-${index}`}>
            
            <img
              className=" pb-2"
              src={"images/"+imageTeams[index]}
              style={eliminated[index]} 
              width="100%"
              alt="equipo del mundial"
            />
            <h2 className=" pb-2">{nameTeams[index]}</h2>
            <h2 className="centradoFan">
              <b>{votos} votes</b>
            </h2>

            <div className="contenedor" onClick={() => this.votar(index)} style={{cursor:"pointer"}}>
              <div className="centrado" id="content_div_one_photo">
                <img src="assets/img/moneda.png" alt="goal crypto boton" width="30px"/>
                {"  "}<b>{valor}</b>
                </div>
            </div>
            
           
            
          </div>
      );
    }

    this.setState({
      itemsYoutube: itemsYoutube,
      inicio: (new Date(inicio)).toString(),
      fin: (new Date(fin)).toString()
    });
  }

  async myItems() {
    var largo = await this.props.wallet.contractMatch2.methods
    .largoFanItems(this.props.currentAccount)
    .call({ from: this.props.currentAccount });

    var myInventario = [];

    var verGanador = await this.props.wallet.contractMatch2.methods
      .verGanador()
      .call({ from: this.props.currentAccount });

      console.log(largo);


    for (let index = 0; index < largo; index++) {
      var votos = await this.props.wallet.contractMatch2.methods
        .votos(index)
        .call({ from: this.props.currentAccount });

      var invent = await this.props.wallet.contractMatch2.methods
        .verFanItems(this.props.currentAccount, index)
        .call({ from: this.props.currentAccount });

      var claim = (<></>);

      if(verGanador !== largo){

        if (verGanador === index+""){

          claim = (
          <button
            className="btn btn-info"
            onClick={async() => await this.props.wallet.contractMatch2.methods
              .reclamar()
              .send({ from: this.props.currentAccount })}
          >
              Claim Prize
          </button>
          );
        }

      }

      var imageTeams = ["eeuu.png","Empate.png","wales.png"]
      var nameTeams = ["EEUU","Empate","Wales"]

      if (invent) {
        myInventario[index] = (
            <div className="col-sm-4 p-4 mb-5 text-center monedas" style={{ border: "1px", borderStyle: "solid", borderRadius: "15px", borderColor: "white", backgroundColor: "#6c757d"}} key={`items-${index}`}>
              <h2 className=" pb-4">{nameTeams[index]}</h2>
              <p>{votos} global votes</p>
              <img
                className=" pb-4"
                src={"images/"+imageTeams[index]}
                width="100%"
                alt=" imagen team wold cup"
              />
              
              {claim}
            </div>
        );
      }
    }

    this.setState({
      myInventario: myInventario,
    });
  }

  render() {
    return (
      <>

        <header className="masthead text-center text-white">
          <h2>Match #2 | Pool {this.state.balanceContract} GCP</h2>
          <div className="masthead-content bg-image"
                style={{ backgroundImage: "url('images/fondo.png')", backgroundSize: "100%", backgroundPosition: "center",backgroundRepeat: "no-repeat"}}>
            <div className="container px-5">
              <div className="row justify-content-md-center">
                {this.state.itemsYoutube}
              </div>
              <div className="row justify-content-md-center">
                <div className="col-12">
                  Start: {this.state.inicio} | End: {this.state.fin}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mt-3 mb-3">
         
          <div style={{ marginTop: "30px" }} className="row text-center">
            <div className="col-md-12">
              <h3>Votes to Match #2</h3>{" "}
              <hr color="white"></hr>
            </div>
          </div>

          <div className="row text-center" id="inventory">
            {this.state.myInventario}
          </div>
          <hr color="white"></hr>
        </div>
        
      </>
    );
  }
}
