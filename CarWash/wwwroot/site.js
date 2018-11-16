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
    availableDaysUrl: "api/schedule/awailable-days",    //Передаём список услуг (либо просто id, либо объект, из списка options. Я ещё точно не знаю)
    dayScheduleUrl: "api/schedule/day-shedule"          //Передаём список услуг и день (та же петрушка с обёектом, и объект Date, по-идее)
};

var options = {};

var hoveredOption;

var selectedDay;
var selectedOptions = [];

var totalPrice = 0;
var totalTime = 0;

$(document).ready(function () {
    changeCalendar();
    changeServices();
});

$(".schedule").click(function (event) {
    $(".day").css({ backgroundColor: "#ffffff" });
    selectedDay = undefined;
});

function serviceMouseOver(sender, event) {
    event.stopPropagation();
    if (hoveredOption !== $(sender).attr("id")) {
        hoveredOption = $(sender).attr("id");

        var id = $(sender).attr("id").substring(6);
        //console.log(id);
        //console.log(options);

        $(`#data_${id}`).html(`<div style="margin-left: 30px;">Price: ${options[id].price}<br>Time: ${options[id].time}</div>`);
        getDaySchedule();
    }
}

function serviceMouseOut (sender, event) {
    event.stopPropagation();
    hoveredOption = "";
    var id = $(sender).attr("id").substring(6);
    $(`#data_${id}`).html("");
}

function changeServices() {
    if (NO_API_WORK) {
        $.getJSON("services.json", function (data) {
            const div = $("#services");

            $(div).empty();

            var inner = "";

            console.log(data);
            $.each(data, function (key, item) {
                $.each(item, function (itemKey, value) {
                    options[value.optionID] = value;
                    inner += `<li><div><div id = "service_${value.optionID}" class = "checkbox" onclick="optionToggle(this);">+</div> <div id = "descr_${value.optionID}" class = "descr" onmouseover="serviceMouseOver(this, event);" onmouseout="serviceMouseOut(this, event)">${value.optionDescription}</div></div><div id = "data_${value.optionID}" class = "data"></div></li>`;
                });
                $('.checkbox, .descr').on('click', function () {
                    getDaySchedule();
                });
            });

            div.html(inner);
        });
        return;
    }
    $.ajax({
        type: "GET",
        url: urls.optionsUrl,
        cache: false,
        success: function (data) {
            const div = $("#services");

            $(div).empty();

            var inner = "";

            console.log(data);
            $.each(data, function (key, item) {
                $.each(item, function (itemKey, value) {
                    options[value.optionID] = value;
                    inner += `<li><div><div id = "service_${value.optionID}" class = "checkbox" onclick="optionToggle(this);">+</div> <div id = "descr_${value.optionID}" class = "descr" onmouseover="serviceMouseOver(this, event);" onmouseout="serviceMouseOut(this, event)">${value.optionDescription}</div></div><div id = "data_${value.optionID}" class = "data"></div></li>`;
                });
            });

            div.html(inner);
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

    for (i = today; i <= daysInMonth; i++) {
        html += `\n<tr>`;
        now.setDate(i);
        if (i === today) {
            html += `\n<td class="day today" onclick="selectDay(this, event)">${dayName[now.getDay()]}<br>${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}</td><td class="dayschedule"><div class="schedule"></div></td>`;
        }
        else {
            html += `\n<td class="day" onclick="selectDay(this, event)">${dayName[now.getDay()]} <br>${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}</td><td class="dayschedule"><div class="schedule"></div></td>`;
        }
        count++;
        html += `\n</tr>`;
        if (count > offset) {
            break;
        }
    }
    for (i = 1; i < offset - (daysInMonth - today); i++) {
        html += `\n<tr>`;
        now.setMonth(currentMonth + 1 > 11 ? 0 : currentMonth + 1);
        now.setDate(i);
        html += `\n<td class="day" onclick="selectDay(this, event)"> ${dayName[now.getDay()]} <br>${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}</td><td class="dayschedule"><div class="schedule"></div></td>`;
        count++;
        html += `\n</tr>`;
        if (count > offset) {
            break;
        }
    }

    $("#calendar").html(html);
}

function getAvailableDay(sender, event) {
    if (NO_API_WORK) {
        $.getJSON("dates.json", function (data) {
            var div = $("td.day");

            console.log(data); //Массив дат
            $.each(data, function (key, item) {
               //Тут должен быть код на изменение стилей доступных дней 
            });
        });
        return;
    }
    var request = "?";

    for (i = 0; i <= selectedOptions.length; i++) {
        if (options[selectedOptions[i]] != undefined) {
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
        }
    });
}

function getDaySchedule(sender, event) {
    if (NO_API_WORK) {
        $.getJSON("daySchedule.json", function (data) {
            var div = $("td.schedule");

            console.log(data);
            $.each(data, function (key, item) {
                //Тут должен быть код...
            });
        });
        return;
    }

    if (selectedDay == undefined) {
        selectedDay = Date.now();
    }
    else {
        selectedDay = new Date(selectedDay);
    }

    var request = "?";
    for (i = 0; i <= selectedOptions.length; i++) {
        if (options[selectedOptions[i]] != undefined) {
            request += `id=${selectedOptions[i]}&`;
        }
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
        }
    });
}

function selectDay(sender, event) {
    event.stopPropagation();
    console.log($(".day"));
    $(".day").css({ backgroundColor: "#ffffff" });
    $(sender).css({ backgroundColor: "#cccccc" });
    var date = $(sender).html().toString().substring($(sender).html().toString().indexOf("<br>") + 4).split(".");
    selectedDay = new Date();
    selectedDay.setDate(date[0]);
    selectedDay.setMonth(date[1] - 1);
    selectedDay.setFullYear(date[2]);
}

function optionToggle(sender) {
    var total = $("#total");
    var id = $(sender).attr("id").substring(8);
    //console.log($(sender));

    var checked = $(sender).text() == "+" ? true : false;
    console.log(checked);

    if (checked) {       
        $(sender).text("-");
        selectedOptions.push(id);

        totalPrice += options[id].price;
       // totalPrice.toFixed(1);
        totalTime += options[id].time;
        //totalTime.toFixed(1);
    }
    else {
        selectedOptions.splice(selectedOptions.indexOf(id), 1);
        $(sender).text("+");
        totalPrice -= options[id].price;
        //totalPrice.toFixed(1);
        totalTime -= options[id].time;
        //totalTime.toFixed(1);
    }

    total.html(`Total: ${totalPrice.toFixed(1)}$ - ${totalTime.toFixed(1)} min`);
    //console.log(selectedOptions);
}