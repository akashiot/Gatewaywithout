function criticalCycletime(Val, stn) {
    var m_code = stn_setting.machine_code[stn];
    var shiftId = "S" + Val?.shift;
    var hours = moment().format('HH');
    var ampm = (hours >= 12) ? "PM" : "AM";

    // Date adjustment based on shift timing
    if ((shiftId === "S1" || shiftId === "S2") || (shiftId === "S3" && ampm === "PM")) {
        date = moment().format('YYYY-MM-DD');
    } else if (shiftId === "S3" && ampm === "AM") {
        date = moment().subtract(1, 'days').format('YYYY-MM-DD');
    }

    var timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    var totalParts = Val?.Total_parts;
    var totaloperationbit = Val?.operation_time;
    var operations1;
    var operations = "Stn" + m_code;

    // Handles index tag updates
    var tempOperationindexTag = store.get("operationindexTags" + stn) || [false, false, false];
    var indexTags = [];
    for (var i = 1; i <= totalIndex; i++) {
        indexTags.push(Val["element_" + i]);
    }

    // Determine operations based on index tag changes
    indexTags.forEach((data, index) => {
        if (data == true) {
            operations1 = "Stn" + m_code + "_Index_" + (index + 1);
        }
    });

    var tempoperationbit = store.get('total-operationbit' + stn);
    if ((tempOperationindexTag.map((state, idx) => state != indexTags[idx] && indexTags[idx]).indexOf(true) == -1) && (totaloperationbit !== tempoperationbit && totaloperationbit == true)) {
        operations = "Stn" + m_code;
    } else if ((tempOperationindexTag.map((state, idx) => state != indexTags[idx] && indexTags[idx]).indexOf(true) !== -1)) {
        operations = "Stn" + m_code;
    }
    
    // Log the data using Crictrl
    Crictrl.dataInserting(
        date,
        m_code,
        Val?.variantNumber,
        operations,
        Val?.actualCycletime,
        Val?.actualCycletime,
        Val?.OK_parts,
        Val?.NOT_parts,
        totalParts,
        Val?.shift,
        timeStamp
    );

    // Store current operation states for next cycle
    store.set("operationTags" + stn, operations1);
    store.set("operationindexTags" + stn, indexTags);
    store.set("total-operationbit" + stn, totaloperationbit);
}
