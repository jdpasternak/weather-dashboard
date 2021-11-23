const API_KEY = "5e465552b5b1cf92efd83e5e7d35aea2";
const DateTime = luxon.DateTime;

var currentCityEl = document.getElementById("currentCity");
var currentDateEl = document.getElementById("currentDate");
var currentWeatherIconEl = document.getElementById("currentWeatherIcon");
var currentTempEl = document.getElementById("currentTemp");
var currentWindEl = document.getElementById("currentWind");
var currentHumidityEl = document.getElementById("currentHumidity");
var currentUvIndexEl = document.getElementById("currentUvIndex");
var fiveDayForecastEl = document.getElementById("fiveDayForecast");
var searchButtonEl = document.getElementById("searchButton");
var citySearchEl = document.getElementById("citySearch");
var forecastsEl = document.getElementById("forecasts");
var historyEl = document.getElementById("history");

var searchHistory = [];

var getForecast = function (cityName) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`
  ).then((response) => {
    if (response.ok) {
      response.json().then((data) => {
        var currentCity = data.name;
        if (!searchHistory.includes(currentCity)) {
          searchHistory.push(currentCity);
          saveSearchHistory();
        }
        fetch(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&units=imperial&exclude=hourly&appid=${API_KEY}`
        ).then((response) =>
          response.json().then((data) => {
            currentCityEl.innerText = currentCity;
            currentDateEl.innerText = DateTime.fromSeconds(
              data.current.dt
            ).toLocaleString();
            currentWeatherIconEl.innerHTML = `<img src="https://openweathermap.org/img/w/${data.current.weather[0].icon}.png" />`;
            currentTempEl.innerHTML = `${data.current.temp}&deg;F`;
            currentWindEl.innerHTML = `${data.current.wind_speed} MPH`;
            currentHumidityEl.innerHTML = `${data.current.humidity}%`;
            var uvIndex = data.current.uvi;
            currentUvIndexEl.innerHTML = uvIndex;
            if (uvIndex < 5) {
              currentUvIndexEl.classList = "badge bg-success";
            } else if (uvIndex < 10) {
              currentUvIndexEl.classList = "badge bg-warning";
            } else {
              currentUvIndexEl.classList = "badge bg-danger";
            }

            fiveDayForecastEl.innerHTML = "";

            var futureForecast = data.daily;
            for (var i = 1; i < 6; i++) {
              var forecastInfo = futureForecast[i];
              var date = DateTime.fromSeconds(forecastInfo.dt).toLocaleString();
              var weatherIcon = `<img src="https://openweathermap.org/img/w/${forecastInfo.weather[0].icon}.png"`;
              var temp = forecastInfo.temp.day;
              var wind = forecastInfo.wind_speed;
              var humidity = forecastInfo.humidity;

              var futureForecastCardEl = document.createElement("div");
              futureForecastCardEl.classList = "card col-12 col-xl-2";
              var content = `<div class="card-body">
            <h6 class="card-title">${date}</h4>
            <div class="card-text">
              <div>
                ${weatherIcon}
              </div>
              <div>
                Temp: ${temp}&deg;F
              </div>
              <div>Wind: ${wind} MPH</div>
              <div>Humidity: ${humidity}%</div>
            </div>
          </div>`;

              futureForecastCardEl.innerHTML = content;
              fiveDayForecastEl.appendChild(futureForecastCardEl);

              console.log(date, temp, wind, humidity);
            }
          })
        );
      });
    } else {
      forecastsEl.innerHTML = "That city doesn't exists on this planet!";
    }
  });
};

var searchButtonHandler = function (evt) {
  var searchTerm = citySearchEl.value;
  console.log(searchTerm);
  citySearchEl.value = "";
  searchButtonEl.classList.add("disabled");
  location.replace(`?city=${searchTerm}`);
};

var queryHandler = () => {
  var queryString = location.search;
  if (queryString) {
    queryString
      .split("?")[1]
      .split("&")
      .forEach((q) => {
        if (q.split("=")[0] === "city") {
          getForecast(q.split("=")[1]);
        } else {
          forecastsEl.innerHTML = "Enter a City to view forecasts.";
        }
      });
  } else {
    forecastsEl.innerHTML = "Enter a City to view forecasts.";
  }
};

// Disables search button if no input
citySearchEl.addEventListener("input", () => {
  if (citySearchEl.value) {
    searchButtonEl.classList.remove("disabled");
  } else {
    searchButtonEl.classList.add("disabled");
  }
});
searchButtonEl.addEventListener("click", searchButtonHandler);

var saveSearchHistory = () => {
  localStorage.setItem("history", JSON.stringify(searchHistory));
};

var loadSearchHistroy = () => {
  var savedHistory = JSON.parse(localStorage.getItem("history"));

  if (savedHistory) {
    searchHistory = savedHistory;
    savedHistory.forEach((h) => {
      var aEl = document.createElement("a");
      aEl.classList = "list-group-item btn btn-secondary";
      aEl.innerHTML = h;
      aEl.href = `?city=${h}`;
      historyEl.appendChild(aEl);
    });
  }
};

queryHandler();
loadSearchHistroy();
