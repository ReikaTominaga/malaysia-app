#!/bin/bash
# ============================================================
# start.sh — Malaysia 旅行英語アプリ起動スクリプト（Mac / Linux）
# ダブルクリック または ターミナルで ./start.sh で起動
# ============================================================

PORT=8080
DIR="$(cd "$(dirname "$0")" && pwd)"

# ---- ブラウザを開く関数 ----
open_browser() {
  sleep 1
  if command -v open &>/dev/null; then
    open "http://localhost:$PORT"        # macOS
  elif command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:$PORT"   # Linux
  fi
}

echo ""
echo "  🇲🇾  Malaysia 旅行英語アプリ"
echo "  ================================"
echo "  URL: http://localhost:$PORT"
echo "  終了: Ctrl + C"
echo ""

open_browser &

# ---- Node.js で起動（server.js を使用）----
if command -v node &>/dev/null; then
  echo "  [Node.js] サーバー起動中..."
  cd "$DIR" && node server.js
  exit 0
fi

# ---- Python 3 で起動 ----
if command -v python3 &>/dev/null; then
  echo "  [Python 3] サーバー起動中..."
  cd "$DIR" && python3 -m http.server $PORT
  exit 0
fi

# ---- Python 2 で起動 ----
if command -v python &>/dev/null; then
  echo "  [Python 2] サーバー起動中..."
  cd "$DIR" && python -m SimpleHTTPServer $PORT
  exit 0
fi

# ---- 何もない場合 ----
echo "  ❌ エラー: Node.js または Python が見つかりません。"
echo ""
echo "  以下のいずれかをインストールしてください："
echo "  - Node.js:  https://nodejs.org/"
echo "  - Python 3: https://www.python.org/"
echo ""
read -p "  Enterキーで閉じる..."
exit 1
