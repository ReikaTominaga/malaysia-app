# Malaysia 旅行英語 + マレー語アプリ

マレーシア旅行前の英語・マレー語練習アプリです。

## 起動方法

**`index.html` をダブルクリックするだけ。**  
Node.js・Python・サーバー不要です。Chrome推奨。

---

## 主な機能

| 機能 | 説明 |
|------|------|
| フレーズ集 | シーン別フレーズを英語・マレー語の音声つきで確認 |
| クイズ（英語） | リスニング4択 / 英語発音チェック / スピーキング確認 |
| クイズ（マレー語） | マレー語リスニング4択 / マレー語スピーキング練習 |
| AIロールプレイ | Anthropic APIを使ったシーン別英語会話練習 |
| ブックマーク | 苦手なフレーズをまとめて復習 |
| 今日のフレーズ | 毎回起動時にランダムで1フレーズをピックアップ |
| マレーシア豆知識 | チップ・配車アプリ・宗教・食事などの旅行情報 |

---

## ディレクトリ構成

```
malaysia-app/
├── index.html          # エントリーポイント（これを開くだけ）
├── css/
│   ├── base.css        # CSS変数・リセット・アニメーション
│   ├── layout.css      # サイドバー・メインレイアウト
│   ├── components.css  # ボタン・カード等の共通部品
│   ├── pages.css       # 各ページ固有のスタイル
│   └── mobile.css      # スマホ対応レスポンシブスタイル
├── js/
│   ├── data.js         # フレーズ・シナリオ・豆知識データ（編集はここ）
│   ├── state.js        # アプリ全体の状態管理
│   ├── speech.js       # 音声合成・音声認識（Web Speech API）
│   ├── cost.js         # API料金計算・サイドバーメーター（月次永続化）
│   ├── router.js       # ページ遷移
│   ├── phrases.js      # フレーズ集・ブックマーク・今日のフレーズ
│   ├── quiz.js         # クイズ（英語/マレー語）
│   ├── roleplay.js     # AIロールプレイ・Anthropic API呼び出し
│   ├── tips.js         # 豆知識ページ
│   └── app.js          # 初期化・配線
└── test/               # テストファイル
```

---

## よく編集するファイル

### フレーズを追加したい → `js/data.js`
```js
{ id: 35, scene: 'restaurant', jp: '水をください', en: 'Can I have some water?', kana: 'ボレ ミンタ アイル?', ms: 'Boleh minta air?' },
```
`scene` に指定できる値: `greeting` / `airport` / `hotel` / `restaurant` / `shopping` / `transport`

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
