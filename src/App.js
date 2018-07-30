import React, { Component } from 'react'
import AdSpace from './components/AdSpace';
import AdSpaceForm from './components/AdSpaceForm';
import AdvertMarketContract from '../build/contracts/AdvertMarket.json'
import getWeb3 from './utils/getWeb3'
import IPFS from 'ipfs-mini';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      adverts: [],
      contractInstance: null,
      web3: null,
      currentAccount: "",
      ipfs: null,
    }
  }

  componentWillMount() {
    const ipfs = new IPFS({ host: '127.0.0.1', port: 5001, protocol: 'http' });
    this.setState({ ipfs: ipfs });

    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })
      this.instantiateContract()
    }).catch(console.error);
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const advertMarket = contract(AdvertMarketContract)
    advertMarket.setProvider(this.state.web3.currentProvider)

    advertMarket.deployed().then((instance) => {
      this.setState({ contractInstance: instance });
      this.startContractWatchers();
    })

    // Regularly get selected account from MetaMask
    setInterval(() => {
      this.state.web3.eth.getAccounts((error, accounts) => {
        if(accounts[0] !== this.state.currentAccount) this.setState({ currentAccount: accounts[0] });
      })
    }, 200)
  }

  displayAdvert(id) {
    this.state.contractInstance.getAdvert([id], { from: this.state.currentAccount }).then((result) => {
      // Update state with the result.
      const advert = {
        id,
        meta: result[0],
        data: result[1],
        price: this.state.web3.fromWei(result[2].toString(), 'ether'),
        priceBefore: this.state.web3.fromWei(result[3].toString(), 'ether'),
        creator: result[4],
        owner: result[5],
      }
      return this.setState({ adverts: [...this.state.adverts, advert] })
    });
  }

  startContractWatchers() {
    this.state.contractInstance.NewAdvert({}, { fromBlock: 0, toBlock: 'latest' })
      .watch((error, result) => {
        const id = result.args.id.toNumber()
        this.displayAdvert(id);
      });

    this.state.contractInstance.AdvertChangedOwner({}, { fromBlock: 0, toBlock: 'latest' })
      .watch((error, data) => console.log("Advert Owner Changed", error, data));

    this.state.contractInstance.AdvertDataChanged({}, { fromBlock: 0, toBlock: 'latest' })
      .watch((error, data) => console.log("Advert Data Changed", error, data));
  }

  render() {
    console.log(this.state)
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">Advert Test App - My Account: {this.state.currentAccount.slice(0, 8)}</a>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1"><h2>My Adverts</h2></div>
            {this.state.adverts.filter(x => x.owner === this.state.currentAccount).map(advert => <AdSpace advert={advert} {...this.state} />)}
            <div className="pure-u-1-1"><h2>Other Adverts</h2></div>
            {this.state.adverts.filter(x => x.owner !== this.state.currentAccount).map(advert => <AdSpace advert={advert} {...this.state} />)}
            <hr />
            <div className="pure-u-1-1"><AdSpaceForm {...this.state} /></div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
