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

const showHideMealForm = (element) => {
    console.log('Show hide meal form');

    let mealForm = document.getElementById('mealForm');
    console.log(mealForm.style.display);

    if(mealForm.style.display === 'none' || mealForm.style.display == ''){
        element.innerText = 'Hide Meal Form';
        mealForm.style.display = 'block';
    }else{
        element.innerText = 'Show Meal Form';
        mealForm.style.display = 'none';
    }
}

const MealForm = (props) => {
    return(
        <div id='mealFormDiv'>
            <form id='mealForm'
                    onSubmit={handleMeal}
                    name='mealForm'
                    action='/maker'
                    method='POST'
                    className='mealForm'>
                <label><strong>Add a New Meal!</strong></label>
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
                <input className='makeMealSubmit' type='submit' value='Make Meal'/>
            </form>
            <button id='showhidemealForm'>Show Meal Form</button>
        </div>
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

    const mealNodes = Object.keys(props.meals).map(dateKey => {

        let formattedDate = new Date(dateKey);
        formattedDate = `${formattedDate.getMonth()+1}/${formattedDate.getUTCDate()}/${formattedDate.getFullYear()}`

        let dateHtml = <div key={dateKey}>
            <button className='date collapsible'>{formattedDate}</button>
            {props.meals[dateKey].map((meal, index) => {
                console.log(meal);
                let srcVal = `/assets/img/${meal.time}.png`;
                return(
                    <div className='meal collapsible-content' key={meal._id}>
                        <img src={srcVal} alt ='meal image' className='mealImg'/>
                        <h3 className='time'>{meal.time}</h3>
                        <h3 className='mealName'>Food: {meal.food}</h3>
                        <h3 className='mealCalories'>Calories: {meal.calories}</h3>

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
                )
            })}
        </div>;

        return(dateHtml);

    });

    return(
        <div className='mealList'>
            {mealNodes}
        </div>
    );
};

const loadmealsFromServer = (csrf) => {
    sendAjax('GET', '/getMeals', null, (data) => {

        data.meals.sort(function(a,b){
            return new Date(a.date) - new Date(b.date);
        });

        let dataObjects = {};
        let currentDate = null;

        data.meals.forEach(element => {
            let thisDate = new Date(element.date);
            if(currentDate == null || thisDate.getTime() != currentDate.getTime()){
                currentDate = thisDate;
                dataObjects[thisDate] = [];
            }

            dataObjects[thisDate].push(element);
        });

        console.log(dataObjects);

        ReactDOM.render(
            <MealList meals={dataObjects} csrf={csrf}/>, document.querySelector('#meals')
        );

        // Since not using react class, this is the only way to get button on clicks working
        let coll = document.getElementsByClassName('collapsible');
        for(let i = 0; i < coll.length; i++){
            coll[i].onclick = function(){
                this.classList.toggle('active');
                var children = this.parentNode.childNodes;
                for(let j = 1; j < children.length; j++){
                    if(children[j].style.display === 'block'){
                        children[j].style.display = 'none';
                    }else{
                        children[j].style.display = 'block';
                    }
                }
            };
        }
    }); 
};

const setup = function(csrf){
    ReactDOM.render(
        <MealForm csrf={csrf}/>, document.querySelector('#makeMeal')
    );

    document.getElementById('showhidemealForm').onclick = function(){showHideMealForm(this);};

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