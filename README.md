# README — stayble-windwoods

WindWoods（民泊・バケーションレンタル清掃管理サービス／運営：株式会社Stayble）の集客LP。

## 概要
- **ドメイン**：windwoods-stayble.com
- **ホスティング**：GitHub Pages（独自ドメインをCNAMEで割当。github.io は使わない）
- **構成**：1ドメイン・エリア別サブディレクトリ（`/sapporo` `/chitose` `/otaru` `/kitahiroshima` `/eniwa`）
- **静的サイト**：HTML/CSS/JS。サーバー機能は外部サービスで補う（フォーム送信・予約・概算はJS）

## ドキュメント（codexはまずAGENTS.mdを読む）
| ファイル | 内容 |
|---|---|
| `AGENTS.md` | codexの司令塔。ルール・doorway回避・機能フロー・分担 |
| `BUSINESS.md` | 事実の正典。会社・サービス・料金・運用・エリア情報 |
| `UIDESIGN.md` | デザイン仕様。色・フォント・レイアウト・LP構成 |
| `SEO.md` | SEOルールと定期運用 |

## 使用する外部サービス
- **フォーム送信**：Web3Forms（`backoffice@windwoods-stayble.com` 宛）
- **予約**：TimeRex（無料枠、Googleカレンダー連携、ダブルブッキング防止、埋め込み）
- **概算見積もり**：自前JavaScript（サーバー不要）

## デプロイ
- `main` ブランチへ push すると GitHub Pages が反映。
- 独自ドメインは `CNAME` ファイル＋ドメイン側DNS設定（DNSはユーザー作業）。

## 役割分担
- **codex**：HTML/CSS/JS・フォルダ構成・概算計算・CNAME作成・SEO実装・埋め込み設置・定期更新
- **ユーザー**：GitHubリポジトリ作成／Pages有効化／**DNS設定**／フォーム・TimeRexのアカウント登録とキー取得／ロゴ・写真・概要書PDFの配置

## 進行順
1. ❶ 清掃LP（このリポジトリ）：千歳 → 北広島・小樽・札幌・恵庭
2. ❷ 管理事業（別リポジトリ minpaku.stayble.jp）
3. ❸ 旧Wixからの移行判断（必要に応じて301リダイレクト等を別途実施）

## 配置済みアセット
- `assets/logo-mark.png`（ヘッダー用Wマーク）
- `assets/logo-full.png`（W＋WIND WOODS完全体）
- `assets/service-overview.pdf`（※未配置の場合はユーザーが追加）
