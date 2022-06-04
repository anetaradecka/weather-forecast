// URL used for getting data for the city of London, used as an example when the app is loaded
const entryUrl = "https://rad-weather-forecast.herokuapp.com/owm/data/2.5/weather?lat=51.5098&lon=-0.1180";
const baseUrl = "https://rad-weather-forecast.herokuapp.com/owm/data/2.5/weather?";
// base URL for getting location data
const geoUrl = "http://rad-weather-forecast.herokuapp.com/owm/geo/1.0/direct?q=";
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


const updateWeatherUISuccess = function(parsedData) {
    const weatherFragment = `
        <p id="city-name">${parsedData.name}</p>
        <p id="temp">${tempToF(parsedData.main.temp)} &degC</p>
        <div id="desc_box">
            <p id="description">${parsedData.weather[0].description}</p>
        </div>
        <p id="minmax">
           min ${tempToF(parsedData.main.temp_min)} &degC / 
           max ${tempToF(parsedData.main.temp_max)} &degC
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

const handleErrors = function(response) {
    if(!response.ok) {
        throw (response.status + ': ' + response.statusText);
    }

    return response.json();
};

const createRequest = function(url, success, fail) {
    fetch(url)
        .then((response) => handleErrors(response))
        .then((data) => success(data))
        .catch((error) => fail(error));
};

const getHttpResponse = function(url) {
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