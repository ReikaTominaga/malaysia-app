/* ============================================================
   data.js — Static app data
   Phrases, scenes, roleplay scenarios, tips
   ============================================================ */

'use strict';

const PHRASES = [
  // Greeting / Basic
  // kana は「マレー語をカタカナで読む」発音ガイドです
  // マレー語の末尾子音（k/p/t）は詰まる音（ッ）で表記しています
  { id:1,  scene:'greeting',    jp:'こんにちは',               en:'Hello',                              kana:'ハロー',                                   ms:'Helo' },
  { id:2,  scene:'greeting',    jp:'おはようございます',       en:'Good morning',                       kana:'スラマッ パギ',                             ms:'Selamat pagi' },
  { id:3,  scene:'greeting',    jp:'こんばんは',               en:'Good evening',                       kana:'スラマッ プタン',                           ms:'Selamat petang' },
  { id:4,  scene:'greeting',    jp:'ありがとうございます',     en:'Thank you',                          kana:'テリマ カシ',                               ms:'Terima kasih' },
  { id:5,  scene:'greeting',    jp:'すみません',               en:'Excuse me',                          kana:'マーフ',                                   ms:'Maaf' },
  { id:6,  scene:'greeting',    jp:'わかりません',             en:"I don't understand",                 kana:'ティダッ ファハム',                         ms:'Tidak faham' },
  { id:7,  scene:'greeting',    jp:'もう一度お願いします',     en:'Could you repeat that?',             kana:'ボレ ウラン?',                             ms:'Boleh ulang?' },
  { id:8,  scene:'greeting',    jp:'英語は話せますか？',       en:'Do you speak English?',              kana:'ボレ チャカッ バハサ イングリス?',          ms:'Boleh cakap Bahasa Inggeris?' },
  // Airport
  { id:9,  scene:'airport',     jp:'出口はどこですか？',       en:'Where is the exit?',                 kana:'ディ マナ ピントゥ クルア?',               ms:'Di mana pintu keluar?' },
  { id:10, scene:'airport',     jp:'荷物受け取りはどこですか？', en:'Where can I collect my luggage?',   kana:'ディ マナ ボレ アンビル バガシ?',          ms:'Di mana boleh ambil bagasi?' },
  { id:11, scene:'airport',     jp:'タクシー乗り場はどこですか？', en:'Where is the taxi stand?',        kana:'ディ マナ テクシ?',                        ms:'Di mana teksi?' },
  { id:12, scene:'airport',     jp:'何日間滞在しますか？',     en:'How long will you stay?',            kana:'ブラパ ラマ ティンガル?',                  ms:'Berapa lama tinggal?' },
  { id:13, scene:'airport',     jp:'観光目的です',             en:'I\'m here for sightseeing',          kana:'サヤ ダタン ウントッ プランチョンガン',     ms:'Saya datang untuk pelancongan' },
  // Hotel
  { id:14, scene:'hotel',       jp:'チェックインをお願いします', en:'I\'d like to check in, please',    kana:'サヤ ナッ チェックイン',                   ms:'Saya nak check in' },
  { id:15, scene:'hotel',       jp:'予約をしています',         en:'I have a reservation',               kana:'サヤ アダ テンパハン',                     ms:'Saya ada tempahan' },
  { id:16, scene:'hotel',       jp:'Wi-Fiのパスワードは？',    en:'What\'s the Wi-Fi password?',        kana:'アパ パスワード ワイファイ?',              ms:'Apa password wifi?' },
  { id:17, scene:'hotel',       jp:'朝食は含まれていますか？', en:'Is breakfast included?',             kana:'サラパン パギ テルマスッ?',               ms:'Sarapan pagi termasuk?' },
  { id:18, scene:'hotel',       jp:'チェックアウトは何時ですか？', en:'What time is check-out?',         kana:'プクル ブラパ チェックアウト?',            ms:'Pukul berapa check out?' },
  // Restaurant
  { id:19, scene:'restaurant',  jp:'1名ですがテーブルはありますか？', en:'Do you have a table for one?', kana:'アダ メジャ ウントッ スオラン?',           ms:'Ada meja untuk seorang?' },
  { id:20, scene:'restaurant',  jp:'これをください',           en:'I\'ll have this, please',            kana:'サヤ ナッ イニ',                           ms:'Saya nak ini' },
  { id:21, scene:'restaurant',  jp:'辛さ控えめにしてください', en:'Not too spicy, please',              kana:'ジャンガン テルラル ペダス',               ms:'Jangan terlalu pedas' },
  { id:22, scene:'restaurant',  jp:'お会計をお願いします',     en:'Could I have the bill, please?',     kana:'ボレ バワ ビル?',                         ms:'Boleh bawa bil?' },
  { id:23, scene:'restaurant',  jp:'おいしいです',             en:'It\'s delicious',                    kana:'スダッ',                                  ms:'Sedap' },
  { id:24, scene:'restaurant',  jp:'ハラール料理ですか？',     en:'Is this halal?',                     kana:'イニ ハラール?',                          ms:'Ini halal?' },
  // Shopping
  { id:25, scene:'shopping',    jp:'いくらですか？',           en:'How much is this?',                  kana:'ブラパ ハルガ?',                          ms:'Berapa harga?' },
  { id:26, scene:'shopping',    jp:'試着してもいいですか？',   en:'Can I try this on?',                 kana:'ボレ サヤ チュバ?',                       ms:'Boleh saya cuba?' },
  { id:27, scene:'shopping',    jp:'もう少し安くなりますか？', en:'Can you give me a discount?',        kana:'ボレ クラン ハルガ?',                     ms:'Boleh kurang harga?' },
  { id:28, scene:'shopping',    jp:'これをください',           en:'I\'ll take this',                    kana:'サヤ ナッ アンビル イニ',                 ms:'Saya nak ambil ini' },
  { id:29, scene:'shopping',    jp:'袋に入れてください',       en:'Can I get a bag?',                   kana:'ボレ ミンタ プラスティッ?',              ms:'Boleh minta plastik?' },
  // Transport
  { id:30, scene:'transport',   jp:'〜へ行きたいです',         en:'I\'d like to go to ~',               kana:'サヤ ナッ ペルギ 〜',                     ms:'Saya nak pergi ~' },
  { id:31, scene:'transport',   jp:'ここで止めてください',     en:'Please stop here',                   kana:'ブレンティ ディシニ',                     ms:'Berhenti di sini' },
  { id:32, scene:'transport',   jp:'電車の駅はどこですか？',   en:'Where is the train station?',        kana:'ディ マナ ステセン?',                     ms:'Di mana stesen?' },
  { id:33, scene:'transport',   jp:'Grabで行きます',           en:'I\'ll take a Grab',                  kana:'サヤ ナッ ナイッ グラッ',                ms:'Saya nak naik Grab' },
  { id:34, scene:'transport',   jp:'迷子になりました',         en:'I\'m lost',                          kana:'サヤ テルセサッ',                         ms:'Saya tersasat' },
];

const SCENES = [
  { id:'greeting',   label:'挨拶・基本' },
  { id:'airport',    label:'空港' },
  { id:'hotel',      label:'ホテル' },
  { id:'restaurant', label:'レストラン' },
  { id:'shopping',   label:'ショッピング' },
  { id:'transport',  label:'交通・移動' },
];

const SCENARIOS = [
  { id:'restaurant', icon:'🍽️', title:'レストランで注文',     desc:'料理を注文・席を確保する',         prompts:['テーブルをお願いする','おすすめを聞く','辛さを調整する','お会計をする'] },
  { id:'hotel',      icon:'🏨', title:'ホテルにチェックイン', desc:'チェックイン・部屋の確認',          prompts:['予約を伝える','部屋の設備を確認','困ったことを相談','チェックアウト時間を聞く'] },
  { id:'shopping',   icon:'🛍️', title:'ショッピング',         desc:'値段を聞く・交渉・購入する',        prompts:['価格を聞く','値段交渉する','試着をお願いする','別のサイズを頼む'] },
  { id:'transport',  icon:'🚖', title:'タクシー・Grab',        desc:'目的地を伝える・道を確認する',      prompts:['目的地を伝える','到着時間を聞く','迷ったことを伝える','止めてもらう'] },
  { id:'airport',    icon:'✈️', title:'空港・入国審査',        desc:'入国審査・荷物受け取りなど',         prompts:['滞在日数を答える','目的を伝える','荷物の場所を聞く','出口を探す'] },
  { id:'trouble',    icon:'🆘', title:'トラブル対応',          desc:'困ったときに助けを求める',           prompts:['道に迷った','体調不良を伝える','物をなくした','助けを求める'] },
];

const TIPS = [
  { icon:'💳', cat:'お金・支払い',   title:'チップは基本不要',       body:'マレーシアはチップ文化がありません。高級レストランではサービス料（10%）が自動加算されることがあります。支払いはRinggit（RM）。1RM≒約33円（変動あり）。' },
  { icon:'📱', cat:'移動',           title:'GrabアプリがMUST',        body:'東南アジアのUber的な配車アプリ。クアラルンプールでは必須です。事前に料金がわかるので安心。ドライバーとの英語やり取りも最小限で済みます。' },
  { icon:'🕌', cat:'文化・宗教',     title:'イスラム教が国教',        body:'人口の約60%がムスリム。ハラール（食事制限）に注意。豚肉・アルコールを扱わない店が多い。モスクや宗教施設では肌を隠す服装が必要です。' },
  { icon:'🌶️', cat:'食事',           title:'マレー料理は辛い',        body:'Nasi Lemak、Roti Canai、Laksaが定番。辛さが心配なら「Not too spicy please」と伝えよう。屋台飯は安くておいしい！' },
  { icon:'🌡️', cat:'気候',           title:'常夏・スコールに注意',    body:'年間を通じて気温28〜35℃。突然のスコール（雷雨）があります。折りたたみ傘は必携。室内はエアコンが強いので上着も持参を。' },
  { icon:'🛒', cat:'ショッピング',   title:'値引き交渉はOK',          body:'屋台や市場では値段交渉が普通。「Boleh kurang?（ボレ クラン）＝安くなる？」と聞いてみましょう。ショッピングモールは定価制。' },
  { icon:'🚰', cat:'健康',           title:'水道水は飲まない',        body:'水道水は直接飲まないこと。ペットボトルの水を使いましょう。コンビニ（7-Eleven）で安く購入できます。' },
  { icon:'📶', cat:'通信',           title:'SIMはすぐ買える',         body:'空港やコンビニでプリペイドSIMが購入可能。Maxis、Celcom、Digi等が主要キャリア。7日間データ使い放題が約1,000円前後。' },
  { icon:'🙏', cat:'マナー',         title:'左手は使わないが基本',    body:'イスラム文化では左手は不浄とされます。物を渡す・受け取る際は右手で。また人前で感情的になることはマナー違反とされます。' },
  { icon:'🏥', cat:'緊急連絡先',     title:'緊急時は999',             body:'警察・消防・救急は999（日本の119/110に相当）。日本大使館：+60-3-2177-2600。旅行保険加入を強く推奨。スリや置き引きに注意。' },
];

// Role label for each scenario
const SCENARIO_ROLES = {
  restaurant: 'a friendly restaurant staff member in a Malaysian café',
  hotel:      'a professional hotel receptionist at a Malaysian hotel',
  shopping:   'a shop assistant at a Malaysian market or mall',
  transport:  'a Grab/taxi driver in Kuala Lumpur',
  airport:    'a Malaysian immigration or airport staff officer',
  trouble:    'a helpful local Malaysian person',
};
