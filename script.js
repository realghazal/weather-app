//Grabbing DOM
let formLocation = document.getElementById("header__searchField");
let submitBtn = document.querySelector(".header__button");
let errorMessage = document.querySelector(".error-message");

let cityName = document.querySelector(".currentWeather__location--name");
let country = document.querySelector(".currentWeather__location--country");
let temp = document.querySelector(".currentWeather__temp");
let remark = document.querySelector(".currentWeather__remark");
let humidity = document.querySelector(".humidity");
let wind = document.querySelector(".wind");
let uvIndex = document.querySelector(".uv-index");
let tempMax = document.querySelector("weather-forecast__readings--tempMax");
let tempMin = document.querySelector(".weather-forecast__readings--tempMin");
let weatherIcon = document.querySelector(".weather-forecast__readings--icon");
let day = document.querySelector(".weather-forecast__readings--day");

let latitude = 0;
let longitude = 0;

let currentWeather = document.querySelector(".currentWeather");
let weatherStats = document.querySelector(".weather-stats");
let weatherForecast = document.querySelector(".weather-forecast");

//Grab User Current Location on Page Load
function getUserCurrentLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

window.addEventListener("load", async () => {
  try {
    const position = await getUserCurrentLocation();

    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  } catch (error) {
    console.error(error);
  }
});

//Simulate Event Listener
submitBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  //Turn all display to none
  currentWeather.style.display = "none";
  weatherStats.style.display = "none";
  weatherForecast.style.display = "none";
  currentWeather.style.opacity = 0;
  weatherStats.style.opacity = 0;
  weatherForecast.style.opacity = 0;

  //Display Loading Status
  showError(errorMessage, "Loading Data..............", 1);

  //Fetch City Coordinate Data from Geo API
  await updateCityCoordinateUI(formLocation);

  //Update the 5-Day Weather Forecast UI
  await updateForecastUI(5, longitude, latitude);

  //Clear the form field
  formLocation.value = "";
  //   console.log(fetchWeather.current.temperature_2m);
  //   console.log(`Today's temp Max is ${tempMaxToday}`);
  //   console.log(`Today's date is ${timeWeds}`);
});

//Day Converter
let dayConverter = (date, index) => {
  const datte = new Date(date);

  const day = datte.toLocaleDateString("en-US", {
    weekday: "long",
  });

  if (index == 0) {
    return "Today";
  } else {
    return day;
  }
};

let updateForecastUI = async (numOfDays, longitude, latitude) => {
  let fetchWeather = await fetchWeatherData(longitude, latitude);
  for (let i = 0; i < numOfDays; i++) {
    //Create New Element
    let div = document.createElement("div");
    div.classList.add("weather-forecast__readings");
    weatherForecast.appendChild(div);

    let para1 = document.createElement("p");
    para1.classList.add("weather-forecast__readings--day");
    para1.textContent = dayConverter(`${fetchWeather.daily.time[i]}`, i);
    div.appendChild(para1);

    let para2 = document.createElement("p");
    para2.classList.add("weather-forecast__readings--icon");

    //set the icon
    await getWeatherCodeDescription(para2, fetchWeather.daily.weather_code[i]);
    div.appendChild(para2);

    let tempReadings = document.createElement("p");
    tempReadings.classList.add("weather-forecast__readings--temp");
    div.appendChild(tempReadings);

    let span1 = document.createElement("span");
    span1.classList.add("weather-forecast__readings--tempMax");
    span1.textContent = fetchWeather.daily.temperature_2m_max[i];
    tempReadings.appendChild(span1);
    let sup1 = document.createElement("sup");
    sup1.textContent = 0;
    span1.appendChild(sup1);

    let span2 = document.createElement("span");
    span2.classList.add("weather-forecast__readings--tempMin");
    span2.textContent = fetchWeather.daily.temperature_2m_min[i];
    tempReadings.appendChild(span2);
    let sup2 = document.createElement("sup");
    sup2.textContent = 0;
    span2.appendChild(sup2);
  }
};

let updateCityCoordinateUI = async (city) => {
  let getCity = await getCityCoordinate(city.value);

  //Display Loading Status
  showError(errorMessage, "", 0);
  //   weather.results[0].name
  console.log(getCity.results[0]);

  //Update the UI
  //   weather.results[0].name
  currentWeather.style.display = "flex";
  weatherStats.style.display = "flex";
  weatherForecast.style.display = "block";
  currentWeather.style.opacity = 1;
  weatherStats.style.opacity = 1;
  weatherForecast.style.opacity = 1;
  cityName.innerText = getCity.results[0].name;
  country.innerText = getCity.results[0].country;
  longitude = getCity.results[0].longitude;
  latitude = getCity.results[0].latitude;

  let fetchWeather = await fetchWeatherData(longitude, latitude);
  console.log(fetchWeather);
  temp.innerText = fetchWeather.current.temperature_2m;
  //   fetchWeather.current.weather_code;
  wind.innerText = fetchWeather.current.wind_speed_10m;
  humidity.innerText = fetchWeather.current.relative_humidity_2m;
};

//Fetching Data from Geo API
let getCityCoordinate = async (city) => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`,
    );

    //Grab the response in json()
    const cityCoordinate = await response.json();
    return cityCoordinate;
  } catch (error) {
    console.log(error);
  }
};

//Get Weathercode  Description
let getWeatherCodeDescription = (elem, weatherCode) => {
  if (weatherCode == 0) {
    elem.textContent = "Clear sky  ☀";
  } else if (weatherCode == 1 || weatherCode == 2 || weatherCode == 3) {
    elem.textContent = "Partly cloudy  ⛅";
  } else if (weatherCode == 45 || weatherCode == 48) {
    elem.textContent = "Foggy  🌫";
  } else if (weatherCode == 51 || weatherCode == 53 || weatherCode == 55) {
    elem.textContent = "Drizzle  🌦";
  } else if (weatherCode == 61 || weatherCode == 63 || weatherCode == 65) {
    elem.textContent = "Rain  🌧";
  } else if (weatherCode == 71 || weatherCode == 73 || weatherCode == 75) {
    elem.textContent = "Snow  ❄";
  } else if (weatherCode == 80 || weatherCode == 81 || weatherCode == 82) {
    elem.textContent = "Rain showers  🌦";
  } else if (weatherCode == 95) {
    getElementById.textContent = "Thunderstorm  ⛈";
  }
};

//Fetch Weather Data Handler
let fetchWeatherData = async (longitude, lat) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`,
    );
    const weather = await response.json();
    return weather;
  } catch (err) {
    console.log(err);
  }
};

let showError = (elem, message, opacity) => {
  elem.innerText = message;
  elem.style.display = "block";
  elem.style.opacity = opacity;
};
