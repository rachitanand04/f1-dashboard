$("document").ready(() => {
    var response;
  $(".select.year").on("change", async function(){
    const tracks = [];
    const year = $(this).val();
    try{
        response = await axios.get("https://api.openf1.org/v1/sessions?year="+year);
        const result = response.data;

        const circuitSelect = $(".select.circuit");
        circuitSelect.empty();
        circuitSelect.append(`<option value="">Circuit</option>`);
        result.forEach((session)=>{
            var shortName = session.circuit_short_name;
            if(!tracks.includes(shortName)){
                circuitSelect.append(`<option value="${session.circuit_short_name}">${session.circuit_short_name}</option>`);
                tracks.push(shortName);
            }
        })
    }catch(error){
        console.log(error.response.data);
    }
  });

  $(".select.circuit").on("change", async function(){
    const circuit = $(this).val();
    console.log(circuit);
    const data = response.data;

    const sessionSelect = $(".select.session");
    sessionSelect.empty();
    sessionSelect.append(`<option value="">Session</option>`);
    data.forEach((session)=>{
        if(session.circuit_short_name === circuit){
            sessionSelect.append(`<option value=${session.session_key}>${session.session_name}</option>`);
        }
    })
  })
});
