const express = require("express");
const fileUpload = require("express-fileupload");
const knex = require("knex");
const path = require("path");

const app = express();

app.use(fileUpload());

app.use(
  express.static(path.join(__dirname, "/..", "/Client", "/public", "/uploads"))
);

const sql = knex({
  client: "mysql",
  connection: {
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "imageupload",
  },
});

// Upload Endpoint
app.post("/upload", (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  const file = req.files.file;

  file.mv(`${__dirname}/../Client/public/uploads/${file.name}`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    sql
      .insert({
        Image: file.name,
      })
      .into("images")
      .catch((err) => {
        res.status(400).json(err);
      });

    return res.send({ fileName: file.name, filePath: `/uploads/${file.name}` });
  });
});

// fetch files Endpoint
app.get("/fetch-files", async (req, res) => {
  const files = await sql.select("*").from("images");
  res.status(200).send(files);

  // const selecetedImage = fs.readFileSync(
  //   // `${__dirname}/../Client/public/uploads/${file.name}`
  //   `${__dirname}/../Client/public/uploads/2348159861132_status_1839f97f8f0747d399c513a008751bf3.jpg`
  // );

  // res.send(selecetedImage);
});

app.listen(5000, () => console.log("Server Started..."));
