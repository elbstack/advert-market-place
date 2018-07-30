import React, { Component } from 'react'
import * as bs58 from 'bs58';
const shorten = (hash) => '0x' + bs58.decode(hash).slice(2).toString('hex')

class BuyAdForm extends Component {
    constructor(props) {
        super(props);
        this.priceRef = null;
        this.contentRef = null;
    }

    setPriceRef = x => this.priceRef = x;
    setContentRef = x => this.contentRef = x;

    buyAdvert = advert => e => {
        e.preventDefault();
        const price = this.props.web3.toWei(this.priceRef.value, "ether");

        this.props.ipfs.addJSON({
            advertContent: {
                content: this.contentRef.value,
            }
        }, (err, hash) => {
            this.props.contractInstance.buyAdvert(advert.id,
                price, shorten(hash), { from: this.props.currentAccount, gas: 200000, value: this.props.web3.toWei(advert.price, "ether") }).then(console.log)
        })
    }

    render() {
        return <div>
            <form className="pure-form pure-form-aligned">
                <div className="pure-control-group">
                    <label htmlFor="price">New Price in ETH</label>
                    <input id="price" ref={this.setPriceRef} type="text" placeholder="Price in ETH" />
                </div>

                <div className="pure-control-group">
                    <label htmlFor="price">Advert Content</label>
                    <input id="price" ref={this.setContentRef} type="text" placeholder="Advert Content" />
                </div>

                <div className="pure-controls">
                    <button className="pure-button pure-button-primary" onClick={this.buyAdvert(this.props.advert)}>Buy</button>
                </div>
            </form>
        </div >;
    }
}

export default BuyAdForm;
