//handling the date, if empty use todays date
function parseDate(date) {
    if (date === '') {
        return new Date().toString();
    }
    return date.toString();
}
//reload after 1.5 seconds
function reloadSoon() {
    setTimeout(() => {
        window.location.reload();
      }, 1500);
}