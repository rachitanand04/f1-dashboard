import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const API_URL = "https://api.openf1.org/v1";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
    res.render("index.ejs");
});

app.post("/",async(req,res)=>{
    try{
    const response = await axios.get(`${API_URL}/sessions?session_key=${req.body.session}`);
    const data = response.data;
    res.render("index.ejs",{});
    }catch (error){
        console.log(error.response.data);
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

