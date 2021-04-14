let db;
//create new db request for budget database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    //create object and store called "pending" and set the autoIncrement to true.
    const db = event.target.result;

    //ched if app is online before reading from DB
    if (navigator.online) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("problem" + event.target.errorCode);
};

function saveRecord(record) {
    //create a transaction on teh pending db with readwrite access
    let transaction = db.transaction(["pending"], "readwrite");

    //access your pending object
    let store = transaction.objectStore("pending");
    //add record to your stored with add method
    store.add(record);
};

function checkDatabase() {
    //open a transaction on your pending db 
    let transaction = db.transaction(["pending"], "rewrite");
    //access your pending object store
    let store = transaction.objectStore("pending");
    //get all records that are stored and set to a variable
    let getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "content-type": "application/json"
                }
            })
            .then((response) => response.json())
            .then(() => {
                //if successful,open a transaction on your pending db
                let transaction = db.transaction(["pending"], "rewrite");

                //access pending object store
                let store = transaction.objectStore("pending");

                //clear all items stored
                store.clear();
            });
        }
    };
}
//listen for app coming back Online
window.addEventListener("online", checkDatabase);