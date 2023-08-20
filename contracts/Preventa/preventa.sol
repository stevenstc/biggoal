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

  BEP20_Interface BUSD_Contract = BEP20_Interface(0xb775Aa16C216E34392e91e85676E58c3Ad72Ee77);
  BEP20_Interface TOKEN_Contract = BEP20_Interface(0xb775Aa16C216E34392e91e85676E58c3Ad72Ee77);


  uint public MINIMO = 1 * 10**18;
  uint public PRECIO_COMPRA = 500000 * 10**10;
  uint public PRECIO_VENTA = 350000 * 10**10;

  uint[] public niveles = [30,10,5];

  mapping (address => address) private padre;

  constructor() { }

  function comprar(uint _value, address _padre) public returns (bool){ // BUSD => TOKEN
    require(_value >= MINIMO);

    uint _token = (_value.mul(10**18)).div(PRECIO_COMPRA);

    if( !BUSD_Contract.transferFrom(msg.sender, address(this), _value) )revert();
    
    if( !TOKEN_Contract.transferFrom(address(this), msg.sender,  _token) )revert();

    if(_padre != address(0)){
        padre[msg.sender] = _padre;

        for (uint256 index = 0; index < niveles.length; index++) {
            TOKEN_Contract.transferFrom(address(this), _padre,  _token.mul(niveles[index]));
            _padre = padre[_padre];
        }
    }

    return  true;

  }

  function vender(uint _value) public returns(bool){ // BUSD => TOKEN
    require(_value >= MINIMO);

    uint _token = (_value.mul(10**18)).div(PRECIO_VENTA);

    if( !TOKEN_Contract.transferFrom(msg.sender, address(this), _token) )revert();

    if( !BUSD_Contract.transferFrom(address(this), msg.sender, _value) )revert();


    return  true;
  }

  fallback() external payable {}
  receive() external payable {}

}