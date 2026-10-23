// =========================================================
// 網頁元件
// =========================================================

const dateInput = document.getElementById("date");
const endDateInput = document.getElementById("end-date");
const titleInput = document.getElementById("title");
const eventOptions = document.getElementById("event-options");
const amountInput = document.getElementById("amount");
const tagsInput = document.getElementById("tags");
const workYearInput = document.getElementById("work-year");
const descriptionInput = document.getElementById("description");

const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");
const exportButton = document.getElementById("export-button");
const importButton =
    document.getElementById(
        "import-button"
    );

const importFile =
    document.getElementById(
        "import-file"
    );

const message = document.getElementById("message");
const recordsContainer = document.getElementById("records");
const formTitle = document.getElementById("form-title");
const moreFields = document.getElementById("more-fields");

const transactionRadios =
    document.querySelectorAll(
        'input[name="transaction"]'
    );


// =========================================================
// 統計元件
// =========================================================

const statisticsPeriod =
    document.getElementById("statistics-period");

const historyStatisticsPeriod =
    document.getElementById(
        "history-statistics-period"
    );

const statisticsYear =
    document.getElementById("statistics-year");

const statisticsMonth =
    document.getElementById("statistics-month");

const customStatisticsPeriod =
    document.getElementById(
        "custom-statistics-period"
    );

const statisticsStartDate =
    document.getElementById(
        "statistics-start-date"
    );

const statisticsEndDate =
    document.getElementById(
        "statistics-end-date"
    );

const statisticsSummaryTitle =
    document.getElementById(
        "statistics-summary-title"
    );

const statisticsFilterSummary =
    document.getElementById(
        "statistics-filter-summary"
    );

const statisticsCount =
    document.getElementById("statistics-count");

const statisticsExpense =
    document.getElementById("statistics-expense");

const statisticsIncome =
    document.getElementById("statistics-income");

const statisticsBalance =
    document.getElementById("statistics-balance");

const eventStatistics =
    document.getElementById("event-statistics");

const tagStatistics =
    document.getElementById("tag-statistics");

const statisticsTagFilters =
    document.getElementById(
        "statistics-tag-filters"
    );

let statisticsTagsExpanded =
    false;

// =========================================================
// 圖表元件
// =========================================================

const monthlyExpenseChart =
    document.getElementById(
        "monthly-expense-chart"
    );

const eventRankingChart =
    document.getElementById(
        "event-ranking-chart"
    );

// =========================================================
// 主功能分頁
// =========================================================

const mainTabs =
    document.querySelectorAll(
        ".main-tab"
    );

const appPages =
    document.querySelectorAll(
        ".app-page"
    );


function showPage(pageName) {

    appPages.forEach(
        function(page) {

            if (
                page.dataset.pageContent ===
                pageName
            ) {

                page.hidden = false;

            } else {

                page.hidden = true;

            }

        }
    );


    mainTabs.forEach(
        function(tab) {

            if (
                tab.dataset.page ===
                pageName
            ) {

                tab.classList.add(
                    "active"
                );

            } else {

                tab.classList.remove(
                    "active"
                );

            }

        }
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// =========================================================
// 搜尋元件
// =========================================================

const searchInput =
    document.getElementById("search-input");

const searchResults =
    document.getElementById("search-results");


// =========================================================
// 預設紀錄
// =========================================================

const defaultEventOptions = [
    "收支",
    "影視",
    "閱讀",
    "醫療",
    "購物",
    "旅行",
    "工作",
    "其他"
];


// =========================================================
// 編輯狀態
// =========================================================

let editingUuid = null;


// =========================================================
// 日期工具
// =========================================================

function getLocalDateString(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function setToday() {

    dateInput.value =
        getLocalDateString(
            new Date()
        );

}


// =========================================================
// 收支性質
// =========================================================

function getTransactionType() {

    const selected =
        document.querySelector(
            'input[name="transaction"]:checked'
        );

    return selected
        ? selected.value
        : "無";

}


function setTransactionType(value) {

    const radio =
        document.querySelector(
            `input[name="transaction"][value="${value}"]`
        );

    if (radio) {

        radio.checked = true;

    } else {

        document.getElementById(
            "transaction-none"
        ).checked = true;

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

    if (type === "無") {

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
// 更新紀錄建議
// =========================================================

async function updateEventOptions() {

    try {

        const allEvents =
            await getAllEventsFromDatabase();

        const eventNames =
            new Set(
                defaultEventOptions
            );

        allEvents.forEach(
            function(event) {

                if (
                    event.title &&
                    event.title.trim() !== "" &&
                    !event.deleted_at
                ) {

                    eventNames.add(
                        event.title.trim()
                    );

                }

            }
        );

        eventOptions.innerHTML = "";

        Array.from(eventNames)
            .sort(
                function(a, b) {

                    return a.localeCompare(
                        b,
                        "zh-Hant"
                    );

                }
            )
            .forEach(
                function(name) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        name;

                    eventOptions.appendChild(
                        option
                    );

                }
            );

    } catch (error) {

        console.error(
            "讀取紀錄建議失敗",
            error
        );

    }

}


// =========================================================
// 更新統計年份選單
// =========================================================

async function updateStatisticsYearOptions() {

    try {

        const allEvents =
            await getAllEventsFromDatabase();

        const years =
            new Set();

        allEvents.forEach(
            function(event) {

                if (
                    !event.deleted_at &&
                    event.start_date &&
                    event.start_date.length >= 4
                ) {

                    years.add(
                        event.start_date.slice(
                            0,
                            4
                        )
                    );

                }

            }
        );

        // 即使目前沒有今年的資料，
        // 也讓今年可以被選擇。

        const currentYear =
            String(
                new Date().getFullYear()
            );

        years.add(
            currentYear
        );


        // 保留目前選取的年份

        const oldValue =
            statisticsYear.value;


        statisticsYear.innerHTML =
            "";


        Array.from(years)
            .sort(
                function(a, b) {

                    return Number(b)
                        - Number(a);

                }
            )
            .forEach(
                function(year) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        year;

                    option.textContent =
                        `${year} 年`;

                    statisticsYear.appendChild(
                        option
                    );

                }
            );


        // 如果原本選取的年份仍存在，
        // 就保留原本選擇。

        const oldValueStillExists =
            Array.from(
                statisticsYear.options
            ).some(
                function(option) {

                    return option.value
                        === oldValue;

                }
            );


        if (
            oldValue &&
            oldValueStillExists
        ) {

            statisticsYear.value =
                oldValue;

        } else {

            statisticsYear.value =
                currentYear;

        }

    } catch (error) {

        console.error(
            "年份選單讀取失敗",
            error
        );

    }

}


// =========================================================
// 取得表單資料
// =========================================================

function getFormData() {

    const title =
        titleInput.value.trim();

    if (title === "") {

        message.textContent =
            "請輸入紀錄。";

        return null;

    }


    if (dateInput.value === "") {

        message.textContent =
            "請選擇日期。";

        return null;

    }


    if (
        endDateInput.value !== "" &&
        endDateInput.value < dateInput.value
    ) {

        message.textContent =
            "結束日期不能早於開始日期。";

        return null;

    }


    const transactionType =
        getTransactionType();

    let amount = null;


    if (transactionType !== "無") {

        if (amountInput.value === "") {

            message.textContent =
                "請輸入金額。";

            return null;

        }

        amount =
            Number(
                amountInput.value
            );

        if (
            !Number.isFinite(amount) ||
            amount < 0
        ) {

            message.textContent =
                "金額格式不正確。";

            return null;

        }

    }


    let workYear = null;


    if (workYearInput.value !== "") {

        workYear =
            Number(
                workYearInput.value
            );

        if (
            !Number.isInteger(workYear) ||
            workYear < 0 ||
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
            endDateInput.value || null,

        title:
            title,

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

    message.textContent = "";

    const formData =
        getFormData();

    if (formData === null) {

        return;

    }


    try {

        if (editingUuid === null) {

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

        } else {

            const oldEvent =
                await getEventFromDatabase(
                    editingUuid
                );

            if (!oldEvent) {

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


            // 移除舊版本曾使用的 category

            delete updatedEvent.category;


            await updateEventInDatabase(
                updatedEvent
            );

            message.textContent =
                "紀錄已更新。";

        }


        resetForm();

        await updateEventOptions();

        await updateStatisticsYearOptions();

        await displayEvents();

        await updateStatistics();

        await updateSearchResults();

    } catch (error) {

        console.error(error);

        message.textContent =
            "儲存失敗，請稍後再試。";

    }

}


// =========================================================
// 開始編輯
// =========================================================

async function startEdit(uuid) {

    try {

        const event =
            await getEventFromDatabase(
                uuid
            );

        if (!event) {

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


        setTransactionType(
            event.transaction_type
            || "無"
        );


        if (
            event.amount === null ||
            event.amount === undefined
        ) {

            amountInput.value =
                "";

        } else {

            amountInput.value =
                event.amount;

        }


        tagsInput.value =
            Array.isArray(event.tags)
                ? event.tags.join(", ")
                : "";


        workYearInput.value =
            event.work_year ?? "";


        descriptionInput.value =
            event.description || "";


        formTitle.textContent =
            "編輯紀錄";

        saveButton.textContent =
            "更新紀錄";

        cancelButton.hidden =
            false;


        if (
            event.end_date ||
            event.work_year ||
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

        console.error(error);

    }

}


// =========================================================
// 軟刪除
// =========================================================

async function softDeleteEvent(uuid) {

    try {

        const event =
            await getEventFromDatabase(
                uuid
            );

        if (!event) {

            return;

        }


        const confirmed =
            window.confirm(
                `確定要刪除「${event.title}」嗎？`
            );


        if (!confirmed) {

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


        await updateEventOptions();

        await updateStatisticsYearOptions();

        await displayEvents();

        await updateStatistics();

        await updateSearchResults();

    } catch (error) {

        console.error(error);

        message.textContent =
            "刪除失敗。";

    }

}


// =========================================================
// 清除表單
// =========================================================

function resetForm() {

    editingUuid = null;

    titleInput.value = "";
    endDateInput.value = "";
    amountInput.value = "";
    tagsInput.value = "";
    workYearInput.value = "";
    descriptionInput.value = "";


    document.getElementById(
        "transaction-none"
    ).checked = true;


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
// 顯示最近紀錄
// =========================================================

async function displayEvents() {

    try {

        const allEvents =
            await getAllEventsFromDatabase();


        const events =
            allEvents.filter(
                function(event) {

                    return !event.deleted_at;

                }
            );


        if (events.length === 0) {

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


                const title =
                    document.createElement(
                        "div"
                    );

                title.className =
                    "record-title";

                title.textContent =
                    event.title || "";

                item.appendChild(
                    title
                );


                const meta =
                    document.createElement(
                        "div"
                    );

                meta.className =
                    "record-meta";


                let dateText =
                    event.start_date || "";


                if (event.end_date) {

                    dateText =
                        `${event.start_date} ～ ${event.end_date}`;

                }


                meta.textContent =
                    dateText;

                item.appendChild(
                    meta
                );


                if (
                    event.transaction_type &&
                    event.transaction_type !== "無"
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


                const extraParts =
                    [];


                if (event.work_year) {

                    extraParts.push(
                        `作品年份 ${event.work_year}`
                    );

                }


                if (
                    Array.isArray(event.tags) &&
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

        console.error(error);

        recordsContainer.innerHTML =
            '<p class="empty-message">讀取資料失敗。</p>';

    }

}

// =========================================================
// 更新搜尋標籤
// =========================================================


// =========================================================
// 建立搜尋結果紀錄
// =========================================================

function createSearchRecordItem(event) {

    const item =
        document.createElement("div");

    item.className =
        "record-item";


    const title =
        document.createElement("div");

    title.className =
        "record-title";

    title.textContent =
        event.title || "";

    item.appendChild(title);


    const meta =
        document.createElement("div");

    meta.className =
        "record-meta";


    let dateText =
        event.start_date || "";


    if (event.end_date) {

        dateText =
            `${event.start_date} ～ ${event.end_date}`;

    }


    meta.textContent =
        dateText;

    item.appendChild(meta);


    if (
        event.transaction_type &&
        event.transaction_type !== "無"
    ) {

        const amount =
            document.createElement("div");

        amount.className =
            "record-amount";


        const formattedAmount =
            Number(
                event.amount || 0
            ).toLocaleString("zh-TW");


        amount.textContent =
            `${event.transaction_type} NT$ ${formattedAmount}`;

        item.appendChild(amount);

    }


    const extraParts = [];


    if (event.work_year) {

        extraParts.push(
            `作品年份 ${event.work_year}`
        );

    }


    if (
        Array.isArray(event.tags) &&
        event.tags.length > 0
    ) {

        extraParts.push(
            event.tags.join("、")
        );

    }


    if (event.description) {

        extraParts.push(
            event.description
        );

    }


    if (extraParts.length > 0) {

        const extra =
            document.createElement("div");

        extra.className =
            "record-extra";

        extra.textContent =
            extraParts.join(" · ");

        item.appendChild(extra);

    }


    const actions =
        document.createElement("div");

    actions.className =
        "record-actions";


    const editButton =
        document.createElement("button");

    editButton.type =
        "button";

    editButton.className =
        "edit-button";

    editButton.textContent =
        "編輯";


    editButton.addEventListener(
        "click",
        function() {

            startEdit(event.uuid);

        }
    );


    const deleteButton =
        document.createElement("button");

    deleteButton.type =
        "button";

    deleteButton.className =
        "delete-button";

    deleteButton.textContent =
        "刪除";


    deleteButton.addEventListener(
        "click",
        function() {

            softDeleteEvent(event.uuid);

        }
    );


    actions.appendChild(editButton);

    actions.appendChild(deleteButton);

    item.appendChild(actions);


    return item;

}


// =========================================================
// 即時搜尋
// =========================================================

async function updateSearchResults() {

    if (
        !searchInput ||
        !searchResults
    ) {

        return;

    }


    const keyword =
        searchInput.value
            .trim()
            .toLocaleLowerCase("zh-Hant");


    if (keyword === "") {

        searchResults.innerHTML =
            '<p class="empty-message">輸入關鍵字開始搜尋。</p>';

        return;

    }


    try {

        const allEvents =
            await getAllEventsFromDatabase();


        const matchedEvents =
            allEvents
                .filter(
                    function(event) {

                        if (event.deleted_at) {

                            return false;

                        }


                        const title =
                            String(
                                event.title || ""
                            ).toLocaleLowerCase(
                                "zh-Hant"
                            );


                        const description =
                            String(
                                event.description || ""
                            ).toLocaleLowerCase(
                                "zh-Hant"
                            );


                        const tags =
                            Array.isArray(event.tags)
                                ? event.tags
                                    .join(" ")
                                    .toLocaleLowerCase(
                                        "zh-Hant"
                                    )
                                : "";


                        return (
                            title.includes(keyword) ||
                            description.includes(keyword) ||
                            tags.includes(keyword)
                        );

                    }
                )
                .sort(
                    function(a, b) {

                        if (
                            a.start_date !==
                            b.start_date
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


        searchResults.innerHTML = "";


        if (matchedEvents.length === 0) {

            searchResults.innerHTML =
                '<p class="empty-message">找不到符合的紀錄。</p>';

            return;

        }


        matchedEvents.forEach(
            function(event) {

                searchResults.appendChild(
                    createSearchRecordItem(
                        event
                    )
                );

            }
        );


    } catch (error) {

        console.error(
            "搜尋失敗",
            error
        );


        searchResults.innerHTML =
            '<p class="empty-message">搜尋失敗。</p>';

    }

}
// =========================================================
// 取得統計日期範圍
// =========================================================

function getStatisticsDateRange() {

    const now =
        new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();

    const period =
        statisticsPeriod.value;


    // -----------------------------------------------------
    // 全部
    // -----------------------------------------------------

    if (period === "all") {

        return {
            start: null,
            end: null
        };

    }


    // -----------------------------------------------------
    // 今年
    // -----------------------------------------------------

    if (period === "year") {

        return {

            start:
                `${currentYear}-01-01`,

            end:
                `${currentYear}-12-31`

        };

    }


    // -----------------------------------------------------
    // 本月
    // -----------------------------------------------------

    if (period === "month") {

        const firstDay =
            new Date(
                currentYear,
                currentMonth,
                1
            );

        const lastDay =
            new Date(
                currentYear,
                currentMonth + 1,
                0
            );


        return {

            start:
                getLocalDateString(
                    firstDay
                ),

            end:
                getLocalDateString(
                    lastDay
                )

        };

    }


    // -----------------------------------------------------
    // 指定年份／月份
    // -----------------------------------------------------

    if (period === "history") {

        const year =
            statisticsYear.value;

        const month =
            statisticsMonth.value;


        if (!year) {

            return {
                start: null,
                end: null
            };

        }


        // 全年

        if (month === "all") {

            return {

                start:
                    `${year}-01-01`,

                end:
                    `${year}-12-31`

            };

        }


        // 指定月份

        const numericYear =
            Number(year);

        const numericMonth =
            Number(month);


        const lastDay =
            new Date(
                numericYear,
                numericMonth,
                0
            ).getDate();


        return {

            start:
                `${year}-${month}-01`,

            end:
                `${year}-${month}-${String(
                    lastDay
                ).padStart(2, "0")}`

        };

    }


    // -----------------------------------------------------
    // 自訂日期
    // -----------------------------------------------------

    if (period === "custom") {

        return {

            start:
                statisticsStartDate.value
                || null,

            end:
                statisticsEndDate.value
                || null

        };

    }


    return {
        start: null,
        end: null
    };

}

// =========================================================
// 更新統計摘要標題
// =========================================================

function updateStatisticsSummaryTitle() {

    const now =
        new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth() + 1;

    const period =
        statisticsPeriod.value;


    // 全部

    if (period === "all") {

        statisticsSummaryTitle.textContent =
            "全部期間摘要";

        return;

    }


    // 今年

    if (period === "year") {

        statisticsSummaryTitle.textContent =
            `${currentYear} 年度摘要`;

        return;

    }


    // 本月

    if (period === "month") {

        statisticsSummaryTitle.textContent =
            `${currentYear} 年 ${currentMonth} 月摘要`;

        return;

    }


    // 指定年份／月份

    if (period === "history") {

        const year =
            statisticsYear.value;

        const month =
            statisticsMonth.value;


        if (!year) {

            statisticsSummaryTitle.textContent =
                "期間摘要";

            return;

        }


        if (month === "all") {

            statisticsSummaryTitle.textContent =
                `${year} 年度摘要`;

            return;

        }


        statisticsSummaryTitle.textContent =
            `${year} 年 ${Number(month)} 月摘要`;

        return;

    }


    // 自訂日期

    if (period === "custom") {

        statisticsSummaryTitle.textContent =
            "自訂期間摘要";

        return;

    }


    statisticsSummaryTitle.textContent =
        "期間摘要";

}

// =========================================================
// 判斷紀錄是否在統計期間內
// =========================================================

function eventIsInStatisticsRange(
    event,
    range
) {

    if (!event.start_date) {

        return false;

    }


    if (
        range.start &&
        event.start_date < range.start
    ) {

        return false;

    }


    if (
        range.end &&
        event.start_date > range.end
    ) {

        return false;

    }


    return true;

}


// =========================================================
// 金額格式
// =========================================================

function formatMoney(amount) {

    return (
        "NT$ "
        +
        Number(
            amount || 0
        ).toLocaleString(
            "zh-TW"
        )
    );

}


// =========================================================
// 顯示紀錄／標籤統計
// =========================================================

function renderCountStatistics(
    container,
    counts
) {

    container.innerHTML = "";


    const entries =
        Object.entries(counts)
            .sort(
                function(a, b) {

                    if (
                        b[1] !== a[1]
                    ) {

                        return b[1] - a[1];

                    }

                    return a[0].localeCompare(
                        b[0],
                        "zh-Hant"
                    );

                }
            );


    if (entries.length === 0) {

        container.innerHTML =
            '<p class="empty-message">目前沒有資料。</p>';

        return;

    }


    entries.forEach(
        function(entry) {

            const name =
                entry[0];

            const count =
                entry[1];


            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "statistics-row";


            const label =
                document.createElement(
                    "span"
                );

            label.textContent =
                name;


            const value =
                document.createElement(
                    "strong"
                );

            value.textContent =
                `${count} 次`;


            row.appendChild(
                label
            );

            row.appendChild(
                value
            );

            container.appendChild(
                row
            );

        }
    );

}

// =========================================================
// 更新統計標籤篩選按鈕
// =========================================================

function updateStatisticsTagFilters(events) {

    const currentActiveButton =
        statisticsTagFilters.querySelector(
            "[data-tag-filter].active"
        );


    let selectedTag =
        currentActiveButton
            ? currentActiveButton.dataset.tagFilter
            : "all";


    statisticsTagFilters.innerHTML = "";

    // 全部

    const allButton =
        document.createElement(
            "button"
        );

    allButton.type =
        "button";

    allButton.className =
    selectedTag === "all"
        ? "statistics-filter-button active"
        : "statistics-filter-button";

    allButton.dataset.tagFilter =
        "all";

    allButton.textContent =
        "全部";

    statisticsTagFilters.appendChild(
        allButton
    );


    // 收集實際使用過的標籤

const tagCounts =
    {};


    events.forEach(
        function(event) {

            if (
                !Array.isArray(
                    event.tags
                )
            ) {

                return;

            }


            event.tags.forEach(
                function(tag) {

                    const cleanTag =
                        String(tag).trim();


                    if (
    cleanTag !== ""
) {

    if (!tagCounts[cleanTag]) {

        tagCounts[cleanTag] =
            0;

    }


    tagCounts[cleanTag] +=
        1;

}

                }
            );

        }
    );


    // 如果原本選中的標籤已不存在，
    // 自動回到全部

    if (
        selectedTag !== "all" &&
        !Object.prototype.hasOwnProperty.call(
            tagCounts,
            selectedTag
        )
    ) {

        selectedTag =
            "all";

    }

    // 依使用次數排序後建立按鈕

    const sortedTags =
        Object.keys(tagCounts)
            .sort(
                function(a, b) {

                    if (
                        tagCounts[b] !==
                        tagCounts[a]
                    ) {

                        return (
                            tagCounts[b] -
                            tagCounts[a]
                        );

                    }


                    return a.localeCompare(
                        b,
                        "zh-Hant"
                    );

                }
            );


    let visibleTags;


    if (statisticsTagsExpanded) {

        visibleTags =
            sortedTags;

    } else {

        visibleTags =
            sortedTags.slice(
                0,
                10
            );


        // 如果目前選中的標籤不在前 10 名，
        // 收起時仍然保留它

        if (
            selectedTag !== "all" &&
            sortedTags.includes(
                selectedTag
            ) &&
            !visibleTags.includes(
                selectedTag
            )
        ) {

            visibleTags.push(
                selectedTag
            );

        }

    }


    visibleTags.forEach(
            function(tag) {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
    selectedTag === tag
        ? "statistics-filter-button active"
        : "statistics-filter-button";

                button.dataset.tagFilter =
                    tag;

                button.textContent =
                    tag;

                statisticsTagFilters.appendChild(
                    button
                );

            }
        );

    // 標籤超過 10 個時顯示更多／收起

    if (
        Object.keys(tagCounts).length >
        10
    ) {

        const toggleButton =
            document.createElement(
                "button"
            );

        toggleButton.type =
            "button";

        toggleButton.className =
            "statistics-filter-button";

        toggleButton.textContent =
            statisticsTagsExpanded
                ? "收起"
                : "更多";

        toggleButton.addEventListener(
            "click",
            function() {

                statisticsTagsExpanded =
                    !statisticsTagsExpanded;

                updateStatisticsTagFilters(
                    events
                );

            }
        );

        statisticsTagFilters.appendChild(
            toggleButton
        );

    }

}


// =========================================================
// 繪製橫向長條圖
// =========================================================

function renderBarChart(
    container,
    data,
    valueFormatter
) {

    container.innerHTML = "";


    if (data.length === 0) {

        container.innerHTML =
            '<p class="empty-message">目前沒有資料。</p>';

        return;

    }


    const maxValue =
        Math.max(
            ...data.map(
                function(item) {

                    return item.value;

                }
            )
        );


    data.forEach(
        function(item) {

            const row =
                document.createElement("div");

            row.className =
                "chart-row";


            const label =
                document.createElement("div");

            label.className =
                "chart-label";

            label.textContent =
                item.label;


            const barArea =
                document.createElement("div");

            barArea.className =
                "chart-bar-area";


            const bar =
                document.createElement("div");

            bar.className =
                "chart-bar";


            const percentage =
                maxValue > 0
                    ? item.value / maxValue * 100
                    : 0;


            bar.style.width =
                `${percentage}%`;


            barArea.appendChild(
                bar
            );


            const value =
                document.createElement("div");

            value.className =
                "chart-value";

            value.textContent =
                valueFormatter(
                    item.value
                );


            row.appendChild(
                label
            );

            row.appendChild(
                barArea
            );

            row.appendChild(
                value
            );


            container.appendChild(
                row
            );

        }
    );

}


// =========================================================
// 更新圖表
// =========================================================

function updateCharts(events) {

    if (
        !monthlyExpenseChart ||
        !eventRankingChart
    ) {

        return;

    }


    // -----------------------------------------------------
    // 每月支出趨勢
    // -----------------------------------------------------

    const monthlyExpenses = {};


    events.forEach(
        function(event) {

            if (
                event.transaction_type !== "支出" ||
                !event.start_date
            ) {

                return;

            }


            const month =
                event.start_date.slice(
                    0,
                    7
                );


            if (!monthlyExpenses[month]) {

                monthlyExpenses[month] =
                    0;

            }


            monthlyExpenses[month] +=
                Number(
                    event.amount || 0
                );

        }
    );


    const monthlyData =
        Object.entries(
            monthlyExpenses
        )
            .sort(
                function(a, b) {

                    return a[0].localeCompare(
                        b[0]
                    );

                }
            )
            .map(
                function(entry) {

                    return {

                        label:
                            entry[0],

                        value:
                            entry[1]

                    };

                }
            );


    renderBarChart(
        monthlyExpenseChart,
        monthlyData,
        function(value) {

            return formatMoney(
                value
            );

        }
    );


    // -----------------------------------------------------
    // 紀錄次數排行
    // -----------------------------------------------------

    const eventCounts = {};


    events.forEach(
        function(event) {

            const title =
                String(
                    event.title || ""
                ).trim();


            if (title === "") {

                return;

            }


            if (!eventCounts[title]) {

                eventCounts[title] =
                    0;

            }


            eventCounts[title] +=
                1;

        }
    );


    const rankingData =
        Object.entries(
            eventCounts
        )
            .sort(
                function(a, b) {

                    if (
                        b[1] !== a[1]
                    ) {

                        return b[1] - a[1];

                    }


                    return a[0].localeCompare(
                        b[0],
                        "zh-Hant"
                    );

                }
            )
            .slice(
                0,
                10
            )
            .map(
                function(entry) {

                    return {

                        label:
                            entry[0],

                        value:
                            entry[1]

                    };

                }
            );


    renderBarChart(
        eventRankingChart,
        rankingData,
        function(value) {

            return `${value} 次`;

        }
    );

}
// =========================================================
// 更新統計
// =========================================================

async function updateStatistics() {

    try {

        updateStatisticsSummaryTitle();

        const allEvents =
            await getAllEventsFromDatabase();

        const activeEvents =
            allEvents.filter(
                function(event) {

                    return !event.deleted_at;

                }
            );


        updateStatisticsTagFilters(
            activeEvents
        );

        const range =
            getStatisticsDateRange();

        const activeRecordButton =
            statisticsRecordFilters.querySelector(
                "[data-record-filter].active"
            );


        const selectedRecord =
            activeRecordButton
                ? activeRecordButton.dataset.recordFilter
                : "all";

        const activeTagButton =
            statisticsTagFilters.querySelector(
                "[data-tag-filter].active"
            );


        const selectedTag =
            activeTagButton
                ? activeTagButton.dataset.tagFilter
                : "all";

        const recordSummaryText =
            selectedRecord === "all"
                ? "全部紀錄"
                : selectedRecord;


        const tagSummaryText =
            selectedTag === "all"
                ? "全部標籤"
                : selectedTag;


        statisticsFilterSummary.textContent =
            `${recordSummaryText} · ${tagSummaryText}`;

        const events =
            allEvents.filter(
                function(event) {

                    return (
    !event.deleted_at &&
    eventIsInStatisticsRange(
        event,
        range
    ) &&
    (
    selectedRecord === "all" ||
    event.title === selectedRecord
) &&
(
    selectedTag === "all" ||
    (
        Array.isArray(event.tags) &&
        event.tags.some(
            function(tag) {

                return (
                    String(tag).trim() ===
                    selectedTag
                );

            }
        )
    )
)
);

                }
            );


        // -------------------------------------------------
        // 收支統計
        // -------------------------------------------------

        let totalExpense = 0;
        let totalIncome = 0;


        events.forEach(
            function(event) {

                const amount =
                    Number(
                        event.amount || 0
                    );


                if (
                    event.transaction_type
                    === "支出"
                ) {

                    totalExpense +=
                        amount;

                }


                if (
                    event.transaction_type
                    === "收入"
                ) {

                    totalIncome +=
                        amount;

                }

            }
        );


        const balance =
            totalIncome
            -
            totalExpense;


        statisticsCount.textContent =
            `${events.length.toLocaleString("zh-TW")} 筆`;

        statisticsExpense.textContent =
            formatMoney(
                totalExpense
            );

        statisticsIncome.textContent =
            formatMoney(
                totalIncome
            );

        statisticsBalance.textContent =
            formatMoney(
                balance
            );


        // -------------------------------------------------
        // 紀錄統計
        // -------------------------------------------------

        const eventCounts = {};


        events.forEach(
            function(event) {

                const title =
                    (
                        event.title || ""
                    ).trim();


                if (title === "") {

                    return;

                }


                if (!eventCounts[title]) {

                    eventCounts[title] =
                        0;

                }


                eventCounts[title] +=
                    1;

            }
        );


        renderCountStatistics(
            eventStatistics,
            eventCounts
        );


        // -------------------------------------------------
        // 標籤統計
        // -------------------------------------------------

        const tagCounts = {};


        events.forEach(
            function(event) {

                if (
                    !Array.isArray(
                        event.tags
                    )
                ) {

                    return;

                }


                // 同一筆紀錄中相同標籤只統計一次

                const uniqueTags =
                    new Set(
                        event.tags
                            .map(
                                function(tag) {

                                    return String(
                                        tag
                                    ).trim();

                                }
                            )
                            .filter(
                                function(tag) {

                                    return tag !== "";

                                }
                            )
                    );


                uniqueTags.forEach(
                    function(tag) {

                        if (!tagCounts[tag]) {

                            tagCounts[tag] =
                                0;

                        }

                        tagCounts[tag] +=
                            1;

                    }
                );

            }
        );


        renderCountStatistics(
            tagStatistics,
            tagCounts
        );
        
updateCharts(
            events
        );

    } catch (error) {

        console.error(
            "統計失敗",
            error
        );

        statisticsCount.textContent =
            "讀取失敗";
        if (monthlyExpenseChart) {

            monthlyExpenseChart.innerHTML =
                '<p class="empty-message">圖表讀取失敗。</p>';

        }


        if (eventRankingChart) {

            eventRankingChart.innerHTML =
                '<p class="empty-message">圖表讀取失敗。</p>';

        }
    }

}


// =========================================================
// 統計期間切換
// =========================================================

function handleStatisticsPeriodChange() {

    const period =
        statisticsPeriod.value;


    // 指定年份／月份

    if (period === "history") {

        historyStatisticsPeriod.hidden =
            false;

    } else {

        historyStatisticsPeriod.hidden =
            true;

    }


    // 自訂日期

    if (period === "custom") {

        customStatisticsPeriod.hidden =
            false;

    } else {

        customStatisticsPeriod.hidden =
            true;

    }


    updateStatistics();

}


// =========================================================
// 匯出 JSON
// =========================================================

async function exportData() {

    message.textContent = "";


    try {

        const events =
            await getAllEventsFromDatabase();


        if (events.length === 0) {

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
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");


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

        console.error(error);

        message.textContent =
            "匯出失敗。";

    }

}

// =========================================================
// 讀取匯入備份
// =========================================================

async function importData() {

    const file =
        importFile.files[0];


    if (!file) {

        return;

    }


    try {

        const text =
            await file.text();


        const data =
            JSON.parse(text);


        // -------------------------------------------------
        // 驗證 LifeLog 備份格式
        // -------------------------------------------------

        if (
            !data ||
            data.format !== "LifeLog" ||
            data.version !== 1 ||
            !Array.isArray(data.events)
        ) {

            message.textContent =
                "這不是有效的 LifeLog 備份檔。";

            return;

        }


                const exportedDate =
            data.exported_at
                ? new Date(
                    data.exported_at
                ).toLocaleString(
                    "zh-TW"
                )
                : "未知";


        const confirmed =
            window.confirm(
                `LifeLog 備份\n\n` +
                `備份時間：${exportedDate}\n` +
                `紀錄數量：${data.events.length.toLocaleString("zh-TW")} 筆\n\n` +
                `將與目前資料合併，相同 UUID 的紀錄不會重複新增。\n\n` +
                `確定要繼續嗎？`
            );


        if (!confirmed) {

            message.textContent =
                "已取消匯入。";

            return;

        }


        let importedCount =
            0;

        let skippedCount =
            0;


        for (const event of data.events) {

            if (
                !event ||
                !event.uuid
            ) {

                skippedCount++;
                continue;

            }


            const existingEvent =
                await getEventFromDatabase(
                    event.uuid
                );


            if (existingEvent) {

                skippedCount++;
                continue;

            }


            await addEventToDatabase(
                event
            );


            importedCount++;

        }


        await updateEventOptions();

        await updateStatisticsYearOptions();

        await displayEvents();

        await updateStatistics();

        await updateSearchResults();

        message.textContent =
            `匯入完成：新增 ${importedCount.toLocaleString("zh-TW")} 筆，` +
            `跳過 ${skippedCount.toLocaleString("zh-TW")} 筆。`;

    } catch (error) {

        console.error(
            "讀取備份失敗",
            error
        );


        message.textContent =
            "無法讀取備份檔。";

    } finally {

        importFile.value =
            "";

    }

}


// =========================================================
// 紀錄監聽
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

importButton.addEventListener(
    "click",
    function() {

        importFile.click();

    }
);

importFile.addEventListener(
    "change",
    importData
);

statisticsPeriod.addEventListener(
    "change",
    handleStatisticsPeriodChange
);


statisticsYear.addEventListener(
    "change",
    updateStatistics
);


statisticsMonth.addEventListener(
    "change",
    updateStatistics
);


statisticsStartDate.addEventListener(
    "change",
    updateStatistics
);


statisticsEndDate.addEventListener(
    "change",
    updateStatistics
);


// =========================================================
// 統計紀錄篩選
// =========================================================

const statisticsRecordFilters =
    document.getElementById(
        "statistics-record-filters"
    );


statisticsRecordFilters.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-record-filter]"
            );


        if (!button) {

            return;

        }


        statisticsRecordFilters
            .querySelectorAll(
                "[data-record-filter]"
            )
            .forEach(
                function(item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


        button.classList.add(
            "active"
        );


        updateStatistics();

    }
);

// =========================================================
// 統計標籤篩選
// =========================================================

statisticsTagFilters.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-tag-filter]"
            );


        if (!button) {

            return;

        }


        statisticsTagFilters
            .querySelectorAll(
                "[data-tag-filter]"
            )
            .forEach(
                function(item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


        button.classList.add(
            "active"
        );


        updateStatistics();

    }
);


// =========================================================
// 主功能分頁紀錄監聽
// =========================================================

mainTabs.forEach(
    function(tab) {

        tab.addEventListener(
            "click",
            function() {

                const pageName =
                    tab.dataset.page;

                showPage(
                    pageName
                );

            }
        );

    }
);

// =========================================================
// 搜尋紀錄監聽
// =========================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        updateSearchResults
    );

}
// =========================================================
// 啟動
// =========================================================

async function initializeApp() {

    setToday();

    updateAmountVisibility();

    await updateEventOptions();

    await updateStatisticsYearOptions();

    await displayEvents();

    handleStatisticsPeriodChange();

    await updateSearchResults();

    
}


initializeApp();


// =========================================================
// 註冊 Service Worker
// =========================================================

if ("serviceWorker" in navigator) {

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