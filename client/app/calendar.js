const tableHeaders = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

const months = [
    'January',
    'Feburary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

// Get the first day of the month by submitting the month and year, the day we get will be the first
const getFirstDay = (month, year) => { // Month needs to be 0 indexed
    return (new Date(year, month)).getDay();   
}

// Get the last day of the month. If we send 32nd day of Jan we get Feb 1st minus 32 minus that 31 of Jan
const getDaysInMonth = (month, year) => {
    return 32 - new Date(year, month, 32).getDate();
}

const tableObj = (month, year, meals) => {
    let daysInMonth = getDaysInMonth(month, year)
    let firstDay = getFirstDay(month, year);
    month = month + 1;
    
    let obj = [];
    let date = 1;
    for(let i = 0; i < 6; i++){
        let week = [];
        for(let j = 0; j < 7; j++) {
            let cell = {}
            if(i === 0 && j < firstDay){
                cell.data = {date: '', meals: null};
            }else if(date > daysInMonth){
                break;
            }else{
                let formattedDate = `${month}/${date}/${year}`;
                if(meals && meals[formattedDate]){
                    cell.data = {date: date, meals: meals[formattedDate], formattedDate: formattedDate};
                }else{
                    cell.data = {date: date, meals: null};
                }
                date++;
            }
            week.push(cell);
        }
        obj.push(week);
    }
    return obj;
}

const ShowCalendar = (data) => {
    let obj = tableObj(data.month, data.year, data.meals)

    const csrf = data.csrf;
    let table = <div>
        <div id='month-div'><button id='prev-month' className='arrowBtn'>&larr;</button>
        <h2 id='month-header'>{months[data.month]}, {data.year}</h2>
        <button id='next-month' className='arrowBtn'>&rarr;</button>
        </div>
        <table>
            <thead>
                <tr>
                {tableHeaders.map((day, index) => {
                    return(
                        <th>{day}</th>
                    );
                })}
                </tr>
            </thead>
            <tbody id='table-body'>
            {obj.map((week, index) => {
                return (
                <tr>
                    {week.map((day, index) => {
                        const tdClicked = (e) => {
                            $('.highlighted').removeClass('highlighted');

                            e.target.classList.add('highlighted');
                            ReactDOM.render(
                                <MealDisplay meals={day.data.meals} date={day.data.formattedDate} csrf={csrf}/>, document.querySelector('#meals')
                            )
                        }

                        let today = new Date();

                        if(day.data && day.data.meals){
                            let className = today.getDate() == day.data.date && today.getMonth() == data.month ? 'clickable today' : 'clickable';
                            return(<td className={className} onClick={tdClicked}>{day.data.date}</td>)
                        }

                        let className = today.getDate() == day.data.date && today.getMonth() == data.month ? 'nomeals today' : 'nomeals';
                        return (
                        <td className={className}>{day.data.date}</td>
                        )
                    })}

                </tr>
                )
            })}
            </tbody>
        </table>
    </div>

    return table;
}

const previousMonth = (meals, csrf) => {
    let monthHeader = $('#month-header').text().split(',')
    let currentMonth = monthHeader[0];
    let currentYear = parseInt(monthHeader[1].trim());
    let newMonth = months.indexOf(currentMonth) - 1;

    if(newMonth < 0){
        newMonth = 11;
        currentYear -=1;
    }

    ReactDOM.render(
        <ShowCalendar month={newMonth} year={currentYear} meals={meals} csrf={csrf}/>, document.querySelector('#calendar')
    );

}

const nextMonth = (meals, csrf) => {
    let monthHeader = $('#month-header').text().split(',')
    let currentMonth = monthHeader[0];
    let currentYear = parseInt(monthHeader[1].trim());
    let newMonth = months.indexOf(currentMonth) + 1;

    if(newMonth > 11){
        newMonth = 0;
        currentYear += 1;
    }

    ReactDOM.render(
        <ShowCalendar month={newMonth} year={currentYear} meals={meals} csrf={csrf}/>, document.querySelector('#calendar')
    );

}