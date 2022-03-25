const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")
const colors = require("colors")
const path = require("path")
const fileupload = require("express-fileupload")
const cookieParser = require("cookie-parser")
const connectedDB = require("./config/db")
const errorHandler = require("./middleware/error")

const bootcamps = require("./routes/bootcamps")
const courses = require("./routes/courses")
const user = require("./routes/auth")

dotenv.config({ path: "./config/config.env" })

const app = express()

//body parser
app.use(express.json({ extended: false }))
//connect to Database
connectedDB()
//file upload
app.use(fileupload())
app.use(cookieParser())
//set public as a static folder
app.use(express.static(path.join(__dirname, "public")))

//get all bootcamp routes

app.use("/api/v1/bootcamps", bootcamps)

app.use("/api/v1/courses", courses)
app.use("/api/v1/auth", user)
//error handler
app.use(errorHandler)

//Load env vars

PORT = process.env.PORT || 5000

//create server
app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  )
)
