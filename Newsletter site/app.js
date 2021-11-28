const express = require('express')
const Request = require('request')
const https = require('https')
const { response } = require('express')

const app = express()
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/signup.html")
})

app.post('/', (req, res) => {
    const firstName = req.body.FirstName
    const lastName = req.body.LastName
    const email = req.body.Email
    const data = {
        members: [
            {
                email_address:email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    }

    const jsonData = JSON.stringify(data)
    const url =  process.env.URL
    const options = {
        method: "POST",
        auth: process.env.AUTH
    }


    const request = https.request(url, options, response => {

        if (response.statusCode === 200){
            res.sendFile(__dirname + "/success.html")
        }else{
            res.sendFile(__dirname + "/failure.html")
        }

        response.on("data", data => {
            console.log(JSON.parse(data))
        })
    })

    request.write(jsonData)

    request.end()

})

app.post("/failure",(req, res) => {
    res.redirect('/')
})

app.listen(process.env.PORT || 3000 , () => {
    console.log('Listen on port 3000')
})
