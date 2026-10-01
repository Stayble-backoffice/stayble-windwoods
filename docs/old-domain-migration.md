# 旧Wixドメインからの移行 — ユーザー作業

## 現状

- 新ドメイン `https://windwoods-stayble.com/` はGitHub Pagesへ正しく接続されている。
- 旧ドメイン `ww-sapporo-minpaku.com` はWix側の接続案内・404状態で、新ドメインへのサーバー側301リダイレクトを確認できない。
- 2026年10月1日の再確認でも、`www` あり・なしのHTTPSトップはいずれもHTTP 404。DNSのNSは `ns2.wixdns.net` / `ns3.wixdns.net`、登録事業者はWix。
- 公開RDAPの登録有効期限は**2026年10月22日**。同日ユーザー提供のWix管理画面でも、有効期限10月22日・自動更新オフ・サイト未接続を確認。旧サイトの契約を戻さず、**ドメイン登録だけ期限前に延長**する。Wixのサイトプラン解約とドメイン契約は別。
- Gmailフッターの旧リンク問題は設定URLの修正で解決済みだが、検索エンジンや外部サイトが保持する旧URLの移行は別問題。

## 最低限の転送

| 旧URL | 新URL | 種別 |
|---|---|---|
| `https://ww-sapporo-minpaku.com/` | `https://windwoods-stayble.com/sapporo/` | 301 permanent |
| `https://www.ww-sapporo-minpaku.com/` | `https://windwoods-stayble.com/sapporo/` | 301 permanent |

旧サイトの他URLは、旧Search Consoleの「ページ」、外部リンク、過去sitemap、アクセス解析から一覧を取得し、内容が最も近い新URLへ1対1で割り当てる。無関係な旧URLをすべてトップへ転送するとsoft 404として扱われる可能性があるため、一覧を確認せず一括転送しない。

## 実施方法

旧Wixサイトを復活させる必要はない。旧ドメインだけ保持し、HTTP 301を返す軽量な転送用ホストへ向ける。

**Wixで購入したドメインはネームサーバーを直接変更できない**。Cloudflare Redirect Rulesを使うためにWixのNSをCloudflareへ変更する、という手順は不可。現実的な選択肢は次のとおり。

1. WixのDNS管理でA（ルート）とCNAME（www）を変更できるなら、外部DNSからの接続に対応する転送用ホスト（例：Netlify）へ向ける。Netlify側で旧URLごとの301とHTTPS証明書を設定する。これならレジストラを移管せずに済む。
2. WixのDNS管理が使えない、または将来DNSを自由に管理したいなら、旧ドメインを外部レジストラへ移管したうえでDNSと301を設定する。移管が完了するまでドメイン更新期限を切らさない。

最終手段としてWixのサイトプランを再契約してWix側で転送する方法はあるが、旧サイトを動かすための継続費用がかかるため、上記の方法を先に検討する。どの方法でもドメイン設定・支払いの本人操作はユーザー作業。こちらで転送ルールとURL対応表を用意する。

確認条件：

```text
旧URL → HTTP 301 → 対応する https://windwoods-stayble.com/... → HTTP 200
```

- パスとクエリは可能な限り保持する。
- JavaScript転送、meta refresh、302は使わない。
- 旧ドメインの証明書を有効にし、HTTPとHTTPS、wwwあり・なしの全入口を転送する。
- 少なくとも検索移行が落ち着くまで長期間維持する。
