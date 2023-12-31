import {
    assert,
    hash160,
    hash256,
    method,
    prop,
    PubKey,
    PubKeyHash,
    Sig,
    SmartContract,
    Utils,
} from 'scrypt-ts'

export class EnergyTradingEscrow extends SmartContract {
    static ENERGY_SLOTS: number
    addenergy: any
    static setBuyerPubKey(arg0: string, setBuyerPubKey: any) {
        throw new Error('Method not implemented.')
    }

    @prop()
    seller: PubKeyHash

    @prop()
    buyer: PubKeyHash

    @prop(true)
    energy: bigint

    @prop()
    unitPrice: bigint
  static contractApi: any
    static ITEM_SLOTS: number

    constructor(
        seller: PubKeyHash,
        buyer: PubKeyHash,
        unitPrice: bigint
    ) {
        super(...arguments)
        this.seller = seller
        this.buyer = buyer
        this.energy = 0n
        this.unitPrice = unitPrice
    }
    
    @method()
    public buyEnergy(
       buyerPubKey: PubKey,
       buyerSig: Sig,
    ) {
        assert(hash160(buyerPubKey) == this.buyer)
        assert(this.checkSig(buyerSig, buyerPubKey))

        let outputs = Utils.buildPublicKeyHashOutput(this.seller, this.energy * this.unitPrice)
        if (this.changeAmount > 0n) {
            outputs += this.buildChangeOutput()
        }
        assert(hash256(outputs) == this.ctx.hashOutputs)
    }

    @method()
    public depositEnergy(
       sellerSig: Sig,
       sellerPubKey: PubKey,
       energy: bigint
    ) {
        assert(hash160(sellerPubKey) == this.seller)
        assert(this.checkSig(sellerSig, sellerPubKey))
        
        this.energy += energy

        let outputs = this.buildStateOutput(this.ctx.utxo.value)
        if (this.changeAmount > 0n) {
            outputs += this.buildChangeOutput()            
        }
        assert(hash256(outputs) == this.ctx.hashOutputs)
    }

    @method()
    public refund(buyerPubKey: PubKey, buyerSig: Sig, energy: bigint) {
        assert(hash160(buyerPubKey) == this.buyer)
        assert(this.checkSig(buyerSig, buyerPubKey))

        assert(this.energy >= energy, "Insufficient energy balance to refund")

        this.energy -= energy

        let outputs = Utils.buildPublicKeyHashOutput(
            this.buyer,
            energy * this.unitPrice
        )
        if (this.changeAmount > 0n) {
            outputs += this.buildChangeOutput()
        }
        assert(hash256(outputs) == this.ctx.hashOutputs)
    }

}