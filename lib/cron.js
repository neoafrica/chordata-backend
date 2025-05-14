const { CronJob } = require("cron");
const https =  require("https")

const job= new CronJob("*/14 * * * *", function(){
    https.get(process.env.API_URI, (res)=>{
        if(res.statusCode === 200) console.log("Get request sent successfully");
        else console.log("Get request failed", res.statusCode);
    }).on("Error", (e) => console.log("Error while sending a request", e))
})

module.exports= job