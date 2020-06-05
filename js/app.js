$(document).ready(function() {
  
// --- THIS SECTION DISPLAYS A WEATHER FORECAST FOR THE USER'S CURRENT LOCATION --- //
  
  var lat; 
  var long;

// Get current user geo location from browser //
  
  if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    lat = position.coords.latitude; //assign variable according to structure of the api data 
    long = position.coords.longitude;
  
// As this is an example project using a free weather forecast API, I have prefixed the url with an API which allows cross-origin requests //   
  var geoUrl = "https://cors-anywhere.herokuapp.com/http://api.weatherstack.com/current?access_key=1ebf0499632bf7351df57fe10ad65840&query="+lat+","+long;
    
      $.getJSON(geoUrl, function(data) {
          
          console.log(data);
          const city = data.location.name;
          const country = data.location.country;
          const weather = data.current.weather_descriptions[0];
          const icon = data.current.weather_icons[0];
          const cTemp = data.current.temperature; 
          const fTemp = (cTemp)*(9/5)+32;
          const tempSwitch = $(".temp-switch");
          
          currentWeather();
          
          $(".temp-switch").on("click", convertTemp);
          
          displayCalendar();
        
    // --- FUNCTIONS --- //
    
    // Display current weather at user location //
        function currentWeather() {
          $(".location").html(city + ", " + country);
          $(".description").html(weather);
          $(".icon").html("<img src=" + icon + ">");
          $(".temp").html(cTemp + "&#xb0;C");
          
        }
    
    // Convert Celcius to Farenheit //
        function convertTemp() {
          if ($(this).prop("checked") === true) {
                $(".temp").html(fTemp + "&#xb0;F");
              } else {
                $(".temp").html(cTemp + "&#xb0;C");
              }
        }
        
    // Display forecast calendar //
        function displayCalendar() {
          const forecastDay = data.forecast.forecastday;
          const calendar = $(".calendar");
           
           $.each(forecastDay, function(index, value) {
             calendar.append("<div class='summary'><h3 class='date-title'>" 
                              + value.date + "</h3><img src='" + value.day.condition.icon + "'>" + "<p class='forecast-text'>" 
                              + value.day.condition.text + 
                              "</p></div>");
          });
          calendar[0].firstElementChild.firstChild.innerText = "Today";
        }
            
      }) // end getJSON
      .fail(function(data) {
        console.log("Request Failed: " + data.responseJSON.error.message);
        $(".main-error-msg").text("Sorry, forecast data is currently unavailable! Please refresh the page or try again later.");
      });
    }) // end getCurrentPosition function
  } //end geolocation if statement
  

// --- THIS SECTION DISPLAYS 'QUICK VIEW' LOCAL-TIME/TEMP SUMMARIES FOR SEARCHED LOCATIONS --- //

  const searchBtn = $(".search-btn");
  const searchField = $(".search-field");
  const results = $(".results-container");
  const qvPanel = $(".quick-view");
  const qvErrorMsg = $(".qv-error-msg");
  
  var panelCount = 0;
  
  searchBtn.on("click", showResults);
    
  searchField.on("keypress", function(event) {
    if (event.which == 13) {
          event.preventDefault();
          showResults();
    }
  });
    
  results.on("click", ".close-btn", function() {
    $(this).parent().fadeOut(500, function() {
		$(this).remove();
	})
	  event.stopPropagation();
    panelCount--;
    qvErrorMsg.text("");
  })

// --- FUNCTIONS --- //

// Display 'Quick View' search results //
    function showResults() {
     
      var locationSearch = $(".search-field").val();
      var searchUrl = "https://cors-anywhere.herokuapp.com/http://api.weatherstack.com/current?access_key=1ebf0499632bf7351df57fe10ad65840&query=" + locationSearch;
          
      $.getJSON(searchUrl, function(data) {
        
        var time = data.location.localtime.slice(11);
        const city = data.location.name;
        const cTemp = data.current.temperature; 
        
        if (panelCount <= 4) {
          displayPanel();
          panelCount++;
         
        } else {
          qvErrorMsg.text("Quick View limit reached. Please remove a panel before adding a new one");
        }
        
// Generate and display 'Quick View' panel //        
        function displayPanel() {
            results.prepend("<div class='quick-view'><div class='item'><h3 class='location-title'>" 
                            + city + "</h3><span class='qv-time'>" + time + "</span></div>" 
                            + "<span class='qv-temp item'>" + cTemp + "&#xb0;C</span><i class='fas fa-times close-btn'></i></div>");
                            
            setBgColor($(".quick-view:first-child"));
        }

// Set background colour of element based on forecasted temperature //         
        function setBgColor(el) {
          if (cTemp <= 10) {
              el.css("background-image", "linear-gradient(to right, #757F9A, #D7DDE8)"); 
          } else if (cTemp <= 20) {
              el.css("background-image", "linear-gradient(to right, #78d2ed, #4bb7d8)");
          } else if (cTemp <= 30) {
              el.css("background-image", "linear-gradient(to right, #22c1c3, #fdbb2d)");
          } else {
              el.css("background-image", "linear-gradient(to right, #FDC830, #F37335)");
          }
        }

      }) // end getJSON
      .fail(function() {
        qvErrorMsg.text("No results found");
        console.log("An error was encountered when making the search")
      }); 
      
      $(".search-field").val("");
      
    } // end showResults function //

});