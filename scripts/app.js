// const apiKey = "a07f40e671c544d52a44d395ff81cacf";
// URL used for getting data for the city of London, used as an example when the app is loaded
// const entryUrl = "https://api.openweathermap.org/data/2.5/weather?lat=51.5098&lon=-0.1180&appid=" + apiKey;
const entryUrl = "https://rad-weather-forecast.herokuapp.com/owm/data/2.5/weather?lat=51.5098&lon=-0.1180";
// base URL for getting weather data
// const baseUrl = "https://api.openweathermap.org/data/2.5/weather?";
const baseUrl = "https://rad-weather-forecast.herokuapp.com/owm/data/2.5/weather?";
// base URL for getting location data
const geoUrl = "https://rad-weather-forecast.herokuapp.com/owm/geo/1.0/direct?q=";
// URL used for getting the list of cities
const cityList = 'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';

const cityField = document.querySelector(".search");
const suggestions = document.querySelector("#suggestions");
const weatherDiv = document.querySelector("#weather");


// Handeling the search box
const cities = [];

fetch(cityList)
    .then(blob => blob.json())
    .then(data => cities.push(...data))

const findMatches = function(wordToMatch, cities) {
    return cities.filter(place => {
        const regex = new RegExp(wordToMatch, 'gi');
        return place.city.match(regex);
    });
};

const displayMatches = function() {
    const matchArray = findMatches(this.value, cities);
    const html = matchArray.map(place => {
        const regex = new RegExp(this.value, 'gi');
        const cityName = place.city.replace(regex, `<span class="highlight">
        ${this.value}</span>`);
        return `
            <li>
                <span class="name">${cityName}</span>
            </li>
        `
    }).join('');
    suggestions.innerHTML = html;
};

const removeMatches = function(e) {
    if(cityField.value.length === 0) {
        const html = `
        <li>
            <span class="name">Filter for a city</span>
        </li>
        `;
        suggestions.innerHTML = html;
    }
};

// Handeling the box with weather data
const updateWeatherUISuccess = function(data) {
    const dataObj = JSON.parse(data);
    const weatherFragment = `
        <p id="city-name">${dataObj.name}</p>
        <p id="temp">${tempToF(dataObj.main.temp)} &degC</p>
        <div id="desc_box">
            <p id="description">${dataObj.weather[0].description}</p>
        </div>
        <p id="minmax">
           min ${tempToF(dataObj.main.temp_min)} &degC / 
           max ${tempToF(dataObj.main.temp_max)} &degC
        </p> 
    `
    weatherDiv.innerHTML = weatherFragment;
}

const updateWeatherUIError = function() {
    const weatherFragment = `
        <p>
        Invalid city name
        </p>
    `
    weatherDiv.innerHTML = weatherFragment;
}

const responseMethod = function(httpRequest, success, fail) {
    if(httpRequest.readyState === 4) {
        if(httpRequest.status === 200) {
            success(httpRequest.responseText);
        } else {
            fail(httpRequest.status + ": " + httpRequest.responseText);
        } 
    }
};

const createRequest = function(url, success, fail) {
    const httpRequest = new XMLHttpRequest(url);
    httpRequest.addEventListener("readystatechange", (url) => 
        responseMethod(httpRequest, success, fail));
    httpRequest.open('GET', url);
    httpRequest.send();
};

const getHttpResponse = function(url) {
    console.log(url);
    const httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", url, false);
    httpRequest.send(); 
    return httpRequest.responseText;
}

const getLatitude = function(city) {
    const url = geoUrl + city + "&limit=5";
    const dataObj = JSON.parse(getHttpResponse(url));
    if(dataObj.length === 0) {
        updateWeatherUIError();
    }
    lat = dataObj[0].lat;
    return lat;
};

const getLongitude = function(city) {
    const url = geoUrl + city + "&limit=5";
    const dataObj = JSON.parse(getHttpResponse(url));
    if(dataObj.length === 0) {
        updateWeatherUIError();
    }
    lon = dataObj[0].lon;
    return lon;
};

const checkCompletion = function() {
    if(cityField.value !== "") {
        const city = cityField.value;
        const lat = getLatitude(city);
        const lon = getLongitude(city);
        const url = baseUrl + 
            "lat=" + lat + 
            "&lon=" + lon;
            // "&appid=" + apiKey amended by Heroku;
        createRequest(url, updateWeatherUISuccess, updateWeatherUIError);
    } else {
        console.log("Error");
    }
};

// Additional functions
function tempToF(kelvin) {
    return (kelvin - 273.15).toFixed(0);
};

// Event Listeners
cityField.addEventListener("keyup", displayMatches);
cityField.addEventListener("blur", checkCompletion);
cityField.addEventListener("keyup", removeMatches);

createRequest(entryUrl, updateWeatherUISuccess, updateWeatherUIError);