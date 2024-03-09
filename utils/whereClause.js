// base - Product.find()
// base - Product.find(email: {"yash@gmail.com"})

//bigQ - //search=coder&page=2&category=shortsleeves&rating[gte]=4&price[lte]=999&limit=5


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

    filter() {
        //creating a copy of bigQ, because we do not want to change the original bigQ
        //we are modifying the bigQ to add $ sign in gte,lte for regex purposes
        // const copyQ = this.bigQ
        //Spreading the copyQ
        const copyQ = { ...this.bigQ };

        //delete everything that is not to be added regex to from the req query
        delete copyQ["search"];
        delete copyQ["limit"];
        delete copyQ["page"];

        //convert bigQ into string => copyQ
        let stringOfCopyQ = JSON.stringify(copyQ);
        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt)/g, m => `$${m}`)

        const jsonOfCopyQ = JSON.parse(stringOfCopyQ)

        this.base = this.base.find(jsonOfCopyQ)
    }

    pager(resultperPage) {
        let currentPage = 1;
        if (this.bigQ.page) {
            currentPage = this.bigQ.page
        }

        const skipVal = resultperPage * (currentPage - 1)

        this.base = this.base.limit(resultperPage).skip(skipVal)
        return this;
    }
}

module.exports = WhereClause;