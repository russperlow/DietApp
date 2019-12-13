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

    var i = 0;

    const mealNodes = Object.keys(props.meals).map(dateKey => {

        let formattedDate = new Date(dateKey);
        formattedDate = `${formattedDate.getMonth()+1}/${formattedDate.getUTCDate()}/${formattedDate.getFullYear()}`

        var tableClassName = 'column';
        if(i % 7 == 0){
            tableClassName = 'row';
        }
        i++;

        let dateHtml = <div key={dateKey} className={tableClassName}>
            <button className='date collapsible'>{formattedDate}</button>
            {props.meals[dateKey].map((meal, index) => {
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

        // Sort the dates from oldest to newest
        data.meals.sort(function(a,b){
            return new Date(a.date) - new Date(b.date);
        });

        let dataObjects = {};
        let currentDate = null;

        // Group the meals to their respective dates
        data.meals.forEach(element => {
            let thisDate = new Date(element.date);

            // Since they have been sorted, we just check for a new date to move on to another day, if its the same as the current one, we add it
            if(currentDate == null || thisDate.getTime() != currentDate.getTime()){
                currentDate = thisDate;
                dataObjects[thisDate] = [];
            }

            dataObjects[thisDate].push(element);
        });

        ReactDOM.render(
            <MealList meals={dataObjects} csrf={csrf}/>, document.querySelector('#meals')
        );

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
};

const setup = function(csrf){
    ReactDOM.render(
        <ShowCalendar month={11} year={2019}/>, document.querySelector('#calendar')
    );

    let prevBtn = document.getElementById('prev-month');
    prevBtn.onclick = function(){
        previousMonth();
    }

    let nextBtn = document.getElementById('next-month');
    nextBtn.onclick = function(){
        nextMonth();
    }


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
    //showCalendar(11, 2019);
    //makeCalendar();
});