const handleMeal = (e) => {
    e.preventDefault();

    $('#mealMessage').animate({width: 'hide'}, 350);

    if($('#mealName').val() == '' || $('#time').val() == '' || $('#mealCalories').val() == '' || $('#date').val() == ''){
        handleError('Grumble! Grumble! All fields are required');
        return false;
    }

    sendAjax('POST', $('#mealForm').attr('action'), $('#mealForm').serialize(), function(){
        loadmealsFromServer($('#token').val());
    });
    return false;
};

const handleDelete = (e) => {
    e.preventDefault();

    $('mealMessage').animate({width: 'hide'}, 350);

    sendAjax('DELETE', $('#deleteMeal').attr('action'), $('#deleteMeal').serialize(), function(){
        loadmealsFromServer($('token').val());
    });
}

const MealForm = (props) => {
    return(
        <form id='mealForm'
                onSubmit={handleMeal}
                name='mealForm'
                action='/maker'
                method='POST'
                className='mealForm'>

            <label htmlFor='food'>Food:</label>
            <input id='mealName' type='text' name='food' placeholder='Pasta'/>
            <label htmlFor='calories'>Calories:</label>
            <input id='mealCalories' type='text' name='calories' placeholder='100'/>
            <label htmlFor='date'>Date:</label>
            <input id='mealDate' type='date' name='date' min='2019-11-01'/>
            <label htmlFor='time'>Meal Time:</label>
            <select name='time' id='time'>
                <option value='breakfast'>Breakfast</option>
                <option value='lunch'>Lunch</option>
                <option value='dinner'>Dinner</option>
                <option value='snack' selected>Snack</option>
            </select> 
            <input type='hidden' id='token' name='_csrf' value={props.csrf}/>
            <input className='makeMealSubmit' type='submit' value='Make meal'/>
        </form>
    );
};

const MealList = function(props){
    if(props.meals.length === 0){
        return(
            <div className='mealList'>
                <h3 className='emptymeal'>No meals yet</h3>
            </div>
        );
    }


    const mealNodes = props.meals.map(function(meal){
        console.log(meal);
        let formattedDate = meal.date.split('T')[0];
        let srcVal = `/assets/img/${meal.time}.png`;
        return(
            <div key={meal._id} className='meal'>
                <img src={srcVal} alt='meal image' className='mealImg'/>
                <h3 className='date'>Date: {formattedDate} </h3>
                <h3 className='mealName'>Food: {meal.food}</h3>
                <h3 className='mealCalories'>Calories: {meal.calories}</h3>
                <h3 className='time'>Meal Time: {meal.time}</h3>

                <form id='deleteMeal'
                        onSubmit={handleDelete}
                        name='deleteMeal'
                        action='/deleteMeal'
                        method='DELETE'>

                            <input type='hidden' name='_id' value={meal._id}/>
                            <input type='hidden' id='token' name='_csrf' value={props.csrf}/>
                            <input className='makeMealDelete' type='submit' value='Delete'/>

                </form>
            </div>
        );
    });

    return(
        <div className='mealList'>
            {mealNodes}
        </div>
    );
};

const loadmealsFromServer = (csrf) => {
    sendAjax('GET', '/getMeals', null, (data) => {
        ReactDOM.render(
            <MealList meals={data.meals} csrf={csrf}/>, document.querySelector('#meals')
        );
    }); 
};

const setup = function(csrf){
    ReactDOM.render(
        <MealForm csrf={csrf}/>, document.querySelector('#makeMeal')
    );

    ReactDOM.render(
        <MealList meals={[]} csrf={csrf}/>, document.querySelector('#meals')
    );

    loadmealsFromServer(csrf);
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
}

$(document).ready(function(){
    getToken();
});