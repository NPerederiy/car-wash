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
});


function serviceMouseOver(sender, event) {
    console.log("1 = " + hoveredOption);
    console.log($(sender).children().attr("id"));
    if (hoveredOption != $(sender).children().attr("id")) {
        hoveredOption = $(sender).children().attr("id");
        var id = $(sender).children().attr("id").substring(8);

        for (i = 0; i < options.length; i++) {
            if (options[i].optionID == id) {
                $(sender).html($(sender).html() + `<br><div style="margin-left: 30px;">Price: ${options[i].price}<br>Time: ${options[i].time}</div>`);
                break;
            }
        }
    }
    event.stopPropagation();
}

function serviceMouseOut (sender, event) {
    event.stopPropagation();
    hoveredOption = "";
    var html = $(sender).html();
    html = html.substring(0, html.indexOf("<br>"));
    console.log(html);
    $(sender).html(html);
}

function changeServices() {
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
                    options[itemKey] = value;
                    inner += `<li/* onmouseover="serviceMouseOver(this, event);" onmouseout="serviceMouseOut(this, event)"*/><input id=${"service_" + value.optionID} type="checkbox" onchange="optionToggle(this);"/> <label for="${"service_" + value.optionID}">${value.optionDescription}</label></li>`;
                });
            });

            console.log(options);

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

//Пока не работает
function getAvailableDay(sender, event) {
    var item = {};
    item.WashOptions = [];
    for (i = 0; i < selectedOptions.length; i++) {
        item.WashOptions.push(options[i]);
    }
    console.log(JSON.stringify(item));
    $.ajax({
        type: "GET",
        url: urls.availableDaysUrl,
        cache: false,
        contentType: "application/json",
        data: JSON.stringify(item),
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
    console.log(sender);
    selectedDay = $(sender).html().toString().substring;
}

function optionToggle(sender) {
    var total = $("#total");
    var id = $(sender).attr("id").substring(8);
    console.log($(sender));

    var checked = $(sender).attr('checked');
    console.log(checked);

    if (checked == "checked") {
        $(sender).attr("checked", false);

        selectedOptions.splice(selectedOptions.indexOf(id), 1);

        totalPrice -= options[id].price;
        totalTime -= options[id].time;
    }
    else {
        $(sender).attr("checked", true);

        selectedOptions.push(id);
        totalPrice += options[id].price;
        totalTime += options[id].time;
    }

    total.html(`Total: ${totalPrice.toString()} ${totalTime}`);
    console.log(selectedOptions);
}


//function addItem() {
//    const item = {
//        name: $("#add-name").val(),
//        isComplete: false
//    };

//    $.ajax({
//        type: "POST",
//        accepts: "application/json",
//        url: uri,
//        contentType: "application/json",
//        data: JSON.stringify(item),
//        error: function (jqXHR, textStatus, errorThrown) {
//            alert("Something went wrong!");
//        },
//        success: function (result) {
//            getData();
//            $("#add-name").val("");
//        }
//    });
//}

//function deleteItem(id) {
//    $.ajax({
//        url: uri + "/" + id,
//        type: "DELETE",
//        success: function (result) {
//            getData();
//        }
//    });
//}

//function editItem(id) {
//    $.each(todos, function (key, item) {
//        if (item.id === id) {
//            $("#edit-name").val(item.name);
//            $("#edit-id").val(item.id);
//            $("#edit-isComplete")[0].checked = item.isComplete;
//        }
//    });
//    $("#spoiler").css({ display: "block" });
//}

//$(".my-form").on("submit", function () {
//    const item = {
//        name: $("#edit-name").val(),
//        isComplete: $("#edit-isComplete").is(":checked"),
//        id: $("#edit-id").val()
//    };

//    $.ajax({
//        url: uri + "/" + $("#edit-id").val(),
//        type: "PUT",
//        accepts: "application/json",
//        contentType: "application/json",
//        data: JSON.stringify(item),
//        success: function (result) {
//            getData();
//        }
//    });

//    closeInput();
//    return false;
//});

//function closeInput() {
//    $("#spoiler").css({ display: "none" });
//}