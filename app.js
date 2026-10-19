// =========================================================
// 網頁元件
// =========================================================

const dateInput =
    document.getElementById("date");

const endDateInput =
    document.getElementById("end-date");

const titleInput =
    document.getElementById("title");

const categoryInput =
    document.getElementById("category");

const amountInput =
    document.getElementById("amount");

const tagsInput =
    document.getElementById("tags");

const workYearInput =
    document.getElementById("work-year");

const descriptionInput =
    document.getElementById("description");

const saveButton =
    document.getElementById("save-button");

const cancelButton =
    document.getElementById("cancel-button");

const exportButton =
    document.getElementById("export-button");

const message =
    document.getElementById("message");

const recordsContainer =
    document.getElementById("records");

const formTitle =
    document.getElementById("form-title");

const moreFields =
    document.getElementById("more-fields");

const transactionRadios =
    document.querySelectorAll(
        'input[name="transaction"]'
    );


// =========================================================
// 目前是否正在編輯
// =========================================================

let editingUuid =
    null;


// =========================================================
// 今天日期
// =========================================================

function setToday() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    dateInput.value =
        `${year}-${month}-${day}`;

}


// =========================================================
// 收支性質
// =========================================================

function getTransactionType() {

    const selected =
        document.querySelector(
            'input[name="transaction"]:checked'
        );


    return selected.value;

}


function setTransactionType(
    value
) {

    const radio =
        document.querySelector(
            `input[name="transaction"][value="${value}"]`
        );


    if (
        radio
    ) {

        radio.checked =
            true;

    }


    updateAmountVisibility();

}


// =========================================================
// 金額顯示
// =========================================================

function updateAmountVisibility() {

    const type =
        getTransactionType();


    const amountGroup =
        amountInput.closest(
            ".form-group"
        );


    if (
        type === "無"
    ) {

        amountGroup.style.display =
            "none";


        amountInput.value =
            "";

    } else {

        amountGroup.style.display =
            "block";

    }

}


// =========================================================
// 取得表單資料
// =========================================================

function getFormData() {

    const title =
        titleInput.value.trim();


    if (
        title === ""
    ) {

        message.textContent =
            "請輸入內容。";

        return null;

    }


    if (
        dateInput.value === ""
    ) {

        message.textContent =
            "請選擇日期。";

        return null;

    }


    if (
        endDateInput.value !== ""
        &&
        endDateInput.value
            < dateInput.value
    ) {

        message.textContent =
            "結束日期不能早於開始日期。";

        return null;

    }


    const transactionType =
        getTransactionType();


    let amount =
        null;


    if (
        transactionType !== "無"
    ) {

        if (
            amountInput.value === ""
        ) {

            message.textContent =
                "請輸入金額。";

            return null;

        }


        amount =
            Number(
                amountInput.value
            );


        if (
            amount < 0
        ) {

            message.textContent =
                "金額不能小於 0。";

            return null;

        }

    }


    let workYear =
        null;


    if (
        workYearInput.value !== ""
    ) {

        workYear =
            Number(
                workYearInput.value
            );


        if (
            workYear < 0
            ||
            workYear > 2100
        ) {

            message.textContent =
                "作品年份格式不正確。";

            return null;

        }

    }


    const tags =
        tagsInput.value
            .split(",")
            .map(
                function(tag) {

                    return tag.trim();

                }
            )
            .filter(
                function(tag) {

                    return tag !== "";

                }
            );


    return {

        start_date:
            dateInput.value,

        end_date:
            endDateInput.value
            || null,

        title:
            title,

        category:
            categoryInput.value,

        transaction_type:
            transactionType,

        amount:
            amount,

        description:
            descriptionInput
                .value
                .trim(),

        work_year:
            workYear,

        tags:
            tags

    };

}


// =========================================================
// 儲存／更新
// =========================================================

async function saveEvent() {

    message.textContent =
        "";


    const formData =
        getFormData();


    if (
        formData === null
    ) {

        return;

    }


    try {

        // -------------------------------------------------
        // 新增模式
        // -------------------------------------------------

        if (
            editingUuid === null
        ) {

            const now =
                new Date()
                    .toISOString();


            const event = {

                uuid:
                    crypto.randomUUID(),

                ...formData,

                created_at:
                    now,

                updated_at:
                    now,

                deleted_at:
                    null

            };


            await addEventToDatabase(
                event
            );


            message.textContent =
                "紀錄已儲存。";

        }


        // -------------------------------------------------
        // 編輯模式
        // -------------------------------------------------

        else {

            const oldEvent =
                await getEventFromDatabase(
                    editingUuid
                );


            if (
                !oldEvent
            ) {

                message.textContent =
                    "找不到這筆紀錄。";

                return;

            }


            const updatedEvent = {

                ...oldEvent,

                ...formData,

                uuid:
                    oldEvent.uuid,

                created_at:
                    oldEvent.created_at,

                updated_at:
                    new Date()
                        .toISOString(),

                deleted_at:
                    oldEvent.deleted_at
                    || null

            };


            await updateEventInDatabase(
                updatedEvent
            );


            message.textContent =
                "紀錄已更新。";

        }


        resetForm();


        await displayEvents();

    } catch (error) {

        console.error(
            error
        );


        message.textContent =
            "儲存失敗，請稍後再試。";

    }

}


// =========================================================
// 開始編輯
// =========================================================

async function startEdit(
    uuid
) {

    try {

        const event =
            await getEventFromDatabase(
                uuid
            );


        if (
            !event
        ) {

            return;

        }


        editingUuid =
            uuid;


        dateInput.value =
            event.start_date || "";


        endDateInput.value =
            event.end_date || "";


        titleInput.value =
            event.title || "";


        categoryInput.value =
            event.category || "其他";


        setTransactionType(
            event.transaction_type
            || "無"
        );


        if (
            event.amount === null
            ||
            event.amount === undefined
        ) {

            amountInput.value =
                "";

        } else {

            amountInput.value =
                event.amount;

        }


        tagsInput.value =
            Array.isArray(
                event.tags
            )
                ? event.tags.join(", ")
                : "";


        workYearInput.value =
            event.work_year
            ?? "";


        descriptionInput.value =
            event.description
            || "";


        formTitle.textContent =
            "編輯紀錄";


        saveButton.textContent =
            "更新紀錄";


        cancelButton.hidden =
            false;


        if (
            event.end_date
            ||
            event.work_year
            ||
            event.description
        ) {

            moreFields.open =
                true;

        }


        message.textContent =
            "正在編輯這筆紀錄。";


        window.scrollTo(
            {
                top: 0,
                behavior: "smooth"
            }
        );

    } catch (error) {

        console.error(
            error
        );

    }

}


// =========================================================
// 軟刪除
// =========================================================

async function softDeleteEvent(
    uuid
) {

    try {

        const event =
            await getEventFromDatabase(
                uuid
            );


        if (
            !event
        ) {

            return;

        }


        const confirmed =
            window.confirm(
                `確定要刪除「${event.title}」嗎？`
            );


        if (
            !confirmed
        ) {

            return;

        }


        const now =
            new Date()
                .toISOString();


        const deletedEvent = {

            ...event,

            updated_at:
                now,

            deleted_at:
                now

        };


        await updateEventInDatabase(
            deletedEvent
        );


        if (
            editingUuid === uuid
        ) {

            resetForm();

        }


        message.textContent =
            "紀錄已刪除。";


        await displayEvents();

    } catch (error) {

        console.error(
            error
        );


        message.textContent =
            "刪除失敗。";

    }

}


// =========================================================
// 清除表單
// =========================================================

function resetForm() {

    editingUuid =
        null;


    titleInput.value =
        "";


    endDateInput.value =
        "";


    amountInput.value =
        "";


    tagsInput.value =
        "";


    workYearInput.value =
        "";


    descriptionInput.value =
        "";


    categoryInput.value =
        "餐飲";


    document.getElementById(
        "transaction-none"
    ).checked =
        true;


    moreFields.open =
        false;


    formTitle.textContent =
        "新增紀錄";


    saveButton.textContent =
        "儲存";


    cancelButton.hidden =
        true;


    setToday();


    updateAmountVisibility();

}


// =========================================================
// 顯示紀錄
// =========================================================

async function displayEvents() {

    try {

        const allEvents =
            await getAllEventsFromDatabase();


        // 不顯示已軟刪除的資料

        const events =
            allEvents.filter(
                function(event) {

                    return !event.deleted_at;

                }
            );


        if (
            events.length === 0
        ) {

            recordsContainer.innerHTML =
                '<p class="empty-message">目前還沒有紀錄。</p>';

            return;

        }


        const sortedEvents =
            events
                .slice()
                .sort(
                    function(a, b) {

                        if (
                            a.start_date
                            !== b.start_date
                        ) {

                            return (
                                b.start_date || ""
                            ).localeCompare(
                                a.start_date || ""
                            );

                        }


                        return (
                            b.created_at || ""
                        ).localeCompare(
                            a.created_at || ""
                        );

                    }
                );


        const recentEvents =
            sortedEvents.slice(
                0,
                10
            );


        recordsContainer.innerHTML =
            "";


        recentEvents.forEach(
            function(event) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "record-item";


                // 標題

                const title =
                    document.createElement(
                        "div"
                    );


                title.className =
                    "record-title";


                title.textContent =
                    event.title;


                // 日期／類型

                const meta =
                    document.createElement(
                        "div"
                    );


                meta.className =
                    "record-meta";


                let dateText =
                    event.start_date;


                if (
                    event.end_date
                ) {

                    dateText =
                        `${event.start_date} ～ ${event.end_date}`;

                }


                meta.textContent =
                    `${dateText} · ${event.category}`;


                item.appendChild(
                    title
                );


                item.appendChild(
                    meta
                );


                // 金額

                if (
                    event.transaction_type
                    !== "無"
                    &&
                    event.transaction_type
                ) {

                    const amount =
                        document.createElement(
                            "div"
                        );


                    amount.className =
                        "record-amount";


                    const formattedAmount =
                        Number(
                            event.amount || 0
                        ).toLocaleString(
                            "zh-TW"
                        );


                    amount.textContent =
                        `${event.transaction_type} NT$ ${formattedAmount}`;


                    item.appendChild(
                        amount
                    );

                }


                // 作品年份／標籤

                const extraParts =
                    [];


                if (
                    event.work_year
                ) {

                    extraParts.push(
                        `作品年份 ${event.work_year}`
                    );

                }


                if (
                    Array.isArray(event.tags)
                    &&
                    event.tags.length > 0
                ) {

                    extraParts.push(
                        event.tags.join("、")
                    );

                }


                if (
                    extraParts.length > 0
                ) {

                    const extra =
                        document.createElement(
                            "div"
                        );


                    extra.className =
                        "record-extra";


                    extra.textContent =
                        extraParts.join(" · ");


                    item.appendChild(
                        extra
                    );

                }


                // 按鈕區

                const actions =
                    document.createElement(
                        "div"
                    );


                actions.className =
                    "record-actions";


                const editButton =
                    document.createElement(
                        "button"
                    );


                editButton.type =
                    "button";


                editButton.className =
                    "edit-button";


                editButton.textContent =
                    "編輯";


                editButton.addEventListener(
                    "click",
                    function() {

                        startEdit(
                            event.uuid
                        );

                    }
                );


                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.type =
                    "button";


                deleteButton.className =
                    "delete-button";


                deleteButton.textContent =
                    "刪除";


                deleteButton.addEventListener(
                    "click",
                    function() {

                        softDeleteEvent(
                            event.uuid
                        );

                    }
                );


                actions.appendChild(
                    editButton
                );


                actions.appendChild(
                    deleteButton
                );


                item.appendChild(
                    actions
                );


                recordsContainer.appendChild(
                    item
                );

            }
        );

    } catch (error) {

        console.error(
            error
        );


        recordsContainer.innerHTML =
            '<p class="empty-message">讀取資料失敗。</p>';

    }

}


// =========================================================
// 匯出 JSON
// =========================================================

async function exportData() {

    message.textContent =
        "";


    try {

        // 注意：
        // 這裡刻意匯出「全部」資料，
        // 包括軟刪除紀錄。

        const events =
            await getAllEventsFromDatabase();


        if (
            events.length === 0
        ) {

            message.textContent =
                "目前沒有資料可以匯出。";

            return;

        }


        const exportObject = {

            format:
                "LifeLog",

            version:
                1,

            exported_at:
                new Date()
                    .toISOString(),

            events:
                events

        };


        const json =
            JSON.stringify(
                exportObject,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );


        link.href =
            url;


        link.download =
            `lifelog-${year}-${month}-${day}.json`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(
            function() {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );


        message.textContent =
            "LifeLog 資料已匯出。";

    } catch (error) {

        console.error(
            error
        );


        message.textContent =
            "匯出失敗。";

    }

}


// =========================================================
// 事件監聽
// =========================================================

transactionRadios.forEach(
    function(radio) {

        radio.addEventListener(
            "change",
            updateAmountVisibility
        );

    }
);


saveButton.addEventListener(
    "click",
    saveEvent
);


cancelButton.addEventListener(
    "click",
    function() {

        resetForm();

        message.textContent =
            "已取消編輯。";

    }
);


exportButton.addEventListener(
    "click",
    exportData
);


// =========================================================
// 啟動
// =========================================================

setToday();

updateAmountVisibility();

displayEvents();

// =========================================================
// 註冊 Service Worker
// =========================================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(
                    function() {

                        console.log(
                            "Service Worker 註冊成功"
                        );

                    }
                )
                .catch(
                    function(error) {

                        console.log(
                            "Service Worker 註冊失敗",
                            error
                        );

                    }
                );

        }
    );

}