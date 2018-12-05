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
    optionsUrl: "api/schedule/options",                 //Ничего не передаём
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
        $(".busy").addClass("free").removeClass("busy");

        console.log(data);
        $.each(data, function (key, item) {
            var time = item.time.split(":");
            var t = new Date();
            t.setHours(time[0]);
            t.setMinutes(time[1]);

            var offset = (t.getHours() * 60 + t.getMinutes() - startTime.getHours() * 60 - startTime.getMinutes()) / timeStepMinutes;


            $("#calendar").children().eq(offset).children().eq(item.boxID).removeClass("free").addClass("busy");
        });
    },
    sendRequest: function (data, url) {
        return $.ajax({
            type: "POST",
            url: url,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (errorThrown !== "" && errorThrown !== undefined) {
                console.error(errorThrown);
            }
        });
    }
};

function changeServices() {
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
    var now = new Date();
    now.setDate(1);

    var currentMonth = now.getMonth();

    now = new Date();
    var today = now.getDate();

    var daysInMonth = 28;
    while (currentMonth === now.getMonth())
        now.setDate(++daysInMonth);
    --daysInMonth;

    var html = $("#calendar").html();

    let count = 0;
    let offset = 6;

    now = new Date();

    html += `\n<tr><td class="date">${monthName[currentMonth]} ${now.getFullYear()}</td>`;
    for (i = today; i <= daysInMonth; i++) {
        now.setDate(i);
        if (i === today) {
            html += `\n<td id="${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}" class="day selected">${dayName[now.getDay()]} ${now.getDate()}</td>`;
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

    selectedDay = new Date();
    selectedDayEl = $(".selected").eq(0).attr("id");

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
                $(this).addClass("hovered");
            }
        },
        function (event) {
            if ($(this).attr("id") !== selectedDayEl) {
                $(this).removeClass("hovered");
            }
        }
    );

    $(".day").click(function (event) {
        event.stopPropagation();

        $(".day").removeClass("selected").removeClass("hovered");
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
                if ($(`#${box}${id + i * timeStepMinutes}`).attr("id") !== undefined) {
                    $(`#${box}${id + i * timeStepMinutes}`).addClass("selected");
                    if ($(`#${box}${id + i * timeStepMinutes}`).hasClass("busy")) {
                        selectionAvailable = false;
                        $(".selected").addClass("unavailable");
                    }
                }
                else {
                    selectionAvailable = false;
                    $(".selected").addClass("unavailable");
                }
            }
            if (!selectionAvailable) {
                $(".selected").addClass("unavailable");
            }
        },
        function (event) {
            event.stopPropagation();
            if (totalTime !== 0) {

                $(".selected").not(".day").removeClass("unavailable").removeClass("selected");
                selectionAvailable = true;
            }
        });
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

            var offset = parseInt(id.substr(4, id.length)) / timeStepMinutes;

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
            console.log(data);
            process.availableDay(data);
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

    if (selectedOptions.length === 0) {
        $(".day").removeClass("day-available");
        $(".busy").addClass("free").removeClass("busy");
        return;
    }

    var GetScheduleForDayRequest = {};
    GetScheduleForDayRequest.Date = selectedDay;
    GetScheduleForDayRequest.WashOptionIDs = selectedOptions;
    process.sendRequest(GetScheduleForDayRequest, urls.dayScheduleUrl).done(function (data) {
        process.daySchedule(data);
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
    CreateOrderRequest.Date = selectedDay;
    CreateOrderRequest.BoxID = boxID;
    CreateOrderRequest.Name = $("#modalName").val();
    CreateOrderRequest.Surname = $("#modalSurname").val();
    CreateOrderRequest.Phone = $("#modalTel").val();

    process.sendRequest(CreateOrderRequest, urls.createOrderUrl).done(function (data) {
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