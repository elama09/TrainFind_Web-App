
const allStations = [];
const allEveryStations = [];
var rightRouteStations;
var rightStationTrains;
var start;
var stop;


//Haetaan kaikki asemat API:sta AJAX:illa - Lisätään options listalle
$.ajax({
    type: "GET",
    url: "https://rata.digitraffic.fi/api/v1/metadata/stations",
    dataType: "json",
    success: function (response) {
        $.each(response, function (indexInArray, valueOfElement) {
            allEveryStations.push(this);
            if (this.passengerTraffic == true) {
                allStations.push(this)
                $('#stations').append(`<option value="${this.stationShortCode}">${this.stationName}</option>`)
                $('#stationss').append(`<option value="${this.stationShortCode}">${this.stationName}</option>`)
            }
        });
        console.dir(allStations);
    }
});

//Hae tiedot Reittihaun perusteella - Clikkaus Event
$('#submit').click(function () {
    start = $('#stations').val();
    stop = $('#stationss').val();
    console.log(start)
    console.log(stop)
    let date = new Date().toISOString();
    let url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + start + "/" + stop + "?startDate=" + date + "&limit=6";
    GetRouteTrains(url);
})

//Hae tiedot Asemahaun perusteella - Clikkaus Event
$('#findByStation').click(function () {
    start = start = $('#stations').val();
    let url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + start + "?departing_trains=5&include_nonstopping=false";
    GetStationTrains(url);
})

//Hae tiedot Asemahaun perusteella - AJAX ja osumien tulostus
function GetStationTrains(urll) {
    $.ajax({
        type: "GET",
        url: urll,
        dataType: "json",
        success: function (response) {
            console.log(response)
            rightStationTrains = response;

            let dateNow = new Date()
            let trainNumberRow = 0;
            let startTime;
            let stopTime;
            let result = document.getElementById('resultss');
            result.innerHTML = '';

            for (let i = 0; i < rightStationTrains.length; i++) {

                for (let j = 0; j < rightStationTrains[i].timeTableRows.length; j++) {

                    if (rightStationTrains[i].timeTableRows[j].stationShortCode == start &&
                        rightStationTrains[i].timeTableRows[j].commercialStop == true &&
                        rightStationTrains[i].timeTableRows[j].type == "DEPARTURE" &&
                        new Date(rightStationTrains[i].timeTableRows[j].scheduledTime) >= dateNow) {

                        startTime = new Date(rightStationTrains[i].timeTableRows[j].scheduledTime).toLocaleTimeString()

                        let div = document.createElement('div');
                        div.classList.add('card', 'card-body', 'mb-3');
                        div.innerHTML = `<div class="row">
                                    <div class="col-sm-6">
                                        <h4>Lähtee asemalta: ` + startTime +
                                        `<br><hr></h4>
                                        <ul class="list-group">
                                            <li class="list-group-item">Junan nro: ${rightStationTrains[i].trainNumber}</li>
                                            <li class="list-group-item">Junan tyyppi: ${rightStationTrains[i].trainType}</li>
                                            <li class="list-group-item">Päätepysäkki: ${StationName(rightStationTrains[i].timeTableRows[rightStationTrains[i].timeTableRows.length - 1].stationShortCode)}</li>
                                        </ul>
                                    </div>
                                    <div class="col-sm-6 text-center">
                                        <img class="rounded-circle mt-2" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcz6yezRS7FS7EMlzzaSrsoYArD7HwyWIc6754kpbdwAWQ0bLtsg">
                                    </div>
                                </div>`
                        result.appendChild(div);
                        break;
                    }
                }
            }

            function StationName(code) {
                for (let i = 0; i < allEveryStations.length; i++) {
                    if (allEveryStations[i].stationShortCode == code) {
                        return allEveryStations[i].stationName;
                    }
                }
            }
        }
    });
}

//Hae tiedot Reittihaun perusteella - AJAX ja osumien tulostus
function GetRouteTrains(urll) {
    $.ajax({
        type: "GET",
        url: urll,
        dataType: "json",
        success: function (response) {
            console.log(response)
            rightRouteStations = response;

            let trainNumberRow = 0;
            let startTime;
            let stopTime;
            let result = document.getElementById('results');
            result.innerHTML = '';

            if (response.code == 'TRAIN_NOT_FOUND') {
                let div = document.createElement('div');
                div.classList = "alert alert-danger";
                div.appendChild(document.createTextNode('Ei löytynyt suoria yhteyksiä!'));
                let container = document.getElementById('divDanger');
                let form = document.getElementById('formDanger');
                container.insertBefore(div, form);

                setTimeout(function () {
                    $('.alert').fadeOut(2000)
                }, 2000)

                return;
            }

            $.each(response, function (indexInArray, valueOfElement) {
                let div = document.createElement('div');
                div.classList.add('card', 'card-body', 'mb-3');
                div.innerHTML = `<div class="row">
                                    <div class="col-sm-6">
                                        <h4>Lähtee asemalta: ` + FindRightStart() +
                                        `<br><hr>Juna perillä: `+ FindRightStop()+`</h4>
                                        <ul class="list-group">
                                            <li class="list-group-item">Junan nro: ${this.trainNumber}</li>
                                            <li class="list-group-item">Junan tyyppi: ${this.trainType}</li>
                                            <li class="list-group-item">Junan kategoria: ${this.trainCategory}</li>
                                        </ul>
                                    </div>
                                    <div class="col-sm-6 text-center">
                                        <img class="rounded-circle mt-2" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSd0iHHBZC82sx2qdxPeWyQUiqeVS0sKY1UbBFMX5CdVaqsVKH">
                                    </div>
                                </div>`
                trainNumberRow++;
                result.appendChild(div);
            });

            function FindRightStart() {
                for (let i = 0; i < rightRouteStations[trainNumberRow].timeTableRows.length; i++) {
                    if (rightRouteStations[trainNumberRow].timeTableRows[i].stationShortCode == start &&
                        rightRouteStations[trainNumberRow].timeTableRows[i].trainStopping == true &&
                        rightRouteStations[trainNumberRow].timeTableRows[i].type == "DEPARTURE") {
                        startTime = new Date(rightRouteStations[trainNumberRow].timeTableRows[i].scheduledTime).toLocaleTimeString()
                        
                        return startTime;
                    }
                }
            }

            function FindRightStop() {
                for (let i = 0; i < rightRouteStations[trainNumberRow].timeTableRows.length; i++) {
                    if (rightRouteStations[trainNumberRow].timeTableRows[i].stationShortCode == stop &&
                        rightRouteStations[trainNumberRow].timeTableRows[i].trainStopping == true &&
                        rightRouteStations[trainNumberRow].timeTableRows[i].type == "ARRIVAL") {

                        stopTime = new Date(rightRouteStations[trainNumberRow].timeTableRows[i].scheduledTime).toLocaleTimeString()
                        return stopTime;
                    }
                }
            }
        }
    });

    
}

//Hae tiedot Junahaun perusteella - Clikkaus Event
$('#findByTrain').click(function () {
    let trainNumber = $('#trainNum').val();
    let date = new Date().toISOString().substr(0, 10);
    let url = "https://rata.digitraffic.fi/api/v1/trains/" + date + "/" + trainNumber;
    GetTrain(url);
})

//Hae tiedot Junahaun perusteella - AJAX ja osumien tulostus
function GetTrain(urll) {
    $.ajax({
        type: "GET",
        url: urll,
        dataType: "json",
        success: function (response) {
            console.dir(response)

            let result = document.getElementById('resultsss');
            result.innerHTML = '';

            if (response.length == 0 || $('#trainNum').val() == 0) {
                let div = document.createElement('div');
                div.classList = "alert alert-danger";
                div.appendChild(document.createTextNode('Numerolla ei löydy junaa, kokeile toista numeroa!'));
                let container = document.getElementById('divDanger');
                let form = document.getElementById('formDanger');
                container.insertBefore(div, form);

                setTimeout(function () {
                    $('.alert').fadeOut(2000)
                },2000)

                return;
            }

            let div = document.createElement('div');
            div.classList.add('card', 'card-body', 'mb-3');
            div.innerHTML = `       <div id="addLiHere" class="text-center">
                                        <h4 class="pb-3">Junan Tiedot: ${response[0].trainType} ${response[0].trainNumber}<br>
                                        Junan kategoria: ${response[0].trainCategory}<br>
                                        Junan pysäkit: </h4>
                                    </div>`
            result.appendChild(div);

            for (let i = 0; i < response[0].timeTableRows.length; i++) {
                if (i % 2 == 0) {
                    $('#addLiHere').append('<li class="list-group-item list-group-item-success">' + StationName(response[0].timeTableRows[i].stationShortCode) + '&emsp;' + response[0].timeTableRows[i].type + '</li>');
                } else {
                    $('#addLiHere').append('<li class="list-group-item list-group-item-dark">' + StationName(response[0].timeTableRows[i].stationShortCode) + '&emsp;' + response[0].timeTableRows[i].type + '</li>');
                }
            }

            function StationName(code) {
                for (let i = 0; i < allEveryStations.length; i++) {
                    if (allEveryStations[i].stationShortCode == code) {
                        return allEveryStations[i].stationName;
                    }
                }
            }
        }
    });
}
