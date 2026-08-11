const Buyer = require("../models/buyerModel");
 
// Permanent Address Update
const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const address = req.body;

        if (!address) {
            return res.status(400).json({
                success: false,
                message: "address is required ."
            });
        }

        const buyer = await Buyer.findOneAndUpdate(
            { userId },
            { $set: { permanentAddress:address } },
            { new: true }
        );

        if (!buyer) {
            return res.status(404).json({
                success: false,
                message: "Buyer profile not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Address update is updated.",
            data: buyer.permanentAddress,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
};

const buyer = async (req, res) => {
    try {
        const userId = req.user.id;
        const buyer = await Buyer.findOne({ userId });   // FIX: findOneById -> findOne({ userId })
        if (!buyer) {
            return res.status(400).json({
                success: false,
                message: "buyer not found ."
            });
        }
        res.status(200).json({
            success: true,
            message: "address found .",
            address: buyer.permanentAddress,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
}
module.exports = { updateAddress,buyer};
