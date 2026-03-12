import express from "express";
import axios, { Axios } from "axios";
import bodyParser from "body-parser";

const API_URL = "https://api.openf1.org/v1";
var session_key;
var session_type;
var number_of_laps;

const app = express();
const port = 3000;
const delay = ms => new Promise(r => setTimeout(r, ms));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/", async (req, res) => {
  try {
    session_key = req.body.session;
    const sessionResponse = await axios.get(
      `${API_URL}/sessions?session_key=${session_key}`,
    );
    await delay(350);
    const sessionData = sessionResponse.data;
    session_type = sessionData[0].session_type;

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
    await delay(350);
    const meetingData = meetingResponse.data;

    const sessionResultResponse = await axios.get(
      `${API_URL}/session_result?session_key=${session_key}`,
    );
    await delay(350);
    const sessionResultData = sessionResultResponse.data;
    number_of_laps = sessionResultData[0].number_of_laps;
    sessionResultData.forEach((item)=>{
      item.duration = formatLapTime(item.duration);
    })

    const driverResponse = await axios.get(
      `${API_URL}/drivers?session_key=${session_key}`,
    );
    await delay(350);
    const driverData = driverResponse.data;

    res.render("index.ejs", {
      session: sessionData[0],
      meetingInfo: meetingData[0],
      sessionResult: sessionResultData,
      driver: driverData,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
  }
});

app.post("/graph",async(req,res)=>{
  try{
    const driver = req.body.driver;
    const lapsResponse = await axios.get(`${API_URL}/laps?session_key=${session_key}&driver_number=${driver}`);
    const pitsResponse = await axios.get(`${API_URL}/pit?session_key=${session_key}&driver_number=${driver}`);
    res.status(200).json({
      session_type: session_type,
      number_of_laps: number_of_laps,
      laps: lapsResponse.data,
      pits: pitsResponse.data,
      driver: driver
    });
  }catch(error){
    console.log(error.response?.data || error.message);
    res.status(500).json({
    error: true,
    message: error.message,
    details: error.response?.data || null
  });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function formatLapTime(time) {
  if(Array.isArray(time)){
    var modifiedArray = [];
    time.forEach((lap)=>{
    const minutes = Math.floor(lap / 60);
    const seconds = Math.floor(lap % 60);
    const milliseconds = Math.round((lap % 1) * 1000);

    modifiedArray.push(`${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}:${String(milliseconds).padStart(3,'0')}`);
    });
  }else{
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.round((time % 1) * 1000);
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}:${String(milliseconds).padStart(3,'0')}`;
  }
  return modifiedArray;
}
