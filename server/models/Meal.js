const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const _ = require('underscore');

let MealModel = {};

const convertId = mongoose.Types.ObjectId;

const MealSchema = new mongoose.Schema({
    food:{
        type: String,
        required: true,
        trim: true,
    },
    calories:{
        type: Number,
        min: 0,
        required: true
    },
    time:{
        type: String,
        required: true,
        trim: true
    },
    date:{
        type: Date,
        required: true,
    },
    owner:{
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account'
    },
    createdData:{
        type: Date,
        default: Date.now
    }
});

MealSchema.statics.toAPI = (doc) => ({
    food: doc.food,
    calories: doc.calories,
    time: doc.time,
    date: doc.date,
});

MealSchema.statics.findByOwner = (ownerId, callback) => {
    const search = {
        owner: convertId(ownerId)
    }

    return MealModel.find(search).select('food calories time date').exec(callback);
}

MealSchema.statics.removeById = (docId, callback) => {
    const search = {
        _id: docId
    };

    return MealModel.find(search).remove().exec(callback);
}

MealModel = mongoose.model('Meal', MealSchema);

module.exports.MealModel = MealModel;
module.exports.MealSchema = MealSchema;