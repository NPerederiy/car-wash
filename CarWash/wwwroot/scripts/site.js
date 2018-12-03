//const NO_API_WORK = true;
const NO_API_WORK = false;

const dayName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wendesday",
    "Thursday",
    "Friday",
    "Saturday"
];
const monthName = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
const urls = {
    optionsUrl: "api/schedule/optionsList",                 //Ничего не передаём
    availableDaysUrl: "api/schedule/awailable-days",    //Передаём список услуг (либо просто id, либо объект, из списка optionsList. Я ещё точно не знаю)
    dayScheduleUrl: "api/schedule/day-shedule",         //Передаём список услуг и день (та же петрушка с обёектом, и объект Date, по-идее)
    createOrderUrl: "api/schedule/create-order"         
};

var startTime = new Date();
startTime.setHours(9);
startTime.setMinutes(0);
startTime.setSeconds(0);

var endTime = new Date();
endTime.setHours(22);
endTime.setMinutes(0);
endTime.setSeconds(0);

var timeStepMinutes = 15;


var options = {};

var hoveredOption;

var selectedDay;
var selectedTime;
var selectedBox;
var selectedOptions = [];

var selectedDayEl;

var selectionAvailable = true;

var totalPrice = 0;

var totalTime = 0;

$(document).ready(function () {
    changeServices();
    changeCalendar();
});

var process = {
    optionsList: function (data) {
        const div = $("#services");

        $(div).empty();

        var inner = "";

        $.each(data, function (key, item) {
            $.each(item, function (itemKey, value) {
                options[value.optionID] = value;
                inner +=
                    `<li class="service" ` +
                    `onclick="optionToggle('#service_${value.optionID}');" ` +
                    `onmouseenter="$(this).addClass('option-hover');" ` +
                    `onmouseleave="$(this).removeClass('option-hover');" >` +
                    `<div>` +
                    `<div id="service_${value.optionID}" class="checkbox">+</div>` +
                    `<div id="descr_${value.optionID}" class="descr">${value.optionDescription}</div>` +
                    `</div>` +
                    `<div class="info">${value.price}$ ${value.time}m</div>` +
                    `</li>`;
            });
        });

        div.html(inner);
    },
    availableDay: function (data) {
        $(".day").removeClass("day-available");
        var days = $(".day");
        $.each(days, function (key, item) {
            var date = $(item).attr("id").toString().split(".").join("-");
            date += "T00:00:00";
            if (data.indexOf(date) !== -1) {
                $(item).addClass("day-available");
            }
        });
    },
    daySchedule: function (data) {
        console.log(data);
        $.each(data, function (key, item) {
            $.each(item, function (inKey, inItem) {
                var time = inItem.time.substr(11, 5).split(":");
                console.log(time);
                var t = new Date();
                t.setHours(time[0]);
                t.setMinutes(time[1]);
                console.log(t);

                var offset = (t.getHours() * 60 + t.getMinutes() - startTime.getHours() * 60 - startTime.getMinutes()) / timeStepMinutes;

                $("#calendar").children().eq(offset).children().eq(inItem.boxID + 1).removeClass("free").addClass("busy");
            });
        });
    },
    sendRequest: function (data) {
        return $.ajax({
            type: "POST",
            url: urls.createOrderUrl,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
    }
}

function changeServices() {
    if (NO_API_WORK) {
        $.getJSON("src/services.json", function (data) {
            process.optionsList(data);
            //processOptions(data);
        });
        return;
    }
    $.ajax({
        type: "GET",
        url: urls.optionsUrl,
        cache: false,
        success: function (data) {
            process.optionsList(data);
            //processOptions(data);
        }
    });
}

function changeCalendar() {
    var year = 0;
    var month;

    var now = new Date();   // Визначуваний поточну дату.
    now.setDate(1);   // Встановлюємо в змінній перше число поточного місяця.

    var dayOfWeek = now.getDay();   //Определяем день тижня.

    var currentMonth = now.getMonth();   // Дізнаємося місяць.

    now = new Date();   // Одержуємо дату.
    var today = now.getDate();   // Дізнаємося число.

    var daysInMonth = 28;   // Встановлюємо мінімально можливе число днів в місяці (менше не буває).
    while (currentMonth === now.getMonth())   // Перевіряємо в циклі, чи не змінився місяць при спробі встановити неможливе число.
        now.setDate(++daysInMonth);   // Збільшуємо число.
    --daysInMonth;//Получаем коректне число днів в місяці.

    var html = $("#calendar").html();

    let count = 0;
    let offset = 6;

    now = new Date();

    html += `\n<tr><td class="date">${monthName[currentMonth]} ${now.getFullYear()}</td>`;
    for (i = today; i <= daysInMonth; i++) {
        now.setDate(i);
        if (i === today) {
            html += `\n<td id="${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}" class="day today selected">${dayName[now.getDay()]} ${now.getDate()}</td>`;
        }
        else {
            html += `\n<td id="${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}" class="day">${dayName[now.getDay()]} ${now.getDate()}</td>`;
        }
        count++;
        if (count > offset) {
            break;
        }
    }
    for (i = 1; i < offset - (daysInMonth - today); i++) {
        now.setMonth(currentMonth + 1 > 11 ? 0 : currentMonth + 1);
        now.setDate(i);
        html += `\n<td id="${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}" class="day">${dayName[now.getDay()]} ${now.getDate()}   </td>`;
        count++;
        if (count > offset) {
            break;
        }
    }
    html += `\n</tr>`;
    $("#dateList").html(html);

    $(".today").addClass("day-selected");
    selectedDay = new Date();
    selectedDayEl = $(".today").eq(0).attr("id");

    /* Базовое время - 8:00 - 21:00
     * Интервал - 10 минут
     * 13*6 ячеек */

    html = "";
    time = startTime;
    while (time.getHours() < endTime.getHours()) {
        html += `\n<tr><td class="time">` + 
            `${time.getHours() < 10 ? "0" + time.getHours() : time.getHours()}:` +
            `${time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes()}` + 
            `</td>` +
            `<td id=box1${time.getHours() * 60 + time.getMinutes() - 9 * 60} class="dayschedule free"></td>` +
            `<td id=box2${time.getHours() * 60 + time.getMinutes() - 9 * 60} class="dayschedule free"></td>` +
            `<td id=box3${time.getHours() * 60 + time.getMinutes() - 9 * 60} class="dayschedule free"></td>` +
            `<td id=box4${time.getHours() * 60 + time.getMinutes() - 9 * 60} class="dayschedule free"></td>` +
            `</tr>`;
        time.setMinutes(time.getMinutes() + timeStepMinutes);
    }

    $("#calendar").html(html);

    $(".day").hover(
        function (event) {
            if ($(this).attr("id") !== selectedDayEl) {
                $(this).addClass("day-hover");
            }
        },
        function (event) {
            if ($(this).attr("id") !== selectedDayEl) {
                $(this).removeClass("day-hover");
            }
        }
    );

    $(".day").click(function (event) {
        event.stopPropagation();

        $(".day").removeClass("day-selected").removeClass("day-hover").removeClass("selected");
        $(this).addClass("day-selected");
        $(this).addClass("selected");
        var date = $(this).attr("id").toString().split('.');

        selectedDay = new Date();
        selectedDay.setFullYear(date[0]);
        selectedDay.setMonth(date[1] - 1);
        selectedDay.setDate(date[2]);

        selectedDayEl = $(this).attr("id");

        getDaySchedule();
    });

    $(".free").hover(
        function (event) {
            event.stopPropagation();

            var cells = 0;
            if (totalTime % timeStepMinutes !== 0) {
                cells = Math.trunc((totalTime + timeStepMinutes) / timeStepMinutes);
            }
            else {
                cells = Math.trunc(totalTime / timeStepMinutes);
            }

            var box = $(this).attr("id").substr(0, 4);
            var id = parseInt($(this).attr("id").substr(4));


            for (i = 0; i < cells; i++) {
                try {
                    $(`#${box}${id + i * 10}`).addClass("selected");
                    if ($(`#${box}${id + i * 10}`).hasClass("busy")) {
                        selectionAvailable = false;
                        $(".selected").addClass("unavailable");
                    }
                }
                catch {
                    selectionAvailable = false;
                    $(".selected").addClass("unavailable");
                }
            }
        },
        function (event) {
            event.stopPropagation();

            var cells = 0;
            if (totalTime % timeStepMinutes !== 0) {
                cells = Math.trunc((totalTime + timeStepMinutes) / timeStepMinutes);
            }
            else {
                cells = Math.trunc(totalTime / timeStepMinutes);
            }

            var box = $(this).attr("id").substr(0, 4);
            var id = parseInt($(this).attr("id").substr(4));


            for (i = 0; i < cells; i++) {
                try {
                    $(`#${box}${id + i * 10}`).removeClass("selected").removeClass(".unavailbale");
                    if ($(`#${box}${id + i * 10}`).hasClass("busy")) {
                        selectionAvailable = true;
                    }
                }
                catch {
                    selectionAvailable = true;
                }
            }
        }
    );
    $(".free").click(function (event) {
        event.stopPropagation();

        if (selectedDay === undefined) {
            selectedDay = Date.now();
        }
        else {
            selectedDay = new Date(selectedDay);
        }

        if (selectionAvailable & selectedOptions.length > 0) {
            var id = $(this).attr("id");
            selectedBox = id.substr(3, 1);

            var offset = parseInt(id.substr(4, id.length)) / 10;

            selectedTime = $("#calendar").children().eq(offset).children().eq(0).html();

            $("#modalHeader").html(`Book: ${selectedDay.getDate()}.${selectedDay.getMonth() + 1}.${selectedDay.getFullYear()}`);
            $("#modalBox").html(`Box#${selectedBox}`);
            $("#modalTime").html(`Time: ${selectedTime}`);

            $(".registration").css({ visibility: "visible" });
        }
    });
    getDaySchedule();
}

function getAvailableDay(sender, event) {
    if (selectedOptions.length === 0) {
        $(".day").removeClass("day-available");
        return;
    }

    if (NO_API_WORK) {
        $.getJSON("src/dates.json", function (data) {
            process.availableDay(data);
            //processAvailbaleDays(data);
        });
        return;
    }
    var request = "?";

    for (i = 0; i <= selectedOptions.length; i++) {
        if (options[selectedOptions[i]] !== undefined) {
            request += `id=${selectedOptions[i]}&`;
        }
    }
    request = request.substr(0, request.length - 1);

    $.ajax({
        type: "GET",
        url: urls.availableDaysUrl + request,
        cache: false,
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Something went wrong!");
        },
        success: function (data) {
            process.availableDay(data);
            //processAvailbaleDays(data);
        }
    });
}

function getDaySchedule(sender, event) {
    if (selectedDay === undefined) {
        selectedDay = Date.now();
    }
    else {
        selectedDay = new Date(selectedDay);
    }

    if (NO_API_WORK) {
        $.getJSON("src/daySchedule.json", function (data) {
            process.daySchedule(data);
            //processDaySchedule(data);
        });
        return;
    }

    var request = "?";
    for (i = 0; i <= selectedOptions.length; i++) {
        if (options[selectedOptions[i]] !== undefined) {
            request += `id=${selectedOptions[i]}&`;
        }
    }

    if (selectedOptions.length === 0) {
        $(".day").removeClass("day-available");
        return;
    }

    request += `date=${selectedDay.getFullYear()}.${selectedDay.getMonth().toString().length < 2 ? "0" + selectedDay.getMonth().toString() : selectedDay.getMonth().toString()}.${selectedDay.getDate().toString().length < 2 ? "0" + selectedDay.getDate().toString() : selectedDay.getDate().toString()}`;
    //sendRequest = sendRequest.substr(0, sendRequest.length - 1);
    $.ajax({
        type: "GET",
        url: urls.dayScheduleUrl + request,
        cache: false,
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Something went wrong!");
        },
        success: function (data) {
            process.daySchedule(data);
            //processDaySchedule(data);
        }
    });
}

function createOrder() {
    var boxID = $("#modalBox").html().substr(4);
    var time = $("#modalTime").html().substr(6);

    var hours = time.split(":")[0];
    var minutes = time.split(":")[1];

    selectedDay.setHours(hours);
    selectedDay.setMinutes(minutes);

    var CreateOrderRequest = {};
    CreateOrderRequest.WashOptionIDs = selectedOptions;
    CreateOrderRequest.Date = selectedDay; //selectedDate;
    CreateOrderRequest.BoxID = boxID;
    CreateOrderRequest.Name = $("#modalName").val();
    CreateOrderRequest.Surname = $("#modalSurname").val();
    CreateOrderRequest.Phone = $("#modalTel").val();

    //sendRequest(CreateOrderRequest).done(function (data) {
    process.sendRequest(CreateOrderRequest).done(function (data) {
        console.log(data);
    });
}

function optionToggle(sender) {
    var total = $("#total");
    var id = $(sender).attr("id").substring(8);

    var checked = $(sender).text() === "+" ? true : false;

    if (checked) {       
        $(sender).html("&ndash;");
        selectedOptions.push(id);

        totalPrice += options[id].price;
        totalTime += options[id].time;

        $(sender).addClass("checked");
    }
    else {
        selectedOptions.splice(selectedOptions.indexOf(id), 1);
        $(sender).html("+");
        totalPrice -= options[id].price;
        totalTime -= options[id].time;

        $(sender).removeClass("checked");
    }

    total.html(`Total: ${totalPrice.toFixed(1)}$ - ${totalTime.toFixed(1)} min`);
    getAvailableDay();
    getDaySchedule();
}