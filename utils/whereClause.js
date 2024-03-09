class WhereClause {
    constructor(base, bigQ) {
        this.base = base;
        this.bigQ = bigQ;
    }

    search() {
        const searchword = this.bigQ.search ? {
            name: {
                $regex: this.bigQ.search,
                $option: 'i'
            }
        } : {}

        this.base = this.base.find({ ...searchword })
        return this;
    }
}