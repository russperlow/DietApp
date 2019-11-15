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
        React.createElement('input', { id: 'mealDate', type: 'date', name: 'date', min: '2019-11-01' }),
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
        React.createElement('input', { className: 'makeMealSubmit', type: 'submit', value: 'Make meal' })
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

    var mealNodes = Object.keys(props.meals).map(function (dateKey) {

        var formattedDate = new Date(dateKey);
        formattedDate = formattedDate.getMonth() + 1 + '/' + formattedDate.getUTCDate() + '/' + formattedDate.getFullYear();

        var dateHtml = React.createElement(
            'div',
            { key: dateKey },
            React.createElement(
                'button',
                { className: 'date collapsible' },
                formattedDate
            ),
            props.meals[dateKey].map(function (meal, index) {
                console.log(meal);
                var srcVal = '/assets/img/' + meal.time + '.png';
                return React.createElement(
                    'div',
                    { className: 'meal collapsible-content', key: meal._id },
                    React.createElement('img', { src: srcVal, alt: 'meal image', className: 'mealImg' }),
                    React.createElement(
                        'h3',
                        { className: 'time' },
                        meal.time
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
                        'form',
                        { id: 'deleteMeal',
                            onSubmit: handleDelete,
                            name: 'deleteMeal',
                            action: '/deleteMeal',
                            method: 'DELETE' },
                        React.createElement('input', { type: 'hidden', name: '_id', value: meal._id }),
                        React.createElement('input', { type: 'hidden', id: 'token', name: '_csrf', value: props.csrf }),
                        React.createElement('input', { className: 'makeMealDelete', type: 'submit', value: 'Delete' })
                    )
                );
            })
        );

        return dateHtml;
    });

    return React.createElement(
        'div',
        { className: 'mealList' },
        mealNodes
    );
};

var loadmealsFromServer = function loadmealsFromServer(csrf) {
    sendAjax('GET', '/getMeals', null, function (data) {

        data.meals.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });

        var dataObjects = {};
        var currentDate = null;

        data.meals.forEach(function (element) {
            var thisDate = new Date(element.date);
            if (currentDate == null || thisDate.getTime() != currentDate.getTime()) {
                currentDate = thisDate;
                dataObjects[thisDate] = [];
            }

            dataObjects[thisDate].push(element);
        });

        console.log(dataObjects);

        ReactDOM.render(React.createElement(MealList, { meals: dataObjects, csrf: csrf }), document.querySelector('#meals'));

        // Since not using react class, this is the only way to get button on clicks working
        var coll = document.getElementsByClassName('collapsible');
        for (var i = 0; i < coll.length; i++) {
            coll[i].onclick = function () {
                this.classList.toggle('active');
                var children = this.parentNode.childNodes;
                for (var j = 1; j < children.length; j++) {
                    if (children[j].style.display === 'block') {
                        children[j].style.display = 'none';
                    } else {
                        children[j].style.display = 'block';
                    }
                }
            };
        }
    });
};

var setup = function setup(csrf) {
    ReactDOM.render(React.createElement(MealForm, { csrf: csrf }), document.querySelector('#makeMeal'));

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
