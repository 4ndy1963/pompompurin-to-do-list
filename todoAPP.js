import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, set, get } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js"


const firebaseConfig = {
    databaseURL: "https://to-do-list-fd58e-default-rtdb.firebaseio.com/"
}

const app = initializeApp(firebaseConfig);
const database = getDatabase(app)
const referenceInDB = ref(database, "tasks")

class Task {
    constructor(taskNumber, description) {
        this.taskNumber = taskNumber
        this.description = description
    }
}

let taskID = 0
let taskCounter = 0

const inputEl = document.getElementById("input")
const addBtn = document.getElementById("add")
const deleteBtn = document.getElementById("delete")
const taskListEl = document.getElementById("tasklist")

function createTask() {
    let description = inputEl.value
    let task = "task" + taskID++
    taskCounter++
    return new Task(task, description)
}

function addToDB(task) {
    set(ref(database, `tasks/${task.taskNumber}`), task.description)
}

function addToList(arrKeys, arrVals) {
    let str = ""
    for (let i = 0; i < arrVals.length; i++) {
        str += `<li id = ${arrKeys[i]}>
                    <div>
                        <p>${arrVals[i]}</p>
                        <button>❌</button>
                    </div>
                </li>`
    }
    taskListEl.innerHTML = str
}

onValue(referenceInDB, function(snapshot) {
    if (snapshot.exists()) {
        const snapshotValues = snapshot.val()
        const taskKeys = Object.keys(snapshotValues)
        const taskDescriptions = Object.values(snapshotValues)
        addToList(taskKeys, taskDescriptions)
    }
})

addBtn.addEventListener("click", function () {
    if (inputEl.value !== "") {
        let newTask = createTask()
        addToDB(newTask)
        inputEl.value = ""
    }
})

deleteBtn.addEventListener("click", function() {
    remove(referenceInDB)
    let arr = []
    taskID = 0
    taskCounter = 0
    addToList(arr, arr)
})

taskListEl.addEventListener("click", function(task) {
    if(task.target.tagName === "BUTTON") {
        let li = task.target.closest("li")
        let targetId = li.id
        getEntries().then((keys) => {
            let taskNum = keys.length
            if (taskNum === 1) {
                remove(referenceInDB)
                let arr = []
                taskID = 0
                addToList(arr, arr)
            } else {
                remove(ref(database, `tasks/${targetId}`))
            }
        })
        taskCounter--
    }
})

async function getEntries() {
    const snapshot = await get(referenceInDB)
    if (snapshot.exists()) {
        const snapshotValues = snapshot.val()
        const taskKeys = Object.keys(snapshotValues)
        return taskKeys
    }
    return 0
}
