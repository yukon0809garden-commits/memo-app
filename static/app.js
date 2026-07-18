// --- DOM要素の取得 ---
const memoForm = document.getElementById("memo-form");
const memoTitle = document.getElementById("memo-title");
const memoBody = document.getElementById("memo-body");
const memoId = document.getElementById("memo-id");
const memoList = document.getElementById("memo-list");
const btnCreate = document.getElementById("btn-create");
const btnUpdate = document.getElementById("btn-update");
const btnDelete = document.getElementById("btn-delete");
const btnCancel = document.getElementById("btn-cancel");


// --- メモ一覧を読み込む ---
async function fetchMemos() {
    const response = await fetch("/api/memos");
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
            "<p>" + memo.body + "</p>" +
            '<span class="memo-date">更新: ' + memo.updated_at + "</span>";

        card.addEventListener("click", function () {
            selectMemo(memo);
            document.querySelectorAll(".memo-card").forEach(function (c) {
                c.classList.remove("selected");
            });
            card.classList.add("selected");
        });

        memoList.appendChild(card);
    });
}


// --- メモを作成する ---
async function createMemo() {
    var title = memoTitle.value.trim();
    var body = memoBody.value.trim();

    if (!title || !body) {
        alert("タイトルと本文を入力してください。");
        return;
    }

    await fetch("/api/memos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title, body: body }),
    });

    resetForm();
    fetchMemos();
}


// --- メモを選択する（編集モードにする） ---
function selectMemo(memo) {
    memoId.value = memo.id;
    memoTitle.value = memo.title;
    memoBody.value = memo.body;

    btnCreate.disabled = true;
    btnUpdate.disabled = false;
    btnDelete.disabled = false;
}


// --- メモを更新する ---
async function updateMemo() {
    var id = memoId.value;
    var title = memoTitle.value.trim();
    var body = memoBody.value.trim();

    if (!title || !body) {
        alert("タイトルと本文を入力してください。");
        return;
    }

    await fetch("/api/memos/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title, body: body }),
    });

    resetForm();
    fetchMemos();
}


// --- メモを削除する ---
async function deleteMemo() {
    var id = memoId.value;

    if (!confirm("このメモを削除してもよいですか？")) {
        return;
    }

    await fetch("/api/memos/" + id, {
        method: "DELETE",
    });

    resetForm();
    fetchMemos();
}


// --- フォームをリセットする ---
function resetForm() {
    memoId.value = "";
    memoTitle.value = "";
    memoBody.value = "";

    btnCreate.disabled = false;
    btnUpdate.disabled = true;
    btnDelete.disabled = true;

    document.querySelectorAll(".memo-card").forEach(function (c) {
        c.classList.remove("selected");
    });
}


// --- イベントリスナーの登録 ---
memoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    createMemo();
});

btnUpdate.addEventListener("click", updateMemo);
btnDelete.addEventListener("click", deleteMemo);
btnCancel.addEventListener("click", resetForm);

// ページ読み込み時にメモ一覧を取得
fetchMemos();