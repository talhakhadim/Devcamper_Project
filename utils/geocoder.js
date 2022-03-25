const NodeGeoCoder = require("node-geocoder")
const options = {
  provider: "mapquest",
  httpAdapter: "https",

  apiKey: "yeLZyxGgAMr8kt9HcfvmB6RqdzYchm6r",
  formatter: null,
}
const geocoder = NodeGeoCoder(options)
module.exports = geocoder
