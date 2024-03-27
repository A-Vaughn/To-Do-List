import express from 'express'
import {PORT, mongoDbUrl} from './config.js'
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb"

const app = express()
app.use(express.json())





const client = new MongoClient(mongoDbUrl,  {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const toDoListDB = client.db("toDoList")
const toDoList = toDoListDB.collection("listCollection")

app.listen(PORT, ()=> {
    console.log(`Server started on port ${PORT}`)
})


app.get('/', (req, res)=>{
    
    return res.status(202).send("<h1>To Do list App Backend.</h1>")
})

app.get('/list/public', (req, res)=>{
    //route to show all public tasks

    const data = req.params

    const filter = {
        "visibility" : "public"
    }

    toDoList.find(filter).toArray()
    .then(response=>{
        res.status(200).send(response)
    })
    .catch(err=>console.log(err))

})

app.get('/list/private', (req, res)=>{
    //route to show all private tasks

    const data = req.params

    const filter = {
        "visibility" : "private"
    }

    toDoList.find(filter).toArray()
    .then(response=>{
        res.status(200).send(response)
    })
    .catch(err=>console.log(err))

})

app.get('/list/public/ascending', (req, res)=>{
    // Route to show all public tasks in ascending order by due date

    const data = req.params;

    const filter = {
        "visibility" : "public"
    }

    // Sort criteria to sort by dueDate in ascending order
    const sortCriteria = { dueDate: 1 };

    toDoList.find(filter).sort(sortCriteria).toArray()
    .then(response=>{
        res.status(200).send(response);
    })
    .catch(err=>console.log(err));
});


app.get('/list/private/ascending', (req, res)=>{
    // Route to show all private tasks in ascending order by due date

    const data = req.params;

    const filter = {
        "visibility" : "private"
    }

    // Sort criteria to sort by dueDate in ascending order
    const sortCriteria = { dueDate: 1 };

    toDoList.find(filter).sort(sortCriteria).toArray()
    .then(response=>{
        res.status(200).send(response);
    })
    .catch(err=>console.log(err));
});


app.get('/list/public/descending', (req, res)=>{
    // Route to show all public tasks in descending order by due date

    const data = req.params;

    const filter = {
        "visibility" : "public"
    }

    // Sort criteria to sort by dueDate in descending order
    const sortCriteria = { dueDate: -1 };

    toDoList.find(filter).sort(sortCriteria).toArray()
    .then(response=>{
        res.status(200).send(response);
    })
    .catch(err=>console.log(err));
});

app.get('/list/private/descending', (req, res)=>{
    // Route to show all private tasks in descending order by due date

    const data = req.params;

    const filter = {
        "visibility" : "private"
    }

    // Sort criteria to sort by dueDate in descending order
    const sortCriteria = { dueDate: -1 };

    toDoList.find(filter).sort(sortCriteria).toArray()
    .then(response=>{
        res.status(200).send(response);
    })
    .catch(err=>console.log(err));
});


app.get('/list/public/completed', (req, res)=>{
    // Route to show all public completed tasks

    const data = req.params;

    const filter = {
        "status" : "completed",
        "visibility" : "public"
    }

    toDoList.find(filter).toArray()
    .then(response=>{
        res.status(200).send(response)
    })
    .catch(err=>console.log(err))
});

app.get('/list/private/completed', (req, res)=>{
    // Route to show all private completed tasks

    const data = req.params;

    const filter = {
        "status" : "completed",
        "visibility" : "private"
    }

    toDoList.find(filter).toArray()
    .then(response=>{
        res.status(200).send(response)
    })
    .catch(err=>console.log(err))
});


app.get('/list/:id/status', (req, res)=>{
    // route show a specific task status
    const data = req.params
    const filter = {
        "_id" : new ObjectId(data.id) 
    }
    toDoList.findOne(filter)
    .then(response=>{
        res.status(200).send(response.status)
    })
    .catch(err=>console.log(err))
    
})

app.post('/admin/savetask', (req, res)=>{
    //route adds a new task

    //dueDate format : YYYY-MM-DD
    const dueDateRegex = /^\d{4}-\d{2}-\d{2}$/;

    const data = req.body

    if (!data.description)
        return res.status(400).send("No description found")

    if (data.description.length > 160){
        return res.status(400).send("Max length is 160 characters")
    }

    if (!data.visibility)
        return res.status(400).send("No visibility found")

    if (data.visibility != "public" && data.visibility != "private")
        return res.status(400).send("Visibility is either public or private")
    

    if (!data.status)
        return res.status(400).send("No status found")

    if (data.status != "completed" && data.status != "to be completed")
        return res.status(400).send("Status is either completed or to be completed")
    
    if (!data.dueDate)
    return res.status(400).send("No due date found")

    if (!dueDateRegex.test(data.dueDate)) {
        return res.status(400).send("Invalid date format. Please use YYYY-MM-DD format.");
    }

    data.dueDate = new Date(data.dueDate);


    toDoList.insertOne(data)
    .then(response=>{
        return res.status(201).send(JSON.stringify(response))
    })
    .catch(err=>console.log(err))

})

app.delete('/admin/remove/:id', (req, res)=>{
    //remove a specific task
    const data = req.params

    const filter = {
        "_id" : new ObjectId(data.id) 
    }
    toDoList.deleteOne(filter)
    .then(response=>{
        res.status(200).send(response)
    })
    .catch(err=>console.log(err))

})

app.put('/admin/update/:id/status', (req, res)=>{
    //update a specific task's status
    const data = req.params
    const docData = req.body
    const filter = {
        "_id" : new ObjectId(data.id)
    }

    // Check if any unexpected fields are present in docData
    const allowedFields = ['status'];
    for (const field in docData) {
        if (!allowedFields.includes(field)) {
            return res.status(400).send(`Unexpected field: ${field}`);
        }
    }

    if ((docData.status != 'completed' && docData.status != 'to be completed')) {
        return res.status(400).send("Status can only be updated to 'complete' or 'completed'");
    }


    const upStatus = {
        $set: {
            "status" : docData.status
        }
    }

    toDoList.updateOne(filter, upStatus)
    .then(response =>{
        res.status(200).send(response)
    })
    .catch(err=>console.log(err))

})