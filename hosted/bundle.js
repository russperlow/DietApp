'use strict';

var tableHeaders = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Get the first day of the month by submitting the month and year, the day we get will be the first
var getFirstDay = function getFirstDay(month, year) {
    // Month needs to be 0 indexed
    return new Date(year, month).getDay();
};

// Get the last day of the month. If we send 32nd day of Jan we get Feb 1st minus 32 minus that 31 of Jan
var getDaysInMonth = function getDaysInMonth(month, year) {
    return 32 - new Date(year, month, 32).getDate();
};

var tableObj = function tableObj(month, year, meals) {
    var daysInMonth = getDaysInMonth(month, year);
    var firstDay = getFirstDay(month, year);
    month = month + 1;

    var obj = [];
    var date = 1;
    for (var i = 0; i < 6; i++) {
        var week = [];
        for (var j = 0; j < 7; j++) {
            var cell = {};
            if (i === 0 && j < firstDay) {
                cell.data = { date: '', meals: null };
            } else if (date > daysInMonth) {
                break;
            } else {
                var formattedDate = month + '/' + date + '/' + year;
                if (meals && meals[formattedDate]) {
                    cell.data = { date: date, meals: meals[formattedDate], formattedDate: formattedDate };
                } else {
                    cell.data = { date: date, meals: null };
                }
                date++;
            }
            week.push(cell);
        }
        obj.push(week);
    }
    return obj;
};

var ShowCalendar = function ShowCalendar(data) {
    var obj = tableObj(data.month, data.year, data.meals);
    var csrf = data.csrf;
    var table = React.createElement(
        'div',
        null,
        React.createElement(
            'div',
            { id: 'month-div' },
            React.createElement(
                'button',
                { id: 'prev-month', className: 'arrowBtn' },
                '\u2190'
            ),
            React.createElement(
                'h2',
                { id: 'month-header' },
                months[data.month],
                ', ',
                data.year
            ),
            React.createElement(
                'button',
                { id: 'next-month', className: 'arrowBtn' },
                '\u2192'
            )
        ),
        React.createElement(
            'table',
            null,
            React.createElement(
                'thead',
                null,
                React.createElement(
                    'tr',
                    null,
                    tableHeaders.map(function (day, index) {
                        return React.createElement(
                            'th',
                            null,
                            day
                        );
                    })
                )
            ),
            React.createElement(
                'tbody',
                null,
                obj.map(function (week, index) {
                    return React.createElement(
                        'tr',
                        null,
                        week.map(function (day, index) {
                            var tdClicked = function tdClicked(e) {
                                $('.highlighted').removeClass('highlighted');

                                e.target.classList.add('highlighted');
                                debugger;
                                ReactDOM.render(React.createElement(MealDisplay, { meals: day.data.meals, date: day.data.formattedDate, csrf: csrf }), document.querySelector('#meals'));
                                console.log(e);
                            };
                            if (day.data && day.data.meals) {
                                return React.createElement(
                                    'td',
                                    { className: 'clickable', onClick: tdClicked },
                                    'Length: ',
                                    day.data.meals.length
                                );
                            }

                            return React.createElement(
                                'td',
                                { className: 'nomeals' },
                                day.data.date
                            );
                        })
                    );
                })
            )
        )
    );

    return table;
};

var previousMonth = function previousMonth(meals) {
    var monthHeader = $('#month-header').text().split(',');
    var currentMonth = monthHeader[0];
    var currentYear = parseInt(monthHeader[1].trim());
    var newMonth = months.indexOf(currentMonth) - 1;

    if (newMonth < 0) {
        newMonth = 11;
        currentYear -= 1;
    }

    ReactDOM.render(React.createElement(ShowCalendar, { month: newMonth, year: currentYear, meals: meals }), document.querySelector('#calendar'));
};

var nextMonth = function nextMonth(meals) {
    debugger;
    var monthHeader = $('#month-header').text().split(',');
    var currentMonth = monthHeader[0];
    var currentYear = parseInt(monthHeader[1].trim());
    var newMonth = months.indexOf(currentMonth) + 1;

    if (newMonth > 11) {
        newMonth = 0;
        currentYear += 1;
    }

    ReactDOM.render(React.createElement(ShowCalendar, { month: newMonth, year: currentYear, meals: meals }), document.querySelector('#calendar'));
};
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
    debugger;

    $('mealMessage').animate({ width: 'hide' }, 350);

    // Serialize the data ourselves because jquery is picky about how we are selecting the #deleteMeal
    var serializedData = '_id=' + e.target.querySelector('input').value + '&_csrf=' + e.target.querySelectorAll('input')[1].value;

    sendAjax('DELETE', e.target.action, serializedData, function () {
        loadmealsFromServer($('token').val());
    });
};

var showHideMealForm = function showHideMealForm(element) {

    var mealForm = document.getElementById('mealForm');

    if (mealForm.style.display === 'none' || mealForm.style.display == '') {
        element.innerText = 'Hide Meal Form';
        mealForm.style.display = 'block';
    } else {
        element.innerText = 'Show Meal Form';
        mealForm.style.display = 'none';
    }
};

var MealForm = function MealForm(props) {
    return React.createElement(
        'div',
        { id: 'mealFormDiv' },
        React.createElement(
            'form',
            { id: 'mealForm',
                onSubmit: handleMeal,
                name: 'mealForm',
                action: '/maker',
                method: 'POST',
                className: 'mealForm' },
            React.createElement(
                'label',
                null,
                React.createElement(
                    'strong',
                    null,
                    'Add a New Meal!'
                )
            ),
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
            React.createElement('input', { className: 'makeMealSubmit', type: 'submit', value: 'Make Meal' })
        ),
        React.createElement(
            'button',
            { id: 'showhidemealForm' },
            'Show Meal Form'
        )
    );
};

var MealDisplay = function MealDisplay(obj) {
    var formattedDate = obj.formattedDate;
    var meals = obj.meals;
    var display = React.createElement(
        'div',
        null,
        React.createElement(
            'h3',
            null,
            formattedDate
        ),
        meals.map(function (meal, index) {
            var srcVal = '/assets/img/' + meal.time + '.png';
            debugger;
            return React.createElement(
                'div',
                { className: 'meal', key: meal._id },
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
                    React.createElement('input', { type: 'hidden', id: 'token', name: '_csrf', value: obj.csrf }),
                    React.createElement('input', { className: 'makeMealDelete', type: 'submit', value: 'Delete' })
                )
            );
        })
    );

    return display;
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

    var i = 0;

    var mealNodes = Object.keys(props.meals).map(function (dateKey) {

        var formattedDate = new Date(dateKey);
        formattedDate = formattedDate.getMonth() + 1 + '/' + formattedDate.getUTCDate() + '/' + formattedDate.getFullYear();

        var tableClassName = 'column';
        if (i % 7 == 0) {
            tableClassName = 'row';
        }
        i++;

        var dateHtml = React.createElement(
            'div',
            { key: dateKey, className: tableClassName },
            React.createElement(
                'button',
                { className: 'date collapsible' },
                formattedDate
            ),
            props.meals[dateKey].map(function (meal, index) {
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

        // Sort the dates from oldest to newest
        data.meals.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });

        var dataObjects = {};
        var currentDate = null;

        // Group the meals to their respective dates
        data.meals.forEach(function (element) {
            var thisDate = new Date(element.date);
            var formattedDate = thisDate.getMonth() + 1 + '/' + thisDate.getUTCDate() + '/' + thisDate.getFullYear();

            // Since they have been sorted, we just check for a new date to move on to another day, if its the same as the current one, we add it
            if (currentDate == null || thisDate.getTime() != currentDate.getTime()) {
                currentDate = thisDate;
                dataObjects[formattedDate] = [];
            }

            dataObjects[formattedDate].push(element);
        });

        // ReactDOM.render(
        //     <MealList meals={dataObjects} csrf={csrf}/>, document.querySelector('#meals')
        // );

        ReactDOM.render(React.createElement(ShowCalendar, { month: 10, year: 2019, meals: dataObjects, csrf: csrf }), document.querySelector('#calendar'));

        var prevBtn = document.getElementById('prev-month');
        prevBtn.onclick = function () {
            previousMonth(dataObjects);
        };

        var nextBtn = document.getElementById('next-month');
        nextBtn.onclick = function () {
            nextMonth(dataObjects);
        };

        // Since not using react class, this is the only way to get button on clicks working
        var coll = document.getElementsByClassName('collapsible');
        for (var i = 0; i < coll.length; i++) {
            coll[i].onclick = function () {

                // Use this to close this element if it was already active, otherwise the process is undone and it stays open
                var alreadyActive = false;
                if (this.classList.contains('active')) alreadyActive = true;

                // Remove the active & collapsible-active classes from the last selected item
                $('.active').removeClass('active');
                $('.collapsible-content').removeClass('collapsible-active');
                $('.columnrow-active').removeClass('columnrow-active');

                // This one was active so we have closed it and don't want to re-open it
                if (alreadyActive) return;

                // Toggle actie on this element
                this.classList.toggle('active');

                // Get the child and give it the collapsible active class
                var children = this.parentNode.childNodes;
                this.parentNode.classList.add('columnrow-active');

                // Must loop through all children so that all meals are made active
                for (var j = 0; j < children.length; j++) {
                    children[j].classList.add('collapsible-active');
                }
            };
        }
    });
};

var setup = function setup(csrf) {
    ReactDOM.render(React.createElement(ShowCalendar, { month: 11, year: 2019, csrf: csrf }), document.querySelector('#calendar'));

    ReactDOM.render(React.createElement(MealForm, { csrf: csrf }), document.querySelector('#makeMeal'));

    document.getElementById('showhidemealForm').onclick = function () {
        showHideMealForm(this);
    };

    // ReactDOM.render(
    //     <MealList meals={[]} csrf={csrf}/>, document.querySelector('#meals')
    // );

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
