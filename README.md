# Malaysia 旅行英語 + マレー語アプリ

マレーシア旅行前の英語・マレー語練習アプリです。

## 起動方法

### Windows
`start.bat` をダブルクリック。

Node.js → Python → PowerShell の順で自動検出してサーバを起動します。  
**Node.js も Python もなくても、Windows標準の PowerShell だけで動きます。**

### Mac / Linux
```bash
# 初回のみ（実行権限を付与）
chmod +x start.sh

# 起動
./start.sh
```
または Finder で `start.sh` をダブルクリック。

起動するとブラウザが自動で開きます（http://localhost:8080）。

---

## 主な機能

| 機能 | 説明 |
|------|------|
| フレーズ集 | シーン別フレーズを英語・マレー語の音声つきで確認 |
| クイズ（英語） | リスニング4択 / 英語発音チェック / スピーキング確認 |
| クイズ（マレー語） | **マレー語リスニング4択** / **マレー語スピーキング練習** |
| AIロールプレイ | Anthropic APIを使ったシーン別英語会話練習 |
| ブックマーク | 苦手なフレーズをまとめて復習 |
| 今日のフレーズ | 毎回起動時にランダムで1フレーズをピックアップ |
| マレーシア豆知識 | チップ・配車アプリ・宗教・食事などの旅行情報 |

---

## 必要なもの

**Windows の場合は何もインストール不要**（PowerShell が使えれば起動できます）。

Mac / Linux の場合は Node.js か Python 3 のどちらか一方があれば動きます。

| ツール | ダウンロード |
|--------|-------------|
| Node.js（推奨） | https://nodejs.org/ |
| Python 3 | https://www.python.org/ |

---

## ディレクトリ構成

```
malaysia-app/
├── index.html          # エントリーポイント
├── start.bat           # 起動スクリプト（Windows）
├── start.sh            # 起動スクリプト（Mac/Linux）
├── server.ps1          # PowerShell HTTP サーバー（Windows用）
├── server.js           # Node.js HTTP サーバー
├── build.js            # 1ファイルにまとめるビルドスクリプト
├── css/
│   ├── base.css        # CSS変数・リセット・アニメーション
│   ├── layout.css      # サイドバー・メインレイアウト・コストメーター
│   ├── components.css  # ボタン・カード・バッジ等の共通部品
│   └── pages.css       # 各ページ固有のスタイル
├── js/
│   ├── data.js         # フレーズ・シナリオ・豆知識データ（編集はここ）
│   ├── state.js        # アプリ全体の状態管理
│   ├── speech.js       # 音声合成・音声認識（Web Speech API + ResponsiveVoice）
│   ├── cost.js         # API料金計算・サイドバーメーター表示（月次永続化）
│   ├── router.js       # ページ遷移
│   ├── phrases.js      # フレーズ集・ブックマーク・今日のフレーズ
│   ├── quiz.js         # クイズ（英語/マレー語 リスニング・発音・スピーキング）
│   ├── roleplay.js     # AIロールプレイ・Anthropic API呼び出し
│   ├── tips.js         # 豆知識ページ描画
│   └── app.js          # 初期化・モジュール間の配線
└── test/
    ├── unit.test.js        # 単体テスト（データ・ロジック）
    ├── integration.test.js # 結合テスト
    └── ui.test.js          # UIテスト
```

---

## よく編集するファイル

### フレーズを追加したい → `js/data.js`
```js
// PHRASES 配列にオブジェクトを追加するだけ
{ id: 35, scene: 'restaurant', jp: '水をください', en: 'Can I have some water?', kana: 'ボレ ミンタ アイル?', ms: 'Boleh minta air?' },
```

`scene` に指定できる値: `greeting` / `airport` / `hotel` / `restaurant` / `shopping` / `transport`

### 豆知識を追加したい → `js/data.js`
```js
// TIPS 配列にオブジェクトを追加
{ icon: '🦟', cat: '健康', title: '蚊に注意', body: 'デング熱対策として虫除けスプレーを持参しましょう。' },
```

### 色を変えたい → `css/base.css`
```css
:root {
  --teal: #1D8B6F;   /* メインカラー */
  --bg:   #F7F4EF;   /* 背景色 */
}
```

---

## AIロールプレイを使う場合

1. [Anthropic Console](https://console.anthropic.com) でAPIキーを取得
2. アプリ左下の「Anthropic API Key」欄に入力
3. APIを使うたびにサイドバーで料金がリアルタイム表示されます（月次で自動リセット）

料金の目安: 1回の会話（数往復）≒ **約0.1〜0.3円**

---

## テストの実行

```bash
node test/unit.test.js
node test/integration.test.js
node test/ui.test.js
```

---

## 1ファイルにまとめたい場合（サーバーなしで動かす）

```bash
node build.js
# → dist/index.html が生成されます（ダブルクリックで開ける）
```
