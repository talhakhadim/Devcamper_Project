const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");
const Bootcamp = require("./models/Bootcamp");

const Course = require("./models/Course");
const User = require("./models/User");
//load env vars
dotenv.config({ path: "./config/config.env" });

//connect to databases

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//read fro the file
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
//read courses file
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);
//read users file
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);

//impoer data to database

const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    console.log("Data Imported".green.inverse);

    process.exit();
  } catch (err) {
    console.error(err);
  }
};

//delete data fro the database

const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    console.log("Data Deleted".red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

//pass the argument to import or delete data
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
