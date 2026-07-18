import sqlite3

DATABASE = "memo.db"

# ソートに使用可能なカラムのホワイトリスト
ALLOWED_SORT_COLUMNS = {"created_at", "updated_at"}
ALLOWED_ORDERS = {"asc", "desc"}


def get_connection():
    """データベースへの接続を取得する"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """データベースを初期化する（テーブルを作成する）"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS memos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            category TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("PRAGMA table_info(memos)")
    columns = [row["name"] for row in cursor.fetchall()]
    if "category" not in columns:
        cursor.execute("ALTER TABLE memos ADD COLUMN category TEXT DEFAULT ''")

    conn.commit()
    conn.close()


def _build_order_clause(sort, order):
    """
    ソート条件を安全なSQL断片に変換する。
    ホワイトリストにない値が来た場合はデフォルト値を使う。
    """
    if sort not in ALLOWED_SORT_COLUMNS:
        sort = "updated_at"
    if order not in ALLOWED_ORDERS:
        order = "desc"
    return f"{sort} {order.upper()}"


def get_all_memos(sort="updated_at", order="desc"):
    """全てのメモを取得する"""
    conn = get_connection()
    cursor = conn.cursor()
    order_clause = _build_order_clause(sort, order)
    cursor.execute(f"SELECT * FROM memos ORDER BY {order_clause}")
    memos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return memos


def get_memo(memo_id):
    """指定されたIDのメモを取得する"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM memos WHERE id = ?", (memo_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def create_memo(title, body, category=""):
    """新しいメモを作成する"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO memos (title, body, category) VALUES (?, ?, ?)",
        (title, body, category)
    )
    conn.commit()
    memo_id = cursor.lastrowid
    conn.close()
    return memo_id


def update_memo(memo_id, title, body, category=""):
    """指定されたIDのメモを更新する"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE memos SET title = ?, body = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (title, body, category, memo_id)
    )
    conn.commit()
    changes = conn.total_changes
    conn.close()
    return changes > 0


def delete_memo(memo_id):
    """指定されたIDのメモを削除する"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM memos WHERE id = ?", (memo_id,))
    conn.commit()
    changes = conn.total_changes
    conn.close()
    return changes > 0


def search_memos(query, sort="updated_at", order="desc"):
    """タイトルまたは本文にキーワードが含まれるメモを検索する"""
    conn = get_connection()
    cursor = conn.cursor()
    order_clause = _build_order_clause(sort, order)
    like_query = f"%{query}%"
    cursor.execute(
        f"SELECT * FROM memos WHERE title LIKE ? OR body LIKE ? ORDER BY {order_clause}",
        (like_query, like_query)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_memos_by_category(category):
    """指定したカテゴリのメモを取得する"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM memos WHERE category = ? ORDER BY updated_at DESC",
        (category,)
    )
    memos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return memos