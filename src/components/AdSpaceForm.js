import React, { Component } from 'react'
import * as bs58 from 'bs58';
const shorten = (hash) => '0x' + bs58.decode(hash).slice(2).toString('hex')

class AdSpaceForm extends Component {
    constructor(props) {
        super(props);
        this.priceRef = null;
        this.advertLocationRef = null;
        this.advertSizeRef = null;
        this.adverDurationRef = null;
    }

    setPriceRef = x => this.priceRef = x;
    setAdvertDurationRef = x => this.adverDurationRef = x;
    setAdvertLocationRef = x => this.advertLocationRef = x;
    setAdvertSizeRef = x => this.advertSizeRef = x;

    createAdvertSlot = e => {
        e.preventDefault();
        const price = this.props.web3.toWei(this.priceRef.value, "ether");
        this.props.ipfs.addJSON({
            advertMeta: {
                location: this.advertLocationRef.value,
                size: this.advertSizeRef.value,
                duration: this.adverDurationRef.value,
            }
        }, (err, hash) => {
            this.props.contractInstance.createAdvert(shorten(hash), price, { from: this.props.currentAccount, gas: 200000 })
                .then(console.log).catch(console.error);
        })
    }

    render() {
        return <div>
            < h2 > Create Ad Space</h2 >
            <form className="pure-form pure-form-aligned">
                <div className="pure-control-group">
                    <label htmlFor="price">Price in ETH</label>
                    <input id="price" ref={this.setPriceRef} type="text" placeholder="Price in ETH" />
                </div>

                <div className="pure-control-group">
                    <label htmlFor="price">Advert Location</label>
                    <input id="price" ref={this.setAdvertLocationRef} type="text" placeholder="Advert Location" />
                </div>

                <div className="pure-control-group">
                    <label htmlFor="price">Advert Size</label>
                    <input id="price" ref={this.setAdvertSizeRef} type="text" placeholder="Advert Size" />
                </div>

                <div className="pure-control-group">
                    <label htmlFor="price">Advert Duration</label>
                    <input id="price" ref={this.setAdvertDurationRef} type="text" placeholder="Advert Duration" />
                </div>

                <div className="pure-controls">
                    <button className="pure-button pure-button-primary" onClick={this.createAdvertSlot}>Create</button>
                </div>
            </form>
        </div >;
    }
}

export default AdSpaceForm;
