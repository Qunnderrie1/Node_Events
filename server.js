// Complete Events Exercise
const fs = require("fs");
const http = require("http");
const path = require("path");

const EventMitter = require("events");
const newsletter = new EventMitter();

const port = 3000;


newsletter.on("signup", (contact) => {

    fs.appendFile("./newsletter.csv" , `${contact.name} , ${contact.email}\n`, (err) =>{
        if(err){
            return console.log(err)
        }else{
            console.log(`Added ${contact.name} to the newletter list.`)
        }
    })
})


http.createServer((req, res) => {
    const {method , url} = req;
    let reqBody;
    let chunks = [];
    req.on("data" , (chunk) => chunks.push(chunk))

    req.on("end" , () =>{
        if(url == "/newsletter_signup" && method == "POST"){

            try {
                reqBody = JSON.parse(Buffer.concat(chunks).toString());
            } catch (error) {
                res.writeHead(400 , {"Content-Type" : "application/json"});
                res.write(JSON.stringify({msg: "You did not provide the correct request body details"}));
                res.end();
        }


        newsletter.emit("signup", reqBody);
        res.writeHead(200, {"Content-Type" : "application/json"});
        res.write(JSON.stringify({msg: "Thanks for signing up."}));
        res.end();
        }else if ( (url == "/newsletter_signup" || url == "/") && method == "GET"){

            let filePath = url == "/" ? "./index.html" : "./newslettersignup.html"
            fs.readFile(filePath , (err , contents) =>{
                let response = contents , contentType = "text/html" , status = 200;
                if(err){
                    console.error(err);
                    status = 500;
                    response = "<h1>Server Error</h1>"
                    
                }
                res.writeHead(status , { "Content-Type" : contentType});
                res.write(response);
                res.end();
            })
        } else if (url == "/api/newsletter" && method == "GET") {
            fs.readFile("./newsletter.csv" , (err , contents) => {

                if(err){
                    res.writeHead(500, { "Content-Type" : "application/json"});
                res.write(JSON.stringify({msg: "Server failed to read newsletter file." }));
                res.end();
                }else{
                    // Parse string to json
                    let list = contents.toString().split("\n").map((record) => {
                        let [name , email] = record.split(",");
                        return { name, email };

                    }) ;

                res.writeHead(200 , { "Content-Type" : "text/html"});
                res.write(JSON.stringify(list));
                res.end();

                }
            
            })
        }
        else{
            res.writeHead(404 , {"Content-Type" : "text/html"});
            res.write("<h1>404 PAGE NOT FOUND</h1>");
            res.end();
        }
    })

}).listen(port , () => {
    console.log(`Server is running on port ${port}`)
})







