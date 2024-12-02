const moment = require('moment-timezone');

function getShift() {
    const shiftTimes = [
        { start: '06:30', end: '11:00', shiftId: 1 },
        { start: '11:00', end: '23:30', shiftId: 2 },
        { start: '23:30', end: '06:30', shiftId: 3 }
    ];

    const currentTime = parseTime(moment().tz('Asia/Kolkata').format('HH:mm'));

    for (const shift of shiftTimes) {
        const startTime = parseTime(shift.start);
        const endTime = parseTime(shift.end);

        if (isBetween(currentTime, startTime, endTime)) {
            return shift.shiftId;
        }
    }

    return 0; // Return 0 if no shift is matched

    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function isBetween(currentTime, startTime, endTime) {
        return startTime < endTime
            ? currentTime >= startTime && currentTime < endTime
            : currentTime >= startTime || currentTime < endTime;
    }
}

module.exports = { getShift };
