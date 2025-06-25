export const customizeCalendarStyle = (calendar: any) => {
    if (calendar) {
        const cal = calendar.current;
        if(cal ) {
            const shadow: any = cal.shadowRoot;
            const style = document.createElement('style')

            style.type = 'text/css';
            style.textContent = '.calendar-day:not(.calendar-day-today):not(.calendar-day-active){ color: #000000!important } ion-picker-internal{ color: #292929c7 }' +
            ' .datetime-calendar .calendar-header .calendar-action-buttons .calendar-month-year ion-icon{display: none!important;}' +
            '.datetime-calendar .calendar-header .calendar-action-buttons .calendar-month-year{pointer-events: none;}';

            shadow.appendChild(style);
        }
    }
}
