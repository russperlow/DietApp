const models = require('../models');
const Meal = models.Meal;

const makeMeal = (req, res) => {

    if (!req.body.food || !req.body.calories || !req.body.time || !req.body.date) {
      return res.status(400).json({ error: 'All foods are required' });
    }
    
    const mealData = {
      food: req.body.food,
      calories: req.body.calories,
      time: req.body.time,
      date: req.body.date,
      owner: req.session.account._id,
    };
  
    const newMeal = new Meal.MealModel(mealData);
  
    const mealPromise = newMeal.save();
  
    mealPromise.then(() => res.json({ redirect: '/maker' }));
  
    mealPromise.catch((err) => {
      console.log(err);
      if (err.code === 11000) {
        return res.status(400).json({ error: 'meal already exists' });
      }
  
      return res.status(400).json({ error: `An error occured ${err}` });
    });
  
    return mealPromise;
};

const deleteMeal = (req, res) => {

    console.log(`request body: ${req.body}`);

    return Meal.MealModel.removeById(req.body._id, (err) => {
      if(err){
        console.log(`Error: ${err}`)
        return res.status(400).json({err: 'An error occured'});
      }
      return res.status(204).json();
    });
}


const makerPage = (req, res) => {
    Meal.MealModel.findByOwner(req.session.account._id, (err, docs) => {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: 'An error occured' });
        }

        return res.render('app', {csrfToken: req.csrfToken(), meals: docs });
    });
};

const getMeals = (request, response) => {
  const req = request;
  const res = response;

  return Meal.MealModel.findByOwner(req.session.account._id, (err, docs) => {
    if(err){
      console.log(err);
      return res.status(400).json({error: 'An error occurred'});
    }

    return res.json({meals: docs});
  });
};

module.exports.makerPage = makerPage;
module.exports.getMeals = getMeals;
module.exports.make = makeMeal;
module.exports.deleteMeal = deleteMeal;
