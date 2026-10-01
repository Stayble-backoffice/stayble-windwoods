# 旧ドメイン専用301転送

このディレクトリだけをNetlifyの公開ディレクトリとして配置し、`ww-sapporo-minpaku.com` と `www.ww-sapporo-minpaku.com` を同じサイトに割り当てる。現行LPの公開先は引き続きGitHub Pages。

NetlifyへGitHubリポジトリを接続する場合、リポジトリ直下の `netlify.toml` がこのディレクトリのみを公開する。FreeプランはカスタムドメインとHTTPSに対応するが、月間クレジット上限に達するとサイトが一時停止するため、運用開始後は使用量を確認する。

Wixで購入した旧ドメインはNSを直接変更できないため、Wix DNSのルートAとwww CNAMEを、Netlifyが管理画面で指定する接続先へ向ける。DNS変更前にNetlify側のドメイン割当とHTTPS設定を準備する。Wix側の旧A・CNAMEは新レコードと競合しないよう入れ替える。ドメインのMX・TXTなどウェブ転送と無関係なレコードは保持する。

公開後、HTTP/HTTPSとwwwあり・なしの旧URLで、単一または短い301連鎖を経て対応する新URLが200を返すことを確認する。旧Search ConsoleのURL一覧が得られたら `_redirects` を追記する。無関係なURLを札幌トップへ一括転送しない。
