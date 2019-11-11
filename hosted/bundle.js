'use strict';

var handleMeal = function handleMeal(e) {
    e.preventDefault();

    $('#mealMessage').animate({ width: 'hide' }, 350);

    if ($('#mealName').val() == '' || $('#time').val() == '' || $('#mealCalories').val() == '' || $('#date').val() == '') {
        handleError('Grumble! Grumble! All fields are required');
        return false;
    }

    sendAjax('POST', $('#mealForm').attr('action'), $('#mealForm').serialize(), function () {
        loadmealsFromServer($('#token').val());
    });
    return false;
};

var handleDelete = function handleDelete(e) {
    e.preventDefault();

    $('mealMessage').animate({ width: 'hide' }, 350);

    sendAjax('DELETE', $('#deleteMeal').attr('action'), $('#deleteMeal').serialize(), function () {
        loadmealsFromServer($('token').val());
    });
};

var MealForm = function MealForm(props) {
    return React.createElement(
        'form',
        { id: 'mealForm',
            onSubmit: handleMeal,
            name: 'mealForm',
            action: '/maker',
            method: 'POST',
            className: 'mealForm' },
        React.createElement(
            'label',
            { htmlFor: 'food' },
            'Food:'
        ),
        React.createElement('input', { id: 'mealName', type: 'text', name: 'food', placeholder: 'Pasta' }),
        React.createElement(
            'label',
            { htmlFor: 'calories' },
            'Calories:'
        ),
        React.createElement('input', { id: 'mealCalories', type: 'text', name: 'calories', placeholder: '100' }),
        React.createElement(
            'label',
            { htmlFor: 'date' },
            'Date:'
        ),
        React.createElement('input', { id: 'mealDate', type: 'date', name: 'date', value: '2019-11-11', min: '2019-11-01' }),
        React.createElement(
            'label',
            { htmlFor: 'time' },
            'Meal Time:'
        ),
        React.createElement(
            'select',
            { name: 'time', id: 'time' },
            React.createElement(
                'option',
                { value: 'breakfast' },
                'Breakfast'
            ),
            React.createElement(
                'option',
                { value: 'lunch' },
                'Lunch'
            ),
            React.createElement(
                'option',
                { value: 'dinner' },
                'Dinner'
            ),
            React.createElement(
                'option',
                { value: 'snack', selected: true },
                'Snack'
            )
        ),
        React.createElement('input', { type: 'hidden', id: 'token', name: '_csrf', value: props.csrf }),
        React.createElement('input', { className: 'makemealSubmit', type: 'submit', value: 'Make meal' })
    );
};

var MealList = function MealList(props) {
    if (props.meals.length === 0) {
        return React.createElement(
            'div',
            { className: 'mealList' },
            React.createElement(
                'h3',
                { className: 'emptymeal' },
                'No meals yet'
            )
        );
    }

    var mealNodes = props.meals.map(function (meal) {
        console.log(meal);
        var formattedDate = meal.date.split('T')[0];
        var srcVal = '/assets/img/' + meal.time + '.png';
        return React.createElement(
            'div',
            { key: meal._id, className: 'meal' },
            React.createElement('img', { src: srcVal, alt: 'meal face', className: 'mealFace' }),
            React.createElement(
                'h3',
                { className: 'date' },
                'Date: ',
                formattedDate,
                ' '
            ),
            React.createElement(
                'h3',
                { className: 'mealName' },
                'Food: ',
                meal.food
            ),
            React.createElement(
                'h3',
                { className: 'mealCalories' },
                'Calories: ',
                meal.calories
            ),
            React.createElement(
                'h3',
                { className: 'time' },
                'Meal Time: ',
                meal.time
            ),
            React.createElement(
                'form',
                { id: 'deletemeal',
                    onSubmit: handleDelete,
                    name: 'deletemeal',
                    action: '/deletemeal',
                    method: 'DELETE' },
                React.createElement('input', { type: 'hidden', name: '_id', value: meal._id }),
                React.createElement('input', { type: 'hidden', id: 'token', name: '_csrf', value: props.csrf }),
                React.createElement('input', { className: 'makemealDelete', type: 'submit', value: 'Delete' })
            )
        );
    });

    return React.createElement(
        'div',
        { className: 'mealList' },
        mealNodes
    );
};

var loadmealsFromServer = function loadmealsFromServer(csrf) {
    sendAjax('GET', '/getmeals', null, function (data) {
        ReactDOM.render(React.createElement(MealList, { meals: data.meals, csrf: csrf }), document.querySelector('#meals'));
    });
};

var setup = function setup(csrf) {
    ReactDOM.render(React.createElement(MealForm, { csrf: csrf }), document.querySelector('#makemeal'));

    ReactDOM.render(React.createElement(MealList, { meals: [], csrf: csrf }), document.querySelector('#meals'));

    loadmealsFromServer(csrf);
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
'use strict';

var handleError = function handleError(message) {
    $('#errorMessage').text(message);
    $('#mealMessage').animate({ width: 'toggle' }, 350);
};

var redirect = function redirect(response) {
    $('#mealMessage').animate({ width: 'hide' }, 350);
    window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: 'json',
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};
