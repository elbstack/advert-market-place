pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract AdvertMarket is Ownable{

  event NewAdvert(uint id, bytes32 meta, uint price, address sender);
  event AdvertChangedOwner(uint id, uint price, address newOwner, uint newPrice);
  event AdvertDataChanged(uint id, bytes32 data);

  uint maxPriceFactor = 2; // max factor the price can increase at owner change
  // Following values are parts of 100, e.g. 25 => 25/100 = 0.25
  uint profitFee = 25; // fee when profit is made from reselling add space
  uint regularFee = 5; // fee on initial creation and reselling
  uint creatorShare = 25; // in case of reselling the add space for profit, this is what the creator gets

  struct Advert{
    // Store big data in IPFS and store hashes as bytes32
    bytes32 meta; // data about the add space
    bytes32 data; // data the add should display
    uint price; // price for reselling in wei
    uint previousPrice; // price from previous sell
    address creator; // creator of the advert
  }

  Advert[] public adverts;

  mapping(uint => address) public advertToOwner;
  mapping(uint => address) public advertToCreator;

  modifier onlyAdCreator(uint _id) {require(msg.sender == advertToCreator[_id]); _;}
  modifier onlyAdOwner(uint _id) {require(msg.sender == advertToOwner[_id]); _;}

  function createAdvert(bytes32 _meta, uint _price) public {
    Advert memory advert = Advert(_meta, "00000000000000000000000000000000", _price, 0, msg.sender);
    uint id = adverts.push(advert) - 1;
    advertToOwner[id] = msg.sender;
    advertToCreator[id] = msg.sender;
    emit NewAdvert(id, _meta, _price, msg.sender);
  }

  function getAdvert(uint _id) public view returns(bytes32, bytes32, uint, uint, address, address){
    return (adverts[_id].meta, adverts[_id].data, adverts[_id].price, adverts[_id].previousPrice, advertToCreator[_id], advertToOwner[_id]);
  }

  function buyAdvert(uint _id, uint _newPrice, bytes32 _newData) public payable {
    Advert storage advert = adverts[_id];
    require(msg.value == advert.price); // assert that the payment is equal to the price
    require(advert.price * maxPriceFactor >= _newPrice); // assert that the new price is not higher than the limit
    emit AdvertChangedOwner(_id, advert.price, msg.sender, _newPrice);
    payShareholders(advert, _id);
    advertToOwner[_id] = msg.sender; // set owner to buyer
    advert.previousPrice = advert.price; // set previous price
    advert.price = _newPrice; // set new price
    advert.data = _newData; // set new data
    emit AdvertDataChanged(_id, _newData); // send an event that the add data has changed
  }

  // Pays owner and creator of the add, should only be used when
  // the data of the new owner is not yet assigned
  function payShareholders(Advert storage _advert, uint _id) internal {
    uint fee = _advert.price * regularFee / 100; // standard fee for all sales
    uint creatorPayment = 0; // payment to creator defaults to 0 
    int profit = int(_advert.price - _advert.previousPrice); // profit if price increased
    if(profit > 0 && advertToOwner[_id] != advertToCreator[_id]){ // if profit and owner is not creator ...
      fee = fee + (uint(profit) * profitFee / 100); // we want our share of the profit
      creatorPayment = uint(profit) * creatorShare / 100; // the creator gets it's share
    }
    uint ownerPayment = _advert.price - fee - creatorPayment; // the owner gets the rest
    advertToOwner[_id].transfer(ownerPayment);
    if(creatorPayment > 0){
      advertToCreator[_id].transfer(creatorPayment);
    }
  }

  function setAdData(uint _id, bytes32 _data) external onlyAdOwner(_id){
    adverts[_id].data = _data;
    emit AdvertDataChanged(_id, _data); 
  }

}