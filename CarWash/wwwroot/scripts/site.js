const NO_API_WORK = true;
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
    daySelected: "rgb(0,206,209)",
    daySelectedText: "#ffffff",
    dayDeselectedText: "rgb(30, 0, 230)",
    dayDeselected: "#ffffff",
    dayHoverIn: "rgba(0,206,209,0.35)",
    dayHoverOut: "#ffffff",
    today: "#4b0082",
    availableDay: "green"
};

const urls = {
    optionsUrl: "api/schedule/options",                 //Ничего не передаём
    availableDaysUrl: "api/schedule/awailable-days",    //Передаём список услуг (либо просто id, либо объект, из списка options. Я ещё точно не знаю)
    dayScheduleUrl: "api/schedule/day-shedule"          //Передаём список услуг и день (та же петрушка с обёектом, и объект Date, по-идее)
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

var selectedDayEl;

var selectedOptions = [];


var totalPrice = 0;

var totalTime = 0;

$(document).ready(function () {
    changeServices();
    changeCalendar();
});

$(".schedule").click(function (event) {
    $(".day").css({ backgroundColor: colors.dayDeselected, color: colors.dayDeselectedText });
    $(".today").css({ color: colors.today });
    selectedDay = undefined;
    selectedDayEl = undefined;
});

function changeServices() {
    if (NO_API_WORK) {
        $.getJSON("src/services.json", function (data) {
            const div = $("#services");

            $(div).empty();

            var inner = "";

            console.log(data);
            $.each(data, function (key, item) {
                $.each(item, function (itemKey, value) {
                    options[value.optionID] = value;
                    inner += `<li><div><div id = "service_${value.optionID}" class = "checkbox" onclick="optionToggle(this);">+</div> <div id = "descr_${value.optionID}" class = "descr">${value.optionDescription}</div></div><div style="margin-left: 30px;">${value.price}$ ${value.time}m</div></li>`;
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
            
            $.each(data, function (key, item) {
                $.each(item, function (itemKey, value) {
                    options[value.optionID] = value;
                    inner += `<li><div><div id = "service_${value.optionID}" class = "checkbox" onclick="optionToggle(this);">+</div> <div id = "descr_${value.optionID}" class = "descr">${value.optionDescription}</div></div><div style="margin-left: 30px;">${options[id].price}$ ${options[id].time}m</div></li>`;
                });
            });

            inner += "<li style='margin-top: 10px; margin-bottom: 10px'><hr></li>";

            div.html(inner);

            //$(".descr").hover(
            //    function (event) {
            //        event.stopPropagation();
            //        if (hoveredOption !== $(this).attr("id")) {
            //            hoveredOption = $(this).attr("id");

            //            var id = $(this).attr("id").substring(6);

            //            $(`#data_${id}`).html(`<div style="margin-left: 30px;">Price: ${options[id].price}<br>Time: ${options[id].time}</div>`);
            //        }
            //    },
            //    function (event) {
            //        event.stopPropagation();
            //        hoveredOption = "";
            //        var id = $(this).attr("id").substring(6);
            //        $(`#data_${id}`).html("");
            //    }
            //);
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
        now.setMonth(currentMonth + 1 > 11 ? 0 : currentMonth + 1);
        now.setDate(i);
        html += `\n<td id="${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}" class="day">${dayName[now.getDay()]}</td>`;
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
        html += `\n<tr><td>
            ${time.getHours() < 10 ? "0" + time.getHours() : time.getHours()}:
            ${time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes()}
            </td>
            <td id=box1${time.getHours() * 60 + time.getMinutes() - 9 * 60} class="dayschedule free"></td>
            <td id=box2${time.getHours() * 60 + time.getMinutes() - 9 * 60} class="dayschedule free"></td>
            <td id=box3${time.getHours() * 60 + time.getMinutes() - 9 * 60} class="dayschedule free"></td>
            <td id=box4${time.getHours() * 60 + time.getMinutes() - 9 * 60} class="dayschedule free"></td>
            </tr>`;
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
        $(this).css({ backgroundColor: colors.daySelected, color: colors.daySelectedText });

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
    if (NO_API_WORK) {
        $.getJSON("src/dates.json", function (data) {
            var div = $("td.day");

            console.log(data); //Массив дат
            $.each(data, function (key, item) {
               //Тут должен быть код на изменение стилей доступных дней 
            });
        });
        return;
    }
    var request = "?";

    if (selectedOptions.length === 0) {
        $(".day").css({ borderWidth: "0px" });
        return;
    }

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
                if (data.indexOf(date) != -1) {
                    $(item).css({ borderColor: $(item).css("color"), borderWidth: "1px" });
                }
            });
        }
    });
}

function getDaySchedule(sender, event) {
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

                    var enoughSpace = true;
                    if ($(`#${box}${id + (cells - 1) * 10}`).length <= 0) {
                        enoughSpace = false;
                    }

                    for (i = 0; i < cells; i++) {
                        console.log($(`#${box}${id + i * 10}`));
                        if ($(`#${box}${id + i * 10}`).hasClass("free") && enoughSpace) {
                            try {
                                var color = $(`#${box}${id + i * 10}`).css("background-color").split(',');

                                var pref = color[0].substr(0, color[0].indexOf('('));

                                color[0] = color[0].substr(color[0].indexOf('(') + 1);
                                color[1] = parseInt(color[1]) + 50;
                                color[color.length - 1] = color[color.length - 1].substring(0, color[color.length - 1].length - 1);

                                var nColor = `${pref}(${color[0]}, ${color[1]}, ${color[2]}`;

                                if (color[3] != undefined) {
                                    nColor += `, ${color[3]})`;
                                }
                                else {
                                    nColor += ")";
                                }

                                $(`#${box}${id + i * 10}`).css({ backgroundColor: nColor });
                            }
                            catch {
                                console.log();
                            }
                        }
                        else {
                            enoughSpace = false;

                            try {
                                var color = $(`#${box}${id + i * 10}`).css("background-color").split(',');

                                var pref = color[0].substr(0, color[0].indexOf('('));

                                color[0] = color[0].substr(color[0].indexOf('(') + 1);
                                color[0] = parseInt(color[0]) + 50;
                                color[color.length - 1] = color[color.length - 1].substring(0, color[color.length - 1].length - 1);

                                var nColor = `${pref}(${color[0]}, ${color[1]}, ${color[2]}`;

                                if (color[3] != undefined) {
                                    nColor += `, ${color[3]})`;
                                }
                                else {
                                    nColor += ")";
                                }

                                $(`#${box}${id + i * 10}`).css({ backgroundColor: nColor });
                            }
                            catch {
                                console.log();
                            }
                        }
                    }
                    if (enoughSpace) {
                        //
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

                    var enoughSpace = true;
                    if ($(`#${box}${id + (cells - 1) * 10}`).length <= 0) {
                        enoughSpace = false;
                    }

                    for (i = 0; i < cells; i++) {
                        if ($(`#${box}${id + i * 10}`).hasClass("free") && enoughSpace) {
                            try {
                                var color = $(`#${box}${id + i * 10}`).css("background-color").split(',');
                                var pref = color[0].substr(0, color[0].indexOf('('));
                                color[0] = color[0].substr(color[0].indexOf('(') + 1);
                                color[1] = parseInt(color[1]) - 50;
                                color[color.length - 1] = color[color.length - 1].substring(0, color[color.length - 1].length - 1);

                                var nColor = `${pref}(${color[0]}, ${color[1]}, ${color[2]}`;
                                if (color[3] != undefined) {
                                    nColor += `, ${color[3]})`;
                                }
                                else {
                                    nColor += ")";
                                }
                                console.log(nColor);
                                $(`#${box}${id + i * 10}`).css({ backgroundColor: nColor });
                            }
                            catch {
                                console.log();
                            }
                        }
                        else {
                            try {
                                var color = $(`#${box}${id + i * 10}`).css("background-color").split(',');
                                var pref = color[0].substr(0, color[0].indexOf('('));
                                color[0] = color[0].substr(color[0].indexOf('(') + 1);
                                color[0] = parseInt(color[0]) - 50;
                                color[color.length - 1] = color[color.length - 1].substring(0, color[color.length - 1].length - 1);
                                console.log(color);

                                var nColor = `${pref}(${color[0]}, ${color[1]}, ${color[2]}`;
                                if (color[3] != undefined) {
                                    nColor += `, ${color[3]})`;
                                }
                                else {
                                    nColor += ")";
                                }
                                console.log(nColor);
                                $(`#${box}${id + i * 10}`).css({ backgroundColor: nColor });
                            }
                            catch {
                                console.log();
                            }
                        }
                    }
                }
            );
            $(".free").click(function (event) {
                event.stopPropagation();
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
                event.stopPropagation();
            });
        }
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
    }
    else {
        selectedOptions.splice(selectedOptions.indexOf(id), 1);
        $(sender).html("+");
        totalPrice -= options[id].price;
        totalTime -= options[id].time;
    }

    total.html(`Total: ${totalPrice.toFixed(1)}$ - ${totalTime.toFixed(1)} min`);
    getAvailableDay();
}