const BigPromise = require("../middlewares/bigPromise")

exports.home = BigPromise(async (req, res) => {
    //const db = await something()
    res.status(200).json({
        success: true,
        greeting: "Hello From API"
    })
})

exports.homeDummy = async (req, res) => {
    try {
        //const db = await something()
        res.status(200).json({
            success: true,
            greeting: "This is another dummy route"
        })
    } catch (error) {
        console.log(error);
    }

}