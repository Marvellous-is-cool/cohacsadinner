// Import necessary modules
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const flash = require("express-flash");
const connection = require("./models/connection");
const path = require("path");
const validator = require("validator");
const cors = require("cors");
const favicon = require("serve-favicon");
require("dotenv").config(); // Load environment variables

const app = express();

// Set the port using an environment variable or default to 3000
const port = process.env.PORT || 3000;

// Configure session middleware
const sessionSecret = process.env.SESSION_SECRET || "keyboard cat";
const sessionExpiration = 1000 * 60 * 60 * 20; // 20 hours
const sessionStore = new MySQLStore(
  {
    createDatabaseTable: true,
    schema: {
      tableName: "sessions",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
    expiration: sessionExpiration,
  },
  connection
);

app.use(
  session({
    key: "keyboard cat",
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: sessionExpiration },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));
app.use(fileUpload({ tempFileDir: "/temp" }));
app.use(express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve the favicon
app.use(favicon(path.join(__dirname, "public", "/images/favicon.ico")));

// Add validator to res.locals
app.use((req, res, next) => {
  res.locals.validator = validator;
  next();
});

app.use(cors()); // Enable CORS

app.use(express.json());

// Use routes from the 'routes' folder
const adminRoutes = require("./routes/adminRoutes/adminContestantRoute");
const clientRoutes = require("./routes/clientRoutes");

// Use other routes as needed
app.use("/", clientRoutes);

// Use the adminContestantRoute with the base path /admin
app.use("/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("suspended");
});

app.use((req, res, next) => {
  res.status(404).render("bye"); // Assuming you have a 404.ejs file in the 'views' folder
});

// Start the server
app.listen(port, () => {
  console.log(`Connected - ${process.env.NODE_ENV || "development"}`);
});
