# 旧Wixドメインからの移行

## 現状

- 新ドメイン `https://windwoods-stayble.com/` はGitHub Pagesへ正しく接続されている。
- 旧ドメイン `ww-sapporo-minpaku.com` の転送は、Netlifyの専用サイト `windwoods-legacy-redirect` に配置した。2026年10月2日に転送サイトを公開し、旧URLの301応答を確認した。
- 同日にWix DNSのルートAを `75.2.60.5`、www CNAMEを `windwoods-legacy-redirect.netlify.app` に変更。Wixの権威DNSで両方の新しい値を確認した。DNSキャッシュの反映には時間差がある。
- NetlifyのHTTPS証明書は2026年10月2日に発行済み。`www` あり・なしの両方を含む。Netlifyへ直接接続した確認では、HTTPSの旧URLが301を返した。
- 公開RDAPの旧登録有効期限は**2026年10月22日**。同日ユーザー提供のWix管理画面でも、有効期限10月22日・自動更新オフ・サイト未接続を確認。その後ユーザーがドメイン登録だけを1年延長し、公開RDAPでも**2027年10月22日**へ更新されたことを確認した。Wixのサイトプラン解約とドメイン契約は別。
- Gmailフッターの旧リンク問題は設定URLの修正で解決済みだが、検索エンジンや外部サイトが保持する旧URLの移行は別問題。

## 最低限の転送

| 旧URL | 新URL | 種別 |
|---|---|---|
| `https://ww-sapporo-minpaku.com/` | `https://windwoods-stayble.com/sapporo/` | 301 permanent |
| `https://www.ww-sapporo-minpaku.com/` | `https://windwoods-stayble.com/sapporo/` | 301 permanent |

旧サイトの他URLは、旧Search Consoleの「ページ」、外部リンク、過去sitemap、アクセス解析から一覧を取得し、内容が最も近い新URLへ1対1で割り当てる。無関係な旧URLをすべてトップへ転送するとsoft 404として扱われる可能性があるため、一覧を確認せず一括転送しない。

2026年10月1日にInternet Archive CDXの200応答履歴から確認できた旧URLは次のとおり。転送用の具体的な設定は `ops/legacy-redirect/_redirects` に置く。

| 旧パス | 対応する新コンテンツ |
|---|---|
| `/` | `/sapporo/` |
| `/お問い合わせ` | `/sapporo/#estimate-reservation` |
| `/ゴミ` | `/sapporo/#garbage` |
| `/リネン` | `/sapporo/#linen` |
| `/他社と比較` | `/sapporo/#prices`（料金の判断材料） |
| `/会社概要` | `/sapporo/#company` |
| `/消耗品` | `/sapporo/#consumables` |
| `/chitose-minpaku-seiso` | `/chitose/` |

この一覧が旧サイトの全URLとは限らない。旧Search Consoleのページ・リンク一覧が取得できたら追加する。

## 実施方法と設定

旧Wixサイトを復活させる必要はない。旧ドメインだけ保持し、HTTP 301を返す軽量な転送用ホストへ向ける。

**Wixで購入したドメインはネームサーバーを直接変更できない**。旧ドメインのDNSはWixのまま、NetlifyへのA/CNAMEポインティングを採用した。転送設定は `ops/legacy-redirect/_redirects`、公開先は [Netlifyの転送専用プロジェクト](https://app.netlify.com/projects/windwoods-legacy-redirect)。変更時は同ディレクトリをNetlifyへ再デプロイする。

旧Wixサイトのサイトプランを再契約する必要はない。ドメイン更新とDNS管理はWix、301転送とHTTPSはNetlifyが担当する。

確認条件：

```text
旧URL → HTTP 301 → 対応する https://windwoods-stayble.com/... → HTTP 200
```

- パスとクエリは可能な限り保持する。
- JavaScript転送、meta refresh、302は使わない。
- 旧ドメインの証明書を有効にし、HTTPとHTTPS、wwwあり・なしの全入口を転送する。
- 少なくとも検索移行が落ち着くまで長期間維持する。
