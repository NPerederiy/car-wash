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
    optionsUrl: "api/schedule/options"
};

const uriShedule = "";
var options;

var selectedDay;
var selectedOptions;


//function getCount(data) {
//  const el = $("#counter");
//  let name = "to-do";
//  if (data) {
//    if (data > 1) {
//      name = "to-dos";
//    }
//    el.text(data + " " + name);
//  } else {
//    el.text("No " + name);
//  }
//}

$(document).ready(function() {
  //getData();
});

$(".shedule").click(function (event) {
    $(".day").css({ backgroundColor: "#ffffff" });
    event.stopPropagation();
});

function selectDay(sender) {
    event.stopPropagation();
    console.log($(".day"));
    $(".day").css({ backgroundColor: "#ffffff" });
    $(sender).css({ backgroundColor: "#cccccc" });
    console.log(sender);
    selectedDay = $(sender).html().toString().substring;
}

function getData() {
  $.ajax({
    type: "GET",
    url: uri,
    cache: false,
    success: function(data) {
      const tBody = $("#todos");

      $(tBody).empty();

      getCount(data.length);

      $.each(data, function(key, item) {
        const tr = $("<tr></tr>")
          .append(
            $("<td></td>").append(
              $("<input/>", {
                type: "checkbox",
                disabled: true,
                checked: item.isComplete
              })
            )
          )
          .append($("<td></td>").text(item.name))
          .append(
            $("<td></td>").append(
              $("<button>Edit</button>").on("click", function() {
                editItem(item.id);
              })
            )
          )
          .append(
            $("<td></td>").append(
              $("<button>Delete</button>").on("click", function() {
                deleteItem(item.id);
              })
            )
          );

        tr.appendTo(tBody);
      });

      todos = data;
    }
  });
}

function addItem() {
  const item = {
    name: $("#add-name").val(),
    isComplete: false
  };

  $.ajax({
    type: "POST",
    accepts: "application/json",
    url: uri,
    contentType: "application/json",
    data: JSON.stringify(item),
    error: function(jqXHR, textStatus, errorThrown) {
      alert("Something went wrong!");
    },
    success: function(result) {
      getData();
      $("#add-name").val("");
    }
  });
}

function deleteItem(id) {
  $.ajax({
    url: uri + "/" + id,
    type: "DELETE",
    success: function(result) {
      getData();
    }
  });
}

function editItem(id) {
  $.each(todos, function(key, item) {
    if (item.id === id) {
      $("#edit-name").val(item.name);
      $("#edit-id").val(item.id);
      $("#edit-isComplete")[0].checked = item.isComplete;
    }
  });
  $("#spoiler").css({ display: "block" });
}

$(".my-form").on("submit", function() {
  const item = {
    name: $("#edit-name").val(),
    isComplete: $("#edit-isComplete").is(":checked"),
    id: $("#edit-id").val()
  };

  $.ajax({
    url: uri + "/" + $("#edit-id").val(),
    type: "PUT",
    accepts: "application/json",
    contentType: "application/json",
    data: JSON.stringify(item),
    success: function(result) {
      getData();
    }
  });

  closeInput();
  return false;
});

function closeInput() {
  $("#spoiler").css({ display: "none" });
}

function changeServices() {
    $.ajax({
        type: "GET",
        url: urls.optionsUrl,
        cache: false,
        success: function (data) {
            const div = $("#services");

            options = data;
            console.log(options);

            $(div).empty();

            getCount(data.length);

            $.each(data, function (key, item) {
                const inner = $("<li>")
                    .append(
                        $("<input/>", {
                            type: "checkbox",
                            checked: false
                        })
                    )
                    .append(item.OptionDescription)
                    .append(item.OptionPrice)
                    .append("</li>");
            });

            inner.appendTo(div);
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
            html += `\n<td class="day today" onclick="selectDay(this)">${dayName[now.getDay()]}<br>${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}</td><td class="dayShedule"><div class="shedule"></div></td>`;
        }
        else {
            html += `\n<td class="day" onclick="selectDay(this)">${dayName[now.getDay()]} <br>${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}</td><td class="dayShedule"><div class="shedule"></div></td>`;
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
        html += `\n<td class="day" onclick="selectDay(this)"> ${dayName[now.getDay()]} <br>${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}</td><td class="dayShedule"><div class="shedule"></div></td>`;
        count++;
        html += `\n</tr>`;
        if (count > offset) {
            break;
        }
    }

    $("#calendar").html(html);
}