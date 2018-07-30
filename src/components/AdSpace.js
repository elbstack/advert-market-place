import React, { Component } from 'react'
import BuyAdForm from "./BuyAdForm";
import * as bs58 from 'bs58';
const lengthen = (short) => bs58.encode(Buffer.from('1220' + short.slice(2), 'hex'))



class AdSpace extends Component {
    constructor(props) {
        super(props);
        this.state = {
            advertMeta: null,
            advertContent: null,
            buyClicked: false,
        }
    }
    componentWillMount() {
        this.props.ipfs.cat(lengthen(this.props.advert.meta), (err, result) => {
            if (result) {
                result = JSON.parse(result);
                if (result.advertMeta) {
                    this.setState({ advertMeta: result.advertMeta })
                }
            }
        })

        this.props.ipfs.cat(lengthen(this.props.advert.data), (err, result) => {
            if (result) {
                result = JSON.parse(result);
                if (result.advertContent) {
                    this.setState({ advertContent: result.advertContent })
                }
            }
        })
    }

    setClicked = e => {
        this.setState({ buyClicked: true });
    }

    render() {
        const BuyButton = props => {
            const advert = props.advert;
            if (advert.owner !== props.currentAccount) {
                if (props.buyClicked) {
                    return <BuyAdForm advert={advert} ipfs={props.ipfs} contractInstance={props.contractInstance} web3={props.web3} currentAccount={props.currentAccount} />
                }
                else {
                    return <button className="pure-button" onClick={props.setClicked}> Buy for {advert.price} ETH </button >;
                }
            }
            else return <button className="pure-button" disabled>This is your ad</button >;
        }
        const AdvertContent = props => {
            if (!this.state.advertContent) return <div></div>
            return <div>
                <p className='content'>Content: {this.state.advertContent.content}</p>
            </div>
        }

        const AdvertMeta = props => {
            if (!this.state.advertMeta) return <div></div>
            return <div>
                <p className='location'>Location: {this.state.advertMeta.location}</p>
                <p className='size'>size: {this.state.advertMeta.size}</p>
                <p className='duration'>duration: {this.state.advertMeta.duration}</p>
            </div>
        }

        const advert = this.props.advert;
        return <div className='advert pure-u-1-4 pure-u-md-1-3'>
            <h3 className='id'>Add #{advert.id}</h3>
            <hr />
            <p className='creator'>Creator: {advert.creator.slice(0, 8)}</p>
            <p className='owner'>Owner: {advert.owner.slice(0, 8)}</p>
            <p className='price'>Price: {advert.price}ETH</p>
            <hr />
            <h3>Advert Meta Data</h3>
            <AdvertMeta />
            <h3>Advert Content</h3>
            <AdvertContent />
            <hr />
            <BuyButton advert={advert} buyClicked={this.state.buyClicked} setClicked={this.setClicked} {...this.props} />
        </div>
    }
}

export default AdSpace;
