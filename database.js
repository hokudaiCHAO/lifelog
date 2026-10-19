const DB_NAME =
    "LifeLogDB";

const DB_VERSION =
    1;

const STORE_NAME =
    "events";


// =========================================================
// 開啟資料庫
// =========================================================

function openDatabase() {

    return new Promise(
        function(resolve, reject) {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                function(event) {

                    const db =
                        event.target.result;


                    if (
                        !db.objectStoreNames.contains(
                            STORE_NAME
                        )
                    ) {

                        const store =
                            db.createObjectStore(
                                STORE_NAME,
                                {
                                    keyPath:
                                        "uuid"
                                }
                            );


                        store.createIndex(
                            "start_date",
                            "start_date",
                            {
                                unique:
                                    false
                            }
                        );

                    }

                };


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result
                    );

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// =========================================================
// 新增
// =========================================================

async function addEventToDatabase(
    event
) {

    const db =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            store.add(
                event
            );


            transaction.oncomplete =
                function() {

                    db.close();
                    resolve();

                };


            transaction.onerror =
                function(event) {

                    db.close();

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// =========================================================
// 更新
// =========================================================

async function updateEventInDatabase(
    event
) {

    const db =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            store.put(
                event
            );


            transaction.oncomplete =
                function() {

                    db.close();
                    resolve();

                };


            transaction.onerror =
                function(event) {

                    db.close();

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// =========================================================
// 讀取一筆
// =========================================================

async function getEventFromDatabase(
    uuid
) {

    const db =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.get(
                    uuid
                );


            request.onsuccess =
                function() {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };


            transaction.oncomplete =
                function() {

                    db.close();

                };

        }
    );

}


// =========================================================
// 讀取全部
// =========================================================

async function getAllEventsFromDatabase() {

    const db =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                db.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.getAll();


            request.onsuccess =
                function() {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };


            transaction.oncomplete =
                function() {

                    db.close();

                };

        }
    );

}