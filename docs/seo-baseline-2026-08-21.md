# SEO / LLMO 基準値と改善仮説 — 2026-08-21

## 目的

2026年8月21日の公開状態を基準値として保存し、今回の改善を同じ条件で再計測する。検索順位だけでなく、非指名の表示回数、クリック、問い合わせ、AI検索での引用、表示速度を分けて評価する。

## 前回実装からの差分

- サイト公開・Google Search Console確認：2026-06-25（commit `721197c` / `25120e4`）
- 札幌公開・sitemap追加：2026-06-25（commit `f7997db`）
- 恵庭へのエリア構成更新：2026-07-04（commit `12dce00`）
- ファビコン統一：2026-08-02（commit `273534a`）
- 今回の基準日：2026-08-21
- エリア構成の最終更新から48日、ファビコン更新から19日が経過した状態を監査した。

## 公開検索の観測値

個人履歴に依存しない公開検索サンプルで、次の5クエリを2026年8月21日に確認した。

| クエリ | WindWoodsの検出 |
|---|---:|
| 札幌 民泊 清掃 | 返却された主要結果内で未検出 |
| 千歳 民泊 清掃 | 返却された主要結果内で未検出 |
| 小樽 民泊 清掃 | 返却された主要結果内で未検出 |
| 北広島 民泊 清掃 | 返却された主要結果内で未検出 |
| 恵庭 民泊 清掃 | 返却された主要結果内で未検出 |

- 広域・非指名5クエリの検出：0 / 5。
- ブランド名・サイト指定では新ドメインのトップと札幌ページを確認できた。発見・インデックス自体は始まっているが、非指名の地域意図では競合が優勢。
- これは検索結果の一時点サンプルであり、Google Search Consoleの平均掲載順位とは別物。再測定時も同じクエリ・同じ方法で比較する。
- 旧WixドメインはWixの接続案内・404状態で、旧URLから新ドメインへの301転送は確認できなかった。旧サイトが得ていた被リンク・履歴・指名シグナルが自動では継承されない状態。

## Lighthouse実測

設定：Lighthouse mobile、Performance / SEO / Accessibility / Best Practices。変更前は公開URL、変更後は同一PC上のローカル配信。ネットワーク環境が異なるため、公開後に再度公開URLを測定して確定値とする。

| 対象 | 状態 | Performance | SEO | Accessibility | Best Practices | FCP | LCP | TBT | CLS | 転送量 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| トップ | 変更前・公開 | 63 | 100 | 100 | 100 | 4.9秒 | 19.5秒 | 0ms | 0.001 | 3,110KiB |
| トップ | 変更後・ローカル | 94 | 100 | 100 | 100 | 2.1秒 | 2.4秒 | 160ms | 0 | 84KiB |
| 札幌 | 変更前・公開 | 68 | 100 | 100 | 100 | 2.5秒 | 10.4秒 | 150ms | 0.001 | 2,054KiB |
| 札幌 | 変更後・ローカル | 90 | 100 | 100 | 100 | 2.6秒 | 2.8秒 | 110ms | 0 | 153KiB |

主な変更は、約1.7MBのトップPNG、約688KBのヘッダーロゴ、エリアヒーロー、リネン画像を軽量化し、外部Webフォントと初期TimeRex読込を表示経路から外したこと。トップの転送量は約97%、札幌は約93%減る見込み。

## ページ監査の変更前 / 変更後

| 指標 | 変更前 | 変更後 |
|---|---:|---:|
| index可能・自己canonicalあり | 6 / 6 | 6 / 6 |
| 地域名をH1に含むエリアページ | 0 / 5 | 5 / 5 |
| ページ固有OG画像 | 0 / 6 | 6 / 6 |
| 可視FAQが4件以上 | 0 / 6 | 6 / 6 |
| 地域を別実店舗として表すLocalBusiness | 5 / 5 | 0 / 5 |
| Organizationをproviderとする地域Service | 0 / 5 | 5 / 5 |
| 問い合わせの初回流入計測 | なし | あり |
| IndexNow再送手段 | なし | あり |

## 仮説と評価指標

1. H1、可視FAQ、地域固有の回答を一致させると「地域名＋民泊清掃」「地域名＋リネン」「地区名＋民泊清掃」の非指名表示回数が増える。
2. 1社・1Organizationと、各地域へのServiceという実態どおりの構造にすると、検索エンジンとAI検索が会社・サービス・対応地域を混同しにくくなる。
3. LCPと転送量の改善により、モバイル離脱とクロール時の負荷が下がる。まずLCP 2.5秒前後、Performance 90前後を公開URLでも維持する。
4. ページ固有OG画像により、メール・SNS・メッセージ経由で共有された際の地域誤認が減る。これは主にクリック後・共有時の改善で、直接の順位要因とは見なさない。
5. IndexNowによりBing、Yahooおよび参加検索サービスの更新検出が早まる。ただし掲載・順位は保証されない。
6. 最大の移行課題は旧ドメインからの301。これが未実施のままだと、旧LPの蓄積を新LPへ十分に移せない可能性が高い。

## 所有者データの未取得項目

Search Consoleのサインイン済みブラウザーまたはAPI資格情報がこの作業環境になかったため、次の値は推測せず未取得とした。

- 2026-07-25〜2026-08-21のクリック、表示回数、CTR、平均掲載順位
- クエリ別、ページ別、デバイス別、検索での見え方別の内訳
- Search Consoleの生成AIパフォーマンスレポート（プロパティに提供されている場合）
- Bing Webmaster Toolsの検索パフォーマンス、AI Performanceの引用数・引用ページ・grounding query
- 同期間の問い合わせ総数と問い合わせ率

## 9月末の再測定

再測定日：2026-09-30。

1. Search Consoleで「検索タイプ：ウェブ」「国：日本」を基本に、2026-09-03〜2026-09-30と2026-07-25〜2026-08-21を比較する。
2. クリック、表示回数、CTR、平均掲載順位を全体・クエリ・ページ・デバイスでCSV出力する。指名（WindWoods / Stayble）と非指名を分ける。
3. 利用可能ならSearch Consoleの生成AIレポート、Bing Webmaster ToolsのAI Performanceも同じ28日間で出力する。
4. 上記5つの地域クエリと「札幌 民泊清掃 リネン」「千歳 民泊清掃 リネン」を同じ公開検索方法で確認する。
5. トップと札幌を公開URLでLighthouse mobile各3回測り、中央値を保存する。
6. 8月22日以降の問い合わせメールから、traffic_source、first_landing_page、first_area、UTMを集計する。概算試行は計測対象外。
7. 旧ドメイン301、Googleビジネスプロフィール、Bing Placesの実施有無を併記し、サイト内変更と外部施策を混同しない。

## 再現コマンド

```powershell
node scripts/seo-audit.mjs
node scripts/generate-web-images.mjs
node scripts/generate-og-images.mjs
node scripts/submit-indexnow.mjs
```

Lighthouseは公開後に次の条件で実行する。

```powershell
$env:CHROME_PATH='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
npx --yes lighthouse@latest https://windwoods-stayble.com/ --quiet --output=json --output-path=lighthouse-home.json --form-factor=mobile --only-categories=performance,seo,accessibility,best-practices
npx --yes lighthouse@latest https://windwoods-stayble.com/sapporo/ --quiet --output=json --output-path=lighthouse-sapporo.json --form-factor=mobile --only-categories=performance,seo,accessibility,best-practices
```

## 2026年8月時点の公式参照

- Google Search Central: AI検索の最適化ガイド — https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google Search Central: AI機能とサイト — https://developers.google.com/search/docs/appearance/ai-features
- Google Search status updates: FAQ rich resultsの廃止 — https://developers.google.com/search/updates
- Google Search Central: sitemapの作成と送信 — https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google Search Central: LocalBusiness構造化データ — https://developers.google.com/search/docs/appearance/structured-data/local-business
- Google Search Central: Search Console生成AIパフォーマンス — https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- Bing Webmaster Blog: AI Performance public preview — https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview
- IndexNow: 公式仕様 — https://www.indexnow.org/documentation
