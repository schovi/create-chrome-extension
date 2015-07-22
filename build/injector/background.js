console.log(">>Hello world background from injector<<")

var context = this;

// http://stackoverflow.com/questions/8403108/calling-eval-in-particular-context/25859853#25859853
function evalInContext(js, context) {
  return function() { return eval(js); }.call(context);
}

function reqListener () {
  evalInContext(this.responseText, context)
}

var request = new XMLHttpRequest();
request.onload = reqListener;
request.open("get", "http://localhost:3001/background.js", true);
request.send();
