# 旧Wixドメインからの移行 — ユーザー作業

## 現状

- 新ドメイン `https://windwoods-stayble.com/` はGitHub Pagesへ正しく接続されている。
- 旧ドメイン `ww-sapporo-minpaku.com` はWix側の接続案内・404状態で、新ドメインへのサーバー側301リダイレクトを確認できない。
- Gmailフッターの旧リンク問題は設定URLの修正で解決済みだが、検索エンジンや外部サイトが保持する旧URLの移行は別問題。

## 最低限の転送

| 旧URL | 新URL | 種別 |
|---|---|---|
| `https://ww-sapporo-minpaku.com/` | `https://windwoods-stayble.com/sapporo/` | 301 permanent |
| `https://www.ww-sapporo-minpaku.com/` | `https://windwoods-stayble.com/sapporo/` | 301 permanent |

旧サイトの他URLは、旧Search Consoleの「ページ」、外部リンク、過去sitemap、アクセス解析から一覧を取得し、内容が最も近い新URLへ1対1で割り当てる。無関係な旧URLをすべてトップへ転送するとsoft 404として扱われる可能性があるため、一覧を確認せず一括転送しない。

## 実施方法

Wix契約がなくWix側で転送を維持できない場合は、旧ドメインのDNSをCloudflare Pages、Cloudflare Redirect Rules、または同等の301対応サービスへ向ける。DNS変更はAGENTS.mdの役割分担によりユーザー作業。

確認条件：

```text
旧URL → HTTP 301 → 対応する https://windwoods-stayble.com/... → HTTP 200
```

- パスとクエリは可能な限り保持する。
- JavaScript転送、meta refresh、302は使わない。
- 旧ドメインの証明書を有効にし、HTTPとHTTPS、wwwあり・なしの全入口を転送する。
- 少なくとも検索移行が落ち着くまで長期間維持する。
