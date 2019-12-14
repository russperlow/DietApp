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

    // Serialize the data ourselves because jquery is picky about how we are selecting the #deleteMeal
    let serializedData = `_id=${e.target.querySelector('input').value}&_csrf=${e.target.querySelectorAll('input')[1].value}`;

    sendAjax('DELETE', e.target.action, serializedData, function(){
        loadmealsFromServer($('token').val());
    });
}

const showHideMealForm = (element) => {

    let mealForm = document.getElementById('mealForm');

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
                <input id='mealDate' type='date' name='date'/>
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

const MealDisplay = (obj) => {
    let formattedDate = obj.date;
    let meals = obj.meals;
    
    let display = <div>
        <h1 id='selected-date'>Meals From: {formattedDate}</h1>
        {meals.map((meal, index) => {
                let srcVal = `/assets/img/${meal.time}.png`;

                return(
                    <div className='meal' key={meal._id}>
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
                                <input type='hidden' id='token' name='_csrf' value={obj.csrf}/>
                                <input className='makeMealDelete' type='submit' value='Delete'/>

                        </form>
                    </div>
                )
            })}
    </div>

    return(display);
};

const loadmealsFromServer = (csrf) => {
    sendAjax('GET', '/getMeals', null, (data) => {

        // Sort the dates from oldest to newest
        data.meals.sort(function(a,b){
            return new Date(a.date) - new Date(b.date);
        });

        let dataObjects = {};
        let currentDate = null;

        // Group the meals to their respective dates
        debugger;
        data.meals.forEach(element => {
            let thisDate = new Date(element.date);
            let formattedDate = `${thisDate.getUTCMonth()+1}/${thisDate.getUTCDate()}/${thisDate.getFullYear()}`
            
            // Since they have been sorted, we just check for a new date to move on to another day, if its the same as the current one, we add it
            if(currentDate == null || thisDate.getTime() != currentDate.getTime()){
                currentDate = thisDate;
                dataObjects[formattedDate] = [];
            }

            dataObjects[formattedDate].push(element);
        });

        let today = new Date();

        ReactDOM.render(
            <ShowCalendar month={today.getMonth()} year={today.getFullYear()} meals={dataObjects} csrf={csrf}/>, document.querySelector('#calendar')
        );
    
        let prevBtn = document.getElementById('prev-month');
        prevBtn.onclick = function(){
            previousMonth(dataObjects, csrf);
        }
    
        let nextBtn = document.getElementById('next-month');
        nextBtn.onclick = function(){
            nextMonth(dataObjects, csrf);
        }        

        // Since not using react class, this is the only way to get button on clicks working
        let coll = document.getElementsByClassName('collapsible');
        for(let i = 0; i < coll.length; i++){
            coll[i].onclick = function(){

                // Use this to close this element if it was already active, otherwise the process is undone and it stays open
                var alreadyActive = false;
                if(this.classList.contains('active'))
                    alreadyActive = true;

                // Remove the active & collapsible-active classes from the last selected item
                $('.active').removeClass('active');
                $('.collapsible-content').removeClass('collapsible-active');
                $('.columnrow-active').removeClass('columnrow-active');
                
                // This one was active so we have closed it and don't want to re-open it
                if(alreadyActive) return;

                // Toggle actie on this element
                this.classList.toggle('active');

                // Get the child and give it the collapsible active class
                var children = this.parentNode.childNodes;
                this.parentNode.classList.add('columnrow-active');

                // Must loop through all children so that all meals are made active
                for(let j = 0; j < children.length; j++){
                    children[j].classList.add('collapsible-active');
                }
            };
        }

    }); 

    try{
        document.getElementsByClassName('.highlighted')[0].click();
    }catch(e){

    }
};

const setup = function(csrf){
    let today = new Date();

    ReactDOM.render(
        <ShowCalendar month={today.getMonth()} year={today.getFullYear()} csrf={csrf}/>, document.querySelector('#calendar')
    );

    ReactDOM.render(
        <MealForm csrf={csrf}/>, document.querySelector('#makeMeal')
    );

    document.getElementById('showhidemealForm').onclick = function(){showHideMealForm(this);};

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