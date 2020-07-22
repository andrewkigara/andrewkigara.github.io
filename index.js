// Set the date we're counting down to
var countDownDate = new Date("Jul 31, 2020 23:59:59").getTime();

// Update the count down every 1 second
var x = setInterval(function() {

  // Get today's date and time
  var now = new Date().getTime();
    
  // Find the remainder between now and the count down date
  var remainder = countDownDate - now;
    
  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(remainder / (1000 * 60 * 60 * 24));
  var hours = Math.floor((remainder % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((remainder % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((remainder % (1000 * 60)) / 1000);
    
  // Output the result in an element with id="demo"
  document.getElementById("timer").innerHTML = days + "days " + hours + "hours "
  + minutes + "minutes " + seconds + "seconds ";
    
  // If the count down is over, write some text 
  if (remainder < 0) {
    clearInterval(x);
    document.getElementById("timer").innerHTML = "refresh broswer...";
  }
}, 1000);
