$("#getOptions").on("click", function () {
    $.ajax({
        url: "/api/schedule/options",
        type: 'GET',
        success: function (res) {
            console.log(res);
            alert(res);
        }
    });
});

$("#getDays").on("click", function () {
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
});

$("#getTime").on("click", function () {
    var selectedOptionIDs = $(".checked").attr("id");
    var selectedDate = $(".day.selected").attr("id");
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
});

$("#createOrder").on("click", function (e) {
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
});

$(".form").on("submit", function (e) {
    console.log("Preventing default...");
    e.preventDefault();
});