# memo-app

Flask と SQLite で作った、ブラウザで使うメモアプリです。
学習教材をもとに構築し、画面・API・データベースがどうつながって動くかを理解するために作りました。

## できること

- メモの登録・一覧表示・編集・削除
- キーワード検索（タイトル・本文の部分一致）
- カテゴリの設定
- 作成日時・更新日時での並べ替え（新しい順／古い順）
- ダークモードの切り替え

## 構成

```
ブラウザ（HTML / CSS / JavaScript）
   │  fetch で API を呼び出す
   ▼
Flask（app.py：REST API）
   │  SQL を実行する
   ▼
SQLite（memo.db：データベースファイル）
```

| ファイル | 役割 |
|---|---|
| `app.py` | API のルーティング（リクエストを受けて、結果を JSON で返す） |
| `database.py` | データベースの操作（テーブル作成・検索・登録・更新・削除） |
| `static/index.html` | 画面の HTML |
| `static/app.js` | 画面の動き（API の呼び出しと表示の更新） |
| `static/style.css` | 見た目（ダークモードを含む） |
| `requirements.txt` | 使うライブラリとバージョンの一覧 |

## API

| メソッド | パス | 内容 | 成功時 |
|---|---|---|---|
| GET | `/api/memos` | 一覧を取得（`q`＝検索語、`sort`＝`created_at` / `updated_at`、`order`＝`asc` / `desc`） | 200 |
| POST | `/api/memos` | メモを登録 | 201 |
| GET | `/api/memos/<id>` | 1件を取得 | 200 |
| PUT | `/api/memos/<id>` | メモを更新 | 200 |
| DELETE | `/api/memos/<id>` | メモを削除 | 200 |

タイトルか本文が空のときは `400`、存在しない ID を指定したときは `404` を返します。

## 起動手順

```bash
git clone https://github.com/yukon0809garden-commits/memo-app.git
cd memo-app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

ブラウザで http://127.0.0.1:5000 を開きます。

## 仕組みのポイント

- SQL に入れる値は `?`（プレースホルダ）で渡し、SQL インジェクションを防いでいます。
- 並べ替えの列名はプレースホルダで渡せないため、`created_at` と `updated_at` だけを許可するホワイトリストで制限しています。
- データベースファイル（`memo.db`）と仮想環境（`venv/`）は `.gitignore` で公開対象から外しています。

## 使用技術

- Python 3 / Flask 3.1
- SQLite
- HTML / CSS / JavaScript
- Git / GitHub（ブランチを作成し、プルリクエストで main にマージ）
