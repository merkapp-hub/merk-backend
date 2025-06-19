const mongoose = require("mongoose");
const response = require("../responses");
const Favourite = require("@models/Favorite");

module.exports = {

    AddFavourite: async (req, res) => {

        try {
            const payload = req?.body || {};
            payload.user = req.user.id;
            let fav = await Favourite.findOne(req?.body)
            if (fav) {
                await Favourite.findOneAndDelete(req?.body)
                return response.success(res, { message: 'Product removed to favourite' });
            }
            let cat = new Favourite(payload);
            await cat.save();
            return response.success(res, { message: 'Product added to favourite' });
        } catch (error) {
            return response.error(res, error);
        }
    },

    getFavourite: async (req, res) => {
        try {
            let category = await Favourite.find({ user: req.user.id }).populate('product');
            return response.success(res, category);
        } catch (error) {
            return response.error(res, error);
        }
    },


    getPopularFavourite: async (req, res) => {
        try {
            let category = await Favourite.aggregate([
                {
                    $match: { popular: true }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'category',
                        as: 'products',
                        pipeline: [
                            {
                                $limit: 2
                            },
                            {
                                $project: {
                                    "varients": { $arrayElemAt: ["$varients.image", 0] },
                                }
                            },
                            {
                                $project: {
                                    "image": { $arrayElemAt: ["$varients", 0] },
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        "name": 1,
                        "image": 1,
                        "products": 1
                    }
                },
                {
                    $limit: 3
                },
            ]);
            return response.success(res, category);
        } catch (error) {
            return response.error(res, error);
        }
    },



    getFavouriteById: async (req, res) => {
        try {
            let category = await Favourite.findById(req?.params?.id);
            return response.success(res, category);
        } catch (error) {
            return response.error(res, error);
        }
    },

    updateFavourite: async (req, res) => {
        try {
            const payload = req?.body || {};
            let category = await Favourite.findByIdAndUpdate(payload?.id, payload, {
                new: true,
                upsert: true,
            });
            return response.success(res, category);
        } catch (error) {
            return response.error(res, error);
        }
    },

    deleteFavourite: async (req, res) => {
        try {
            await Favourite.findByIdAndDelete(req?.params?.id);
            return response.success(res, { meaasge: "Deleted successfully" });
        } catch (error) {
            return response.error(res, error);
        }
    },

    deleteAllFavourite: async (req, res) => {
        try {
            const newid = req.body.category.map(f => new mongoose.Types.ObjectId(f))
            await Favourite.deleteMany({ _id: { $in: newid } });
            return response.success(res, { meaasge: "Deleted successfully" });
        } catch (error) {
            return response.error(res, error);
        }
    },

};