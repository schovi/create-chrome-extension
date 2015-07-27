console.log(">>Hello world from content scripts<<")

// There we can use Babel features like destructuring
const exampleData = {some: "data", another: {structure: "yay"}}

const {another: {structure: myName}} = exampleData

console.log(`>>Printing destructured constant somethingElse = '${myName}'<<`)
