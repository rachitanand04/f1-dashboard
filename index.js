import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const API_URL = "https://api.openf1.org/v1";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/", async (req, res) => {
  try {
    const sessionResponse = await axios.get(
      `${API_URL}/sessions?session_key=${req.body.session}`,
    );
    const sessionData = sessionResponse.data;

    const meetingResponse = await axios.get(
      `${API_URL}/meetings?circuit_key=${sessionData[0].circuit_key}&year=${req.body.year}`,
    );
    const meetingData = meetingResponse.data;

    // const imageURL = meetingData[0].circuit_image;
    // console.log(imageURL);

    res.render("index.ejs", {
      meetingInfo: meetingData[0],
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
