// --- DOM要素の取得（作成フォーム） ---
const memoForm = document.getElementById("memo-form");
const memoTitle = document.getElementById("memo-title");
const memoBody = document.getElementById("memo-body");
const memoCategory = document.getElementById("memo-category");
const titleCharCount = document.getElementById("title-char-count");
const bodyCharCount = document.getElementById("body-char-count");

// --- DOM要素の取得（一覧・検索・ソート） ---
const memoList = document.getElementById("memo-list");
const searchInput = document.getElementById("search-input");
const btnSearch = document.getElementById("btn-search");
const btnClearSearch = document.getElementById("btn-clear-search");
const sortSelect = document.getElementById("sort-select");

// --- DOM要素の取得（編集モーダル） ---
const editDialog = document.getElementById("edit-dialog");
const editForm = document.getElementById("edit-form");
const editMemoId = document.getElementById("edit-memo-id");
const editMemoTitle = document.getElementById("edit-memo-title");
const editMemoBody = document.getElementById("edit-memo-body");
const editMemoCategory = document.getElementById("edit-memo-category");
const editTitleCharCount = document.getElementById("edit-title-char-count");
const editBodyCharCount = document.getElementById("edit-body-char-count");
const btnDelete = document.getElementById("btn-delete");
const btnCancel = document.getElementById("btn-cancel");

// --- DOM要素の取得（ダークモード） ---
const btnDarkMode = document.getElementById("btn-dark-mode");


// --- 日時を読みやすい形式に変換する ---
// 例: "2025-01-15 10:30:00" -> "2025年1月15日 10:30"
function formatDate(dateString) {
    if (!dateString) return "";

    // SQLiteのTIMESTAMPは "YYYY-MM-DD HH:MM:SS" 形式
    var parts = dateString.split(" ");
    var datePart = parts[0]; // "2025-01-15"
    var timePart = parts[1] || ""; // "10:30:00"

    var dateSegments = datePart.split("-");
    var year = dateSegments[0];
    var month = parseInt(dateSegments[1], 10);
    var day = parseInt(dateSegments[2], 10);

    var timeSegments = timePart.split(":");
    var hour = timeSegments[0] || "00";
    var minute = timeSegments[1] || "00";

    return year + "年" + month + "月" + day + "日 " + hour + ":" + minute;
}


// --- メモ一覧を読み込む ---
async function fetchMemos(keyword) {
    var params = new URLSearchParams();

    if (keyword) {
        params.set("q", keyword);
    }

    var sortRaw = sortSelect.value;
    var lastDashIndex = sortRaw.lastIndexOf("-");
    var sortColumn = sortRaw.substring(0, lastDashIndex);
    var sortOrder = sortRaw.substring(lastDashIndex + 1);

    params.set("sort", sortColumn);
    params.set("order", sortOrder);

    const response = await fetch("/api/memos?" + params.toString());
    const memos = await response.json();

    memoList.innerHTML = "";

    if (memos.length === 0) {
        memoList.innerHTML = '<p class="empty-message">メモがまだありません。上のフォームから作成してみましょう。</p>';
        return;
    }

    memos.forEach(function (memo) {
        const card = document.createElement("div");
        card.className = "memo-card";
        card.innerHTML =
            "<h3>" + memo.title + "</h3>" +
            (memo.category ? '<span class="memo-category">' + memo.category + "</span>" : "") +
            "<p>" + memo.body + "</p>" +
            '<span class="memo-date">更新: ' + formatDate(memo.updated_at) + "</span>";

        card.addEventListener("click", function () {
            openEditDialog(memo);
        });

        memoList.appendChild(card);

        // フェードインアニメーション（要素追加直後に .show を付与してCSS transitionを発火させる）
        requestAnimationFrame(function () {
            card.classList.add("show");
        });
    });
}


// --- 文字数カウントを更新する共通関数 ---
function updateCharCount(inputEl, countEl) {
    var maxLength = inputEl.getAttribute("maxlength");
    countEl.textContent = inputEl.value.length + " / " + maxLength;
}


// --- メモを作成する ---
async function createMemo() {
    var title = memoTitle.value.trim();
    var body = memoBody.value.trim();
    var category = memoCategory.value.trim();

    if (!title || !body) {
        alert("タイトルと本文を入力してください。");
        return;
    }

    await fetch("/api/memos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title, body: body, category: category }),
    });

    resetCreateForm();
    fetchMemos(searchInput.value.trim());
}


// --- 作成フォームをリセットする ---
function resetCreateForm() {
    memoTitle.value = "";
    memoBody.value = "";
    memoCategory.value = "";
    updateCharCount(memoTitle, titleCharCount);
    updateCharCount(memoBody, bodyCharCount);
}


// --- 編集モーダルを開く ---
function openEditDialog(memo) {
    editMemoId.value = memo.id;
    editMemoTitle.value = memo.title;
    editMemoBody.value = memo.body;
    editMemoCategory.value = memo.category || "";

    updateCharCount(editMemoTitle, editTitleCharCount);
    updateCharCount(editMemoBody, editBodyCharCount);

    editDialog.showModal();
}


// --- メモを更新する ---
async function updateMemo() {
    var id = editMemoId.value;
    var title = editMemoTitle.value.trim();
    var body = editMemoBody.value.trim();
    var category = editMemoCategory.value.trim();

    if (!title || !body) {
        alert("タイトルと本文を入力してください。");
        return;
    }

    await fetch("/api/memos/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title, body: body, category: category }),
    });

    editDialog.close();
    fetchMemos(searchInput.value.trim());
}


// --- メモを削除する（フェードアウトしてから削除） ---
async function deleteMemo() {
    var id = editMemoId.value;

    if (!confirm("このメモを削除してもよいですか？")) {
        return;
    }

    await fetch("/api/memos/" + id, {
        method: "DELETE",
    });

    editDialog.close();
    fetchMemos(searchInput.value.trim());
}


// --- イベントリスナーの登録（作成フォーム） ---
memoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    createMemo();
});

memoTitle.addEventListener("input", function () {
    updateCharCount(memoTitle, titleCharCount);
});

memoBody.addEventListener("input", function () {
    updateCharCount(memoBody, bodyCharCount);
});


// --- イベントリスナーの登録（編集モーダル） ---
editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    updateMemo();
});

editMemoTitle.addEventListener("input", function () {
    updateCharCount(editMemoTitle, editTitleCharCount);
});

editMemoBody.addEventListener("input", function () {
    updateCharCount(editMemoBody, editBodyCharCount);
});

btnDelete.addEventListener("click", deleteMemo);

btnCancel.addEventListener("click", function () {
    editDialog.close();
});


// --- イベントリスナーの登録（検索・ソート） ---
btnSearch.addEventListener("click", function () {
    fetchMemos(searchInput.value.trim());
});

searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        fetchMemos(searchInput.value.trim());
    }
});

btnClearSearch.addEventListener("click", function () {
    searchInput.value = "";
    fetchMemos();
});

sortSelect.addEventListener("change", function () {
    fetchMemos(searchInput.value.trim());
});


// --- ダークモード ---
function applyDarkModePreference() {
    var isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
        document.body.classList.add("dark");
        btnDarkMode.textContent = "☀️ ライトモード";
    } else {
        document.body.classList.remove("dark");
        btnDarkMode.textContent = "🌙 ダークモード";
    }
}

btnDarkMode.addEventListener("click", function () {
    var isDark = document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", isDark ? "true" : "false");
    btnDarkMode.textContent = isDark ? "☀️ ライトモード" : "🌙 ダークモード";
});


// --- 初期化 ---
applyDarkModePreference();
updateCharCount(memoTitle, titleCharCount);
updateCharCount(memoBody, bodyCharCount);
fetchMemos();