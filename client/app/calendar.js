// Get the first day of the month by submitting the month and year, the day we get will be the first
const getFirstDay = (month, year) => { // Month needs to be 0 indexed
    return (new Date(year, month)).getDay();   
}

// Get the last day of the month. If we send 32nd day of Jan we get Feb 1st minus 32 minus that 31 of Jan
const getDaysInMonth = (month, year) => {
    return 32 - new Date(year, month, 32).getDate();
}

// Populate table
const populateTable = (daysInMonth, firstDay) => {
    let date = 1;
    let table = document.getElementById('calendar-body');
    table.innerHTML = "";

    for(let i = 0; i < 6; i++){
        let row = document.createElement('tr');
        let cell;

        for(let j = 0; j < 7; j++){
            if(i === 0 && j < firstDay){
                cell = document.createElement('td');
                cellText = document.createTextNode('');
                cell.appendChild(cellText);
                row.appendChild(cell);   
            }else if(data > daysInMonth){
                break;
            }else{
                cell = document.createElement('td');
                cellText = document.createTextNode(date);
                cell.appendChild(cellText);
                row.appendChild(cell);
                date++;
            }
        }

        table.appendChild(row);
    }
}

const tableObj = (daysInMonth, firstDay) => {
    let obj = [];
    let date = 1;
    for(let i = 0; i < 6; i++){
        let week = [];
        for(let j = 0; j < 7; j++) {
            let cell = {}
            if(i === 0 && j < firstDay){
                cell.date = `IF: ${i}, ${j}`;
            }else if(date > daysInMonth){
                break;
            }else{
                cell.date = `ELSE: ${i}, ${j}`;
                date++;
            }
            week.push(cell);
        }
        obj.push(week);
    }
    return obj;
}

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
]

var people = [
    { "Id": 1, "First Name": "Anthony", "Last Name": "Nelson", "Age": 25 },
    { "Id": 2, "First Name": "Helen", "Last Name": "Garcia", "Age": 32 },
    { "Id": 3, "First Name": "John", "Last Name": "Williams", "Age": 48 }
  ];

const ShowCalendar = (data) => {
    let obj = tableObj(getDaysInMonth(data.month, data.year), getFirstDay(data.month, data.year));

    let table = <div>
        <button id='prev-month'>&larr;</button>
        <h2 id='month-header'>{months[data.month]}, {data.year}</h2>
        <button id='next-month'>&rarr;</button>
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
            <tbody>
            {obj.map((week, index) => {
                return (
                <tr>
                    {week.map((day, index) => {
                        return (
                        <td>{day.date}</td>
                        )
                    })}

                </tr>
                )
                // if(index % 7 == 0){
                //     return (<tr>
                //         {meal.date}
                //     </tr>)
                // }

                // return (<td>
                //     {meal.date}
                // </td>)
            })}
            </tbody>
        </table>
    </div>

    return table;
}

const previousMonth = () => {
    let monthHeader = $('#month-header').text().split(',')
    let currentMonth = monthHeader[0];
    let currentYear = parseInt(monthHeader[1].trim());
    let newMonth = months.indexOf(currentMonth) - 1;


    if(newMonth < 0){
        newMonth = 11;
        currentYear -=1;
    }

    ReactDOM.render(
        <ShowCalendar month={newMonth} year={currentYear}/>, document.querySelector('#calendar')
    );

}

const nextMonth = () => {
    let monthHeader = $('#month-header').text().split(',')
    let currentMonth = monthHeader[0];
    let currentYear = parseInt(monthHeader[1].trim());
    let newMonth = months.indexOf(currentMonth) + 1;


    if(newMonth > 11){
        newMonth = 0;
        currentYear += 1;
    }

    ReactDOM.render(
        <ShowCalendar month={newMonth} year={currentYear}/>, document.querySelector('#calendar')
    );

}