import express from "express";
import axios, { Axios } from "axios";
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
    const session_key = req.body.session;
    const sessionResponse = await axios.get(
      `${API_URL}/sessions?session_key=${session_key}`,
    );
    const sessionData = sessionResponse.data;

    const rawDate = sessionData[0].date_start;
    const formattedDate = new Date(rawDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    sessionData[0].date_start = formattedDate;

    const meetingResponse = await axios.get(
      `${API_URL}/meetings?meeting_key=${sessionData[0].meeting_key}&year=${req.body.year}`,
    );
    const meetingData = meetingResponse.data;

    const sessionResultResponse = await axios.get(
      `${API_URL}/session_result?session_key=${session_key}`,
    );
    const sessionResultData = sessionResultResponse.data;
    // console.log(sessionResultData);
    // console.log(sessionData);
    res.render("index.ejs", {
      session: sessionData[0],
      meetingInfo: meetingData[0],
      sessionResult: sessionResultData,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
