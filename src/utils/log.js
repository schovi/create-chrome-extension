import color from 'colors/safe';

export const debug = function(...messages) {
  console.log(...messages)
}

export const pending = function(message) {
  console.log(color.yellow(message))
}

export const success = function(message) {
  console.log(color.green(message))
}

export const error = function(message) {
  console.error(color.red(message))
}

export const done = function() {
  success("Done")
}
