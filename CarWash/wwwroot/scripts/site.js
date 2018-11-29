﻿const NO_API_WORK = true;
//const NO_API_WORK = false;

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
const colors = {
    optionHoverIn: "rgba(0,0,0,0.5)",
    optionHoverOut: "transparent",

    daySelected: "rgb(0,206,209)",
    dayDeselected: "transparent",

    daySelectedText: "#ffffff",
    dayDeselectedText: "rgb(105, 171, 255)",

    dayHoverIn: "rgba(0,206,209,0.35)",
    dayHoverOut: "TRANSPARENT",

    today: "rgb(195, 195, 205)",

    availableDay: "green"
};
const urls = {
    optionsUrl: "api/schedule/options",                 //Ничего не передаём
    availableDaysUrl: "api/schedule/awailable-days",    //Передаём список услуг (либо просто id, либо объект, из списка options. Я ещё точно не знаю)
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

var timeStepMinutes = 10;


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
    actions.getOptions();
   // changeServices();
    changeCalendar();
});

$(".schedule").click(function (event) {
    $(".day").css({ backgroundColor: colors.dayDeselected, color: colors.dayDeselectedText });
    $(".today").css({ color: colors.today });
    selectedDay = undefined;
    selectedDayEl = undefined;
});


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
            html += `\n<td id="${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}" class="day today">${dayName[now.getDay()]} ${now.getDate()}</td>`;
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
        console.log("next month");
        now.setMonth(currentMonth + 1 > 11 ? 0 : currentMonth + 1);
        now.setDate(i);
        html += `\n<td id="${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}" class="day">${dayName[now.getDay()]} ${now.getDate()}   </td>`;
        console.log(html);
        count++;
        if (count > offset) {
            break;
        }
    }
    html += `\n</tr>`;
    $("#dateList").html(html);

    /* Базовое время - 8:00 - 21:00
     * Интервал - 10 минут
     * 13*6 ячеек */

    html = "";
    time = startTime;
    while (time.getHours() < endTime.getHours()) {
        html += `\n<tr><td>` + 
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
                $(this).css({ backgroundColor: colors.dayHoverIn });
            }
        },
        function (event) {
            if ($(this).attr("id") !== selectedDayEl) {
                $(this).css({ backgroundColor: colors.dayHoverOut });
            }
        }
    );

    $(".day").click(function (event) {
        event.stopPropagation();

        $(".day").css({ backgroundColor: colors.dayDeselected, colors: colors.dayDeselectedText });
        $(".day").removeClass("selected");
        $(this).css({ backgroundColor: colors.daySelected, color: colors.daySelectedText });
        $(this).addClass("selected");
        var date = $(this).attr("id").toString().split('.');

        selectedDay = new Date();
        selectedDay.setFullYear(date[0]);
        selectedDay.setMonth(date[1] - 1);
        selectedDay.setDate(date[2]);

        selectedDayEl = $(this).attr("id");

        console.log(selectedDay);
        getDaySchedule();
    });
}

function getAvailableDay(sender, event) {
    if (selectedOptions.length === 0) {
        $(".day").css({ borderWidth: "0px" });
        return;
    }

    if (NO_API_WORK) {
        $.getJSON("src/dates.json", function (data) {
            var div = $("td.day");

            console.log("Success!");
            console.log(data);

            $(".day").css({ borderWidth: "0px" });
            var days = $(".day");
            $.each(days, function (key, item) {
                var date = $(item).attr("id").toString().split(".").join("-");
                date += "T00:00:00";
                if (data.indexOf(date) !== -1) {
                    $(item).css({ borderColor: $(item).css("color"), borderWidth: "1px" });
                }
            });
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
    console.log(urls.availableDaysUrl + request);

    $.ajax({
        type: "GET",
        url: urls.availableDaysUrl + request,
        cache: false,
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Something went wrong!");
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        },
        success: function (data) {
            console.log("Success!");
            console.log(data);

            $(".day").css({ borderWidth: "0px" });
            var days = $(".day");
            $.each(days, function (key, item) {
                var date = $(item).attr("id").toString().split(".").join("-");
                date += "T00:00:00";
                if (data.indexOf(date) !== -1) {
                    $(item).css({ borderColor: $(item).css("color"), borderWidth: "1px" });
                }
            });
        }
    });
}

function getDaySchedule(sender, event) {
    var selectedOptionIDs = $(".checked").attr("id");
    var selectedDate = $(".day.selected").attr("id");

    if (NO_API_WORK) {
        $.getJSON("src/daySchedule.json", function (data) {
            var div = $("td.schedule");

            console.log(data);
            $.each(data, function (key, item) {
                //Тут должен быть код...
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
                        console.log($(`#${box}${id + i * 10}`));
                        try {
                            $(`#${box}${id + i * 10}`).addClass("selected");
                            if ($(`#${box}${id + i * 10}`).hasClass("busy")) {
                                selectionAvailable = false;
                            }
                        }
                        catch {
                            console.log("Inccorect index. Probably");
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
                        console.log($(`#${box}${id + i * 10}`));
                        try {
                            $(`#${box}${id + i * 10}`).removeClass("selected");
                            if ($(`#${box}${id + i * 10}`).hasClass("busy")) {
                                selectionAvailable = true;
                            }
                        }
                        catch {
                            console.log("Inccorect index. Probably");
                        }
                    }
                }
            );
            $(".free").click(function (event) {
                event.stopPropagation();

                if (selectionAvailable) {
                    var id = $(this).attr("id");
                    selectedBox = id.substr(3, 1);

                    var offset = parseInt(id.substr(4, id.length)) / 10;

                    selectedTime = $("#calendar").children().eq(offset).children().eq(0).html();

                    $("#registrationModal").modal("show");
                }
            });
        });
        return;
    }

    if (selectedDay === undefined) {
        selectedDay = Date.now();
    }
    else {
        selectedDay = new Date(selectedDay);
    }

    var request = "?";
    for (i = 0; i <= selectedOptions.length; i++) {
        if (options[selectedOptions[i]] !== undefined) {
            request += `id=${selectedOptions[i]}&`;
        }
    }

    if (selectedOptions.length === 0) {
        $(".day").css({ borderWidth: "0px" });
        return;
    }

    request += `date=${selectedDay.getDate().toString().length < 2 ? "0" + selectedDay.getDate().toString() : selectedDay.getDate().toString()}.${selectedDay.getMonth().toString().length < 2 ? "0" + selectedDay.getMonth().toString() : selectedDay.getMonth().toString()}.${selectedDay.getFullYear()}`;
    //request = request.substr(0, request.length - 1);
    console.log(urls.dayScheduleUrl + request);
    $.ajax({
        type: "GET",
        url: urls.dayScheduleUrl + request,
        cache: false,
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Something went wrong!");
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        },
        success: function (data) {
            console.log("Success!");
            console.log(data);

            $(".free").hover(
                function (event) {
                    console.log($(this));
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
                    var enoughSpace = true;
                    for (i = 1; i <= cells; i++) {
                        if (!$(`#${box}${id + i}`).hasClass("free")) {
                            enoughSpace = false;
                        }
                        else {
                            var color = $(`#${box}${id + i}`).css("background-color").split(",");
                            console.log(color);
                        }
                    }
                    if (enoughSpace) {
                        //
                    }
                },
                function (event) {
                    event.stopPropagation();
                }
            );
            $(".free").click(function (event)
            {
				//console.log("ect");
                event.stopPropagation();
				//if (selectionAvailable) {
				//	$(".registration").css({visibility: "visible"});
				//}
            });
        }
    });
}

function createOrder(time, boxID) {
    
    var CreateOrderRequest = {};
    CreateOrderRequest.WashOptionIDs = selectedOptions;
    CreateOrderRequest.Date = selectedDay; //selectedDate;
    CreateOrderRequest.Time = time; // new Date(2018, 01, 01, 17, 45);
    CreateOrderRequest.BoxID = boxID;
    CreateOrderRequest.Name;
    CreateOrderRequest.Surname;
    CreateOrderRequest.Tel;

    $.post(urls.createOrderUrl,
        JSON.stringify(CreateOrderRequest),
        function (value) {
            console.log("success");
        },
        "json"
    );
}

function optionToggle($sender) {
    var total = $("#total");
    var id = $sender.data("option-id");
    var $icon = $(".checkbox", $sender);

    var checked = $sender.hasClass("checked");

    if (checked) {     
        // Uncheck
        $icon.html("+");
        selectedOptions.splice(selectedOptions.indexOf(id), 1);

        totalPrice -= $sender.data("price");
        totalTime -= $sender.data("time");

        $sender.removeClass("checked");
    }
    else {
        // Check
        $icon.html("&ndash;");
        selectedOptions.push(id);

        totalPrice += $sender.data("price");
        totalTime += $sender.data("time");

        $sender.addClass("checked");
    }

    total.html(`Total: ${totalPrice.toFixed(1)}$ - ${totalTime.toFixed(1)} min`);
    getAvailableDay();
}

var actions = {
    getOptions: function () {
        $.ajax({
            url: urls.optionsUrl,
            type: 'GET',
            success: function (response) {
                helpers.updateOptions(response.washOptions);
            }
        });
    },
    getAvailableDays: function () {
        var selectedOptionIDs = $(".checked").attr("id");
        for (var i = 0; i < selectedOptionIDs.length; i++) {
            selectedOptionIDs = selectedOptionIDs.substring(8);
        }

        $.ajax({
            url: "/api/schedule/awailable-days",
            type: 'GET',
            data: { id: selectedOptionIDs },
            success: function (res) {
                console.log("Available days");
                console.log(res);
            }
        });
    },
    getAvailableTime: function (selectedDate, selectedOptionIDs) {
        selectedOptionIDs = $(".checked").attr("id");
        selectedDate = $(".day.selected").attr("id");
        for (var i = 0; i < selectedOptionIDs.length; i++) {
            selectedOptionIDs = selectedOptionIDs.substring(8);
        }

        $.ajax({
            url: "/api/schedule/day-shedule",
            type: 'GET',
            data: {
                id: selectedOptionIDs,
                date: selectedDate
            },
            success: function (res) {
                console.log("Time Schedule");
                console.log(res);
            },
            error: function (err) {
                console.error(err);
            }
        });
    },
    createOrder: function () {
        e.preventDefault();
        var selectedOptionIDs = $(".checked").attr("id");
        var selectedDate = $(".day.selected").attr("id");
        for (var i = 0; i < selectedOptionIDs.length; i++) {
            selectedOptionIDs = selectedOptionIDs.substring(8);
        }
        var CreateOrderRequest = new Object();
        CreateOrderRequest.WashOptionIDs = selectedOptionIDs;
        CreateOrderRequest.Date = "18.11.2018"; //selectedDate;
        CreateOrderRequest.Time = "18.11,2018"; // new Date(2018, 01, 01, 17, 45);
        CreateOrderRequest.BoxID = 3;

        $.post("api/schedule/create-order",
            $("#post").serialize(),
            function (value) {
                console.log("success");
            },
            "json"
        );
    }
};

var helpers = {
    updateOptions: function (options) {
        var optionsContainer = $("#options");

        optionsContainer.empty();

        var inner = "";
        // onclick = optionToggle
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            inner += `<li class="service" data-option-id="${option.optionID}" data-price="${option.price}" data-time="${option.time}">` +
                    `<div class="title-container">` +
                        `<div class="checkbox">+</div>` +
                        `<div class="descr">${option.optionDescription}</div>` +
                    `</div>` +
                    `<div class="info-container">` +
                        `<div class="price pull-right">${option.price}$</div>` +
                        `<div class="time pull-right"> ${option.time}m</div>` +
                    `</div >` +
                `</li >`;
        }

        inner += "<li style='margin-top: 10px; margin-bottom: 10px'><hr></li>";

        optionsContainer.html(inner);

        $(".service").on("click", function () {
            optionToggle($(this));
        });
    }
};

$(".form").on("submit", function (e) {
    console.log("Preventing default...");
    e.preventDefault();
});