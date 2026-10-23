# 清掃事業LPの復元手順

対象: `Stayble-backoffice/stayble-windwoods` の `main`。Stayble本体とは独立した清掃事業LPです。今回はWindowsで開発を継続します。

## 新しいPCで復元する

Gitを用意して、次のコマンドで取得します。

```sh
git clone https://github.com/Stayble-backoffice/stayble-windwoods.git
cd stayble-windwoods
git switch main
```

静的なHTML・CSS・JavaScriptと画像はGitに保存されています。npmによるビルドや、Stayble本体のサーバー・DBは不要です。

Pythonがインストール済みの場合は、次のローカルサーバーで確認できます。

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Windowsで `python` が利用できない場合は `py` を使用します。ブラウザーで `http://127.0.0.1:8080/` と、札幌・千歳・小樽・北広島・恵庭の各ページを確認します。終了はサーバーを起動したターミナルでCtrl+Cです。

## 公開と外部サービス

- `main` へのプッシュはGitHub Pagesの公開に連動します。
- ドメインは `windwoods-stayble.com`。`CNAME`、GitHub Pages設定、DNSの組み合わせで成立します。
- Web3Formsによる問い合わせ送信とTimeRexによる予約は外部サービスです。管理アカウント・通知先・予約枠の設定はサイトのcloneとは別に管理します。
- 復元確認で実際の問い合わせや予約を意図せず送らないでください。
- 公開リポジトリです。管理用の鍵、顧客情報、アクセス解析の生データは追加しません。

## 保存と整理

通常の作業場所は `C:\Users\hurin\stayble-windwoods` の1つです。2026-10-23に、未追跡だった2026-08-21のSEO・LLMO改善記録を確認し、Git管理へ追加しました。当時の測定結果・計画として扱ってください。

整理前の履歴と未保存ファイルはWindowsの `Documents/Stayble-recovery/2026-10-23/` にも保全しています。`tmp/` と `.audit/` はローカル調査用で、現行サイトのソースには不要です。
