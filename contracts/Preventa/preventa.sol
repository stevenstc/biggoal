pragma solidity >=0.8.17;
// SPDX-License-Identifier: Apache 2.0

library SafeMath {

  function mul(uint a, uint b) internal pure returns (uint) {
    if (a == 0) {
        return 0;
    }

    uint c = a * b;
    require(c / a == b);

    return c;
  }

  function div(uint a, uint b) internal pure returns (uint) {
    require(b > 0);
    uint c = a / b;

    return c;
  }

  function sub(uint a, uint b) internal pure returns (uint) {
    require(b <= a);
    uint c = a - b;

    return c;
  }

  function add(uint a, uint b) internal pure returns (uint) {
    uint c = a + b;
    require(c >= a);

    return c;
  }

}

interface BEP20_Interface {
  function allowance(address _owner, address _spender) external view returns (uint remaining);
  function transferFrom(address _from, address _to, uint _value) external returns (bool);
  function transfer(address direccion, uint cantidad) external returns (bool);
  function balanceOf(address who) external view returns (uint256);
  function decimals() external view returns (uint256);
  function totalSupply() external view returns (uint256);
}

abstract contract Context {

  constructor () { }

  function _msgSender() internal view returns (address payable) {
    return payable(msg.sender);
  }

  function _msgData() internal view returns (bytes memory) {
    this; 
    return msg.data;
  }
}

contract Preventa is Context{
  using SafeMath for uint;

  BEP20_Interface TOKEN_Contract = BEP20_Interface(0x4ebdEC0EeeE228fBfC120E31612AC5FdAC51220B);
  BEP20_Interface BUSD_Contract = BEP20_Interface(0xd5881b890b443be0c609BDFAdE3D8cE886cF9BAc);


  uint public MINIMO = 1 * 10**18;
  uint public PRECIO_COMPRA = 500000 * 10**18;
  uint public PRECIO_VENTA = 350000 * 10**18;
  uint public TOTAL_PREVENTA= 630000000*10**18;
  uint public TOTAL_REFERIDOS= 28350000*10**18;


  uint[] public niveles = [30,10,5];


  address[] public admins = [0x0c4c6519E8B6e4D9c99b09a3Cda475638c930b00,0x4707AfaecdA26bAf223954035d0A80FaeAFDD445,0xbB44d026e3F8E862356FbA72c6828Eb54D4F30F6,0x4707AfaecdA26bAf223954035d0A80FaeAFDD445];
  uint[] public porcentajes = [33,33,33,100];

  mapping (address => address) private padre;

  constructor() { }

  function comprar(uint _value, address _padre) public returns (bool){ // BUSD => TOKEN
    require(_value >= MINIMO);

    uint _token = (_value.mul(10**18)).div(PRECIO_COMPRA);

    if( !BUSD_Contract.transferFrom(msg.sender, address(this), _value) )revert();
    
    if( !TOKEN_Contract.transfer(msg.sender,  _token) )revert();

    if(padre[msg.sender] == address(0) && _padre != address(0)){
      padre[msg.sender] = _padre;

    }

    if( padre[msg.sender] != address(0) && TOTAL_REFERIDOS > _token.mul(niveles[0]).div(1000)){

      for (uint256 index = 0; index < niveles.length; index++) {
        if(_token.mul(niveles[index]).div(1000) <= TOTAL_REFERIDOS){
          TOKEN_Contract.transfer(_padre,  _token.mul(niveles[index]).div(1000));
          _padre = padre[_padre];
        }
      }
    }

    TOTAL_PREVENTA = TOTAL_PREVENTA.sub(_token);

    for (uint256 index = 0; index < admins.length; index++) {
      BUSD_Contract.transfer(admins[index], _value.mul(porcentajes[index]).div(1000));
      
    }

    return  true;

  }

  function vender(uint _value) public returns(bool){ // BUSD => TOKEN
    require(_value >= MINIMO);

    uint _token = (_value.mul(10**18)).div(PRECIO_VENTA);

    if( !TOKEN_Contract.transferFrom(msg.sender, address(this), _token) )revert();

    if( !BUSD_Contract.transfer( msg.sender, _value) )revert();

    TOTAL_PREVENTA = TOTAL_PREVENTA.add(_token);


    return  true;
  }

  fallback() external payable {}
  receive() external payable {}

}