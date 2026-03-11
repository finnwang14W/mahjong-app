import { useState, useEffect, useRef } from 'react';
import MahjongTile from './MahjongTile';

const TILE_BASE_W = 94; // sprite tile width at scale=1

function FitTilesRow({ tiles, maxScale = 0.28 }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      if (w > 0) setScale(Math.min(w / (tiles.length * TILE_BASE_W), maxScale));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tiles.length, maxScale]);

  return (
    <div ref={ref} style={{ display: 'flex', flexWrap: 'nowrap', overflow: 'hidden', width: '100%' }}>
      {tiles.map((t, i) => <MahjongTile key={i} tile={t} scale={scale} />)}
    </div>
  );
}

// ─── 多语言文案 ───────────────────────────────────────────────
const C = {
  zh: {
    intro: '别怕！麻将其实没那么难。跟着这 6 步，30 分钟上手！',
    step1: {
      title: '认识你的武器', sub: '牌型大全',
      suits: [
        { name: '万', color: '#c04000', desc: '数字牌（1–9万），最常见', tiles: [11,12,13,14,15,16,17,18,19] },
        { name: '条', color: '#2a6020', desc: '数字牌（1–9条）', tiles: [21,22,23,24,25,26,27,28,29] },
        { name: '筒', color: '#1a4848', desc: '数字牌（1–9筒）', tiles: [31,32,33,34,35,36,37,38,39] },
        { name: '风', color: '#3c1e6e', desc: '字牌：东、南、西、北', tiles: [41,42,43,44] },
        { name: '箭', color: '#9a2800', desc: '字牌：中（红中）、发（发财）、白（白板）', tiles: [45,46,47] },
      ],
    },
    step2: {
      title: '终极目标', sub: '胡牌万能公式',
      formula: ['3', '+', '3', '+', '3', '+', '3', '+', '2', '=', '胡!'],
      typeTitle: '「3」可以是：',
      types: [
        { name: '顺子', desc: '连续3张数字牌（同花色）', note: '⚠️ 风牌和箭牌无法组成顺子！', tiles: [11,12,13], tiles2: [33,34,35] },
        { name: '刻子', desc: '3张一模一样的牌（任何牌均可）', tiles: [15,15,15], tiles2: [46,46,46] },
      ],
      pairTitle: '「2」必须是：',
      pair: { name: '将牌', desc: '两张一模一样，又叫"对子"', tiles: [45,45] },
      demoTitle: '✅ 完整胡牌手牌长这样：',
      demoGroups: [
        { tiles: [11,12,13], label: '顺子' },
        { tiles: [33,34,35], label: '顺子' },
        { tiles: [46,46,46], label: '刻子' },
        { tiles: [41,41,41], label: '刻子' },
        { tiles: [45,45],    label: '将牌' },
      ],
      demoNote: '💡 4 组「3」不必都是顺子或都是刻子，可以自由组合——只要凑足 4 组 + 1 对将牌即可！',
    },
    step3: {
      title: '一回合怎么玩', sub: '摸牌与打牌',
      points: [
        { icon: '🀄', text: '你的手牌永远保持 13 张。' },
        { icon: '👆', text: '轮到你时：从牌墙摸 1 张 → 挑 1 张不需要的打出去。' },
        { icon: '🎉', text: '当你摸到"完美第14张"，或别人打出你最后缺的那张时——喊 胡！' },
      ],
    },
    step4: {
      title: '吃·碰·胡', sub: '三种核心操作',
      actions: [
        {
          emoji: '🍜', title: '吃牌',
          rule: '只能吃上一家（坐你左边的玩家）打出的牌',
          desc: '用来凑顺子（3张连续数字牌）。只要手里有一套顺子中的两张，就可以吃上一家打出的那张！',
          tiles: [11,12,13], tileLabel: '吃了一万 → 一二三万顺子',
          chiDetail: '举例：',
          chiSym: '＋吃',
          detailExamples: [
            { have: [12,13], chi: 11, result: [11,12,13] },
            { have: [12,13], chi: 14, result: [12,13,14] },
            { have: [13,15], chi: 14, result: [13,14,15] },
          ],
          color: '#1a4848',
        },
        {
          emoji: '👊', title: '碰牌',
          rule: '可以碰任意一家打出的牌',
          desc: '用来凑刻子（3张一模一样）',
          tiles: [46,46,46], tileLabel: '碰了发财 → 三个发财刻子',
          color: '#2a6020',
        },
        {
          emoji: '🎉', title: '胡牌',
          rule: '任意一家打出或自摸均可，不限上一家！',
          desc: '当你只差顺子（或刻子/将牌）中的某一张时，叫做"听牌"。无论是自己摸到，还是任意一位玩家（包括对家和下家）打出这张牌，都可以立刻喊"胡！"——完全不像吃牌那样限定上一家。',
          tiles: [12,13,14], tileLabel: '手有二三万，任意一家打出四万或自摸 → 顺子凑齐，胡！',
          color: '#9a2800',
        },
      ],
    },
    step5: {
      title: '动作优先级 & 特殊动作', sub: '重要规则，必须牢记',
      prioTitle: '⚡ 谁更优先？',
      prioItems: ['🏆 胡牌（最高）', '碰牌 / 杠牌', '吃牌（最低）'],
      prioNote: '多人要同一张牌时：优先级高的人先行。胡牌截断一切动作！',
      kongTitle: '🀄 杠牌（4张同一种牌）',
      kongTypes: [
        { name: '明杠', desc: '别人打出你有3张的牌 → 明杠！牌面朝上，对方看得见。' },
        { name: '暗杠', desc: '自己摸到第4张 → 暗杠！牌面朝下，神秘满分。' },
      ],
      kongTiles: [46,46,46,46], kongLabel: '4张发财 = 杠！',
      kongNote: '💡 杠牌的第 4 张牌不占手牌位置，手牌仍保持 13 张——宣杠后立刻从牌墙末尾补摸一张。',
      flowerTitle: '🌸 花牌（直接加分）',
      flowerDesc: '春夏秋冬、梅兰竹菊——摸到就直接亮出来，不占手牌，直接计番！',
      warning: '⚠️ 超重要！只要你杠牌了，或摸到花牌，必须立刻从牌墙的最末尾补摸一张牌！',
    },
    step6: {
      title: '进阶特殊胡牌', sub: '不按套路出牌',
      note: '除了标准"3+3+3+3+2"，还有三种特殊玩法。点击名字展开了解：',
      specials: [
        {
          name: '七对 — 7个对子集齐就胡！',
          tiles: [11,11, 23,23, 35,35, 41,41, 45,45, 46,46, 47,47],
          desc: '手牌凑齐 7 对即可胡，完全不需要顺子或刻子！听起来容易，凑起来却极考耐心和运气。',
        },
        {
          name: '十三幺 — 收集世界上最孤独的13张牌',
          tiles: [11,19, 21,29, 31,39, 41,42,43,44, 45,46,47, 11],
          desc: '集齐所有"老头牌"（1万、9万、1筒、9筒、1条、9条）+ 全部7张字牌（东南西北中发白），再加其中任意一张的对子。共14张，稀有度爆表！',
        },
        {
          name: '七星不靠 — 反套路神牌',
          tiles: [11,14,17, 22,25,28, 33, 41,42,43,44, 45,46,47],
          desc: '手牌里没有任何顺子、刻子，也没有对子，但必须集齐全部7张字牌，加上三门数字牌里各取"间隔跳跃"的几张（如1、4、7万）。彻底打破常规的奇葩赢法！',
        },
      ],
    },
    fan: {
      title: '什么是「番」？', sub: '进阶知识，边玩边学',
      beginnerNote: '🌱 新手不必现在记住所有番型——跟着算分器打几局，自然越来越熟悉！',
      intro: '国标麻将胡牌需要最低 8 番才有效。「番」是衡量手牌价值的单位：手牌越罕见、越难凑，番数越高，赢得越多。',
      scoringTitle: '胡牌与扣分规则',
      scoringItems: [
        { icon: '🎯', text: '点炮胡：只有放炮者向赢家付番分，另外两家不受影响。' },
        { icon: '🀄', text: '自摸：三家各扣一份番分，赢家合计收到 3×番分！' },
        { icon: '🔥', text: '一炮多点：一张牌同时让多人胡牌时，放炮者需向每位赢家各付番分。' },
      ],
      exTitle: '三个番型示例：',
      examples: [
        {
          name: '自摸',
          score: '1 番',
          tiles: [11,12,13, 33,34,35, 46,46,46, 41,41,41, 23,23],
          desc: '自己从牌墙摸到胡牌那张，不靠他人点炮。自摸额外 +1 番，且三家各扣分——赢家实际收益为 3×1 = 3 番分。',
        },
        {
          name: '清一色',
          score: '16 番',
          tiles: [21,22,23, 25,26,27, 21,22,23, 28,28,28, 24,24],
          desc: '全部 14 张手牌都是同一花色（图示全为条牌）。极难凑成，但一旦成功直接拿下 16 番！若再加上自摸，至少 17 番。',
        },
        {
          name: '番型叠加',
          score: '9 番',
          tiles: [22,22,22, 33,33,33, 24,24,24, 36,36,36, 25,25],
          desc: '全是刻子（碰碰胡 6番）+ 全部2-8数字牌无幺九字牌（断幺 2番）+ 自己摸到（自摸 1番）= 6+2+1 = 9番，超过起胡门槛！三种番型叠在一起，才凑够了番数。',
        },
      ],
      closing: '越深入了解番型，算分就越有趣 😄 可以去「番型」页查看全部番种！',
    },
  },

  en: {
    intro: "Don't be scared! Mahjong is easier than it looks. Follow these 6 steps and you'll get it!",
    step1: {
      title: 'Know Your Tiles', sub: 'The 5 Tile Types',
      suits: [
        { name: 'Man', color: '#c04000', desc: 'Numbers 1–9 (Characters)', tiles: [11,12,13,14,15,16,17,18,19] },
        { name: 'Sou', color: '#2a6020', desc: 'Numbers 1–9 (Bamboo)', tiles: [21,22,23,24,25,26,27,28,29] },
        { name: 'Pin', color: '#1a4848', desc: 'Numbers 1–9 (Circles)', tiles: [31,32,33,34,35,36,37,38,39] },
        { name: 'Winds', color: '#3c1e6e', desc: 'Honor tiles: East South West North', tiles: [41,42,43,44] },
        { name: 'Dragons', color: '#9a2800', desc: 'Honor tiles: Chun (Red), Hatsu (Green), Haku (White)', tiles: [45,46,47] },
      ],
    },
    step2: {
      title: 'The Goal', sub: 'The Winning Formula',
      formula: ['3', '+', '3', '+', '3', '+', '3', '+', '2', '=', 'Win!'],
      typeTitle: '"3" can be:',
      types: [
        { name: 'Sequence', desc: '3 consecutive number tiles (same suit)', note: '⚠️ Wind and Dragon tiles cannot form sequences!', tiles: [11,12,13], tiles2: [33,34,35] },
        { name: 'Triplet', desc: '3 identical tiles (any type — numbers or honors)', tiles: [15,15,15], tiles2: [46,46,46] },
      ],
      pairTitle: '"2" must be:',
      pair: { name: 'Pair', desc: '2 identical tiles — your "head" tile', tiles: [45,45] },
      demoTitle: '✅ A complete winning hand looks like this:',
      demoGroups: [
        { tiles: [11,12,13], label: 'Sequence' },
        { tiles: [33,34,35], label: 'Sequence' },
        { tiles: [46,46,46], label: 'Triplet' },
        { tiles: [41,41,41], label: 'Triplet' },
        { tiles: [45,45],    label: 'Pair' },
      ],
      demoNote: '💡 The 4 sets don\'t all have to be sequences or all triplets — mix freely! As long as you have 4 sets + 1 pair, you win.',
    },
    step3: {
      title: 'How a Turn Works', sub: 'Draw & Discard',
      points: [
        { icon: '🀄', text: 'Your hand always has 13 tiles.' },
        { icon: '👆', text: 'On your turn: Draw 1 tile from the wall → Discard 1 tile you don\'t need.' },
        { icon: '🎉', text: 'When you draw the perfect 14th tile, or someone discards your last needed tile — shout Win (胡)!' },
      ],
    },
    step4: {
      title: 'Chi · Pong · Win', sub: 'Your 3 Core Actions',
      actions: [
        {
          emoji: '🍜', title: 'Chi (Chow)',
          rule: 'Only claim from the player to your LEFT',
          desc: 'Form a sequence (3 consecutive number tiles). As long as you hold any 2 tiles that belong to the same sequence, you can claim the missing one!',
          tiles: [11,12,13], tileLabel: 'Claim 1-Man → 1-2-3 Man sequence',
          chiDetail: 'Examples:',
          chiSym: '+Chi',
          detailExamples: [
            { have: [12,13], chi: 11, result: [11,12,13] },
            { have: [12,13], chi: 14, result: [12,13,14] },
            { have: [13,15], chi: 14, result: [13,14,15] },
          ],
          color: '#1a4848',
        },
        {
          emoji: '👊', title: 'Pong (Pung)',
          rule: 'Claim from ANY player',
          desc: 'Form a triplet (3 identical tiles)',
          tiles: [46,46,46], tileLabel: 'Claim Hatsu → Triple Green Dragon',
          color: '#2a6020',
        },
        {
          emoji: '🎉', title: 'Win (Hu)',
          rule: 'Claim from ANY player or draw yourself — not just the left!',
          desc: 'When you\'re one tile away from a complete hand, you\'re in "tenpai" (waiting). That final tile can come from any player\'s discard — across the table, to your right, anywhere — or you can draw it yourself. Unlike Chi, there\'s no restriction. Shout "Hu!"',
          tiles: [12,13,14], tileLabel: 'Holding 2-3 Man, anyone discards 4-Man (or you draw it) → Sequence complete, Hu!',
          color: '#9a2800',
        },
      ],
    },
    step5: {
      title: 'Priority & Special Moves', sub: 'Critical rules to remember',
      prioTitle: '⚡ Who goes first?',
      prioItems: ['🏆 Win / Hu (highest)', 'Pong / Kong', 'Chi (lowest)'],
      prioNote: 'When multiple players want the same tile, higher priority wins. A winning claim beats everything!',
      kongTitle: '🀄 Kong (4 of a Kind)',
      kongTypes: [
        { name: 'Open Kong', desc: "Someone discards the tile you have 3 of → Declare Kong! Tiles face up, visible to all." },
        { name: 'Concealed Kong', desc: "You draw your 4th identical tile → Secret Kong! Tiles face down, hidden from others." },
      ],
      kongTiles: [46,46,46,46], kongLabel: '4× Green Dragon = Kong!',
      kongNote: '💡 The 4th Kong tile does NOT count toward your 13-tile hand — you immediately draw a replacement tile from the end of the wall.',
      flowerTitle: '🌸 Flower Tiles (Bonus)',
      flowerDesc: 'Spring/Summer/Autumn/Winter, Plum/Orchid/Bamboo/Chrysanthemum — reveal immediately, they score bonus fan points!',
      warning: '⚠️ Critical rule: After declaring a Kong OR drawing a Flower tile, you MUST immediately draw a replacement tile from the END of the wall!',
    },
    step6: {
      title: 'Special Winning Hands', sub: 'Break the rules!',
      note: 'Beyond 3+3+3+3+2, there are three rare special patterns. Tap to expand:',
      specials: [
        {
          name: 'Seven Pairs (七对) — 7 pairs and you\'re done!',
          tiles: [11,11, 23,23, 35,35, 41,41, 45,45, 46,46, 47,47],
          desc: 'Win with 7 pairs — no sequences or triplets needed! Sounds simple, but finding 7 pairs is surprisingly tricky.',
        },
        {
          name: 'Thirteen Orphans (十三幺) — Collect the 13 loneliest tiles',
          tiles: [11,19, 21,29, 31,39, 41,42,43,44, 45,46,47, 11],
          desc: 'Collect one of every terminal (1 & 9 of each suit) + all 7 honor tiles (4 winds + 3 dragons), plus a duplicate of any one. 14 tiles total. Insanely rare!',
        },
        {
          name: 'Seven Stars (七星不靠) — The ultimate rule-breaker',
          tiles: [11,14,17, 22,25,28, 33, 41,42,43,44, 45,46,47],
          desc: 'No pairs, no sequences, no triplets — just all 7 honor tiles + specific non-connecting number tiles from 3 suits (like 1, 4, 7). The ultimate outsider hand!',
        },
      ],
    },
    fan: {
      title: 'What is "Fan"?', sub: 'Advanced — learn as you play',
      beginnerNote: "🌱 As a beginner, don't worry about memorizing all patterns — just play a few rounds with the calculator and you'll pick it up naturally!",
      intro: 'In Chinese Standard Mahjong, you need at least 8 fan to win. Fan is the unit of hand value: rarer and harder hands score more fan and win more.',
      scoringTitle: 'How Winning & Paying Works',
      scoringItems: [
        { icon: '🎯', text: 'Discard Win: Only the discarder pays the winner. The other two players are unaffected.' },
        { icon: '🀄', text: 'Self-Draw: All three other players each pay the full fan score. Winner collects 3× fan total!' },
        { icon: '🔥', text: 'Double Win: If one discard completes two players\' hands at once, the discarder pays each winner separately.' },
      ],
      exTitle: 'Three fan examples:',
      examples: [
        {
          name: 'Self-Draw',
          score: '1 fan',
          tiles: [11,12,13, 33,34,35, 46,46,46, 41,41,41, 23,23],
          desc: "You draw your winning tile yourself — no waiting on others. Self-draw adds 1 bonus fan, and all three opponents pay: winner actually gains 3×1 = 3 fan points.",
        },
        {
          name: 'Full Flush',
          score: '16 fan',
          tiles: [21,22,23, 25,26,27, 21,22,23, 28,28,28, 24,24],
          desc: 'All 14 tiles are the same suit (pictured: all Bamboo). Incredibly hard to build, but worth 16 fan instantly! Add self-draw on top: at least 17 fan.',
        },
        {
          name: 'Stacking Example',
          score: '9 fan',
          tiles: [22,22,22, 33,33,33, 24,24,24, 36,36,36, 25,25],
          desc: 'All triplets (All Triplets, 6 fan) + all tiles are 2–8, no terminals or honors (No Terminals, 2 fan) + draw it yourself (Self-Draw, 1 fan) = 6+2+1 = 9 fan, past the minimum! Three patterns stacked together to get there.',
        },
      ],
      closing: 'The more fan patterns you know, the more fun scoring gets 😄 Check the "Fan Types" tab for the full list!',
    },
  },

  de: {
    intro: 'Keine Angst! Mahjong ist einfacher als es aussieht. Diese 6 Schritte bringen dich ans Ziel!',
    step1: {
      title: 'Deine Steine kennenlernen', sub: 'Die 5 Steintypen',
      suits: [
        { name: 'Zeichen', color: '#c04000', desc: 'Zahlen 1–9 (Wan)', tiles: [11,12,13,14,15,16,17,18,19] },
        { name: 'Bambus', color: '#2a6020', desc: 'Zahlen 1–9 (Tiao)', tiles: [21,22,23,24,25,26,27,28,29] },
        { name: 'Kreise', color: '#1a4848', desc: 'Zahlen 1–9 (Tong)', tiles: [31,32,33,34,35,36,37,38,39] },
        { name: 'Winde', color: '#3c1e6e', desc: 'Ehrensteine: Ost, Süd, West, Nord', tiles: [41,42,43,44] },
        { name: 'Drachen', color: '#9a2800', desc: 'Ehrensteine: Rot (Chun), Grün (Hatsu), Weiß (Haku)', tiles: [45,46,47] },
      ],
    },
    step2: {
      title: 'Das Ziel', sub: 'Die Gewinn-Formel',
      formula: ['3', '+', '3', '+', '3', '+', '3', '+', '2', '=', 'Sieg!'],
      typeTitle: '„3" kann sein:',
      types: [
        { name: 'Sequenz', desc: '3 aufeinanderfolgende Zahlensteine (gleiche Farbe)', note: '⚠️ Wind- und Drachensteine können keine Sequenzen bilden!', tiles: [11,12,13], tiles2: [33,34,35] },
        { name: 'Drilling', desc: '3 identische Steine (beliebiger Typ — Zahlen oder Ehren)', tiles: [15,15,15], tiles2: [46,46,46] },
      ],
      pairTitle: '„2" muss sein:',
      pair: { name: 'Paar', desc: '2 identische Steine — dein „Kopf"-Stein', tiles: [45,45] },
      demoTitle: '✅ Eine vollständige Gewinnhand sieht so aus:',
      demoGroups: [
        { tiles: [11,12,13], label: 'Sequenz' },
        { tiles: [33,34,35], label: 'Sequenz' },
        { tiles: [46,46,46], label: 'Drilling' },
        { tiles: [41,41,41], label: 'Drilling' },
        { tiles: [45,45],    label: 'Paar' },
      ],
      demoNote: '💡 Die 4 Gruppen müssen nicht alle Sequenzen oder alle Drillinge sein — frei kombinierbar! Solange 4 Gruppen + 1 Paar vorhanden sind, gewinnst du.',
    },
    step3: {
      title: 'Wie ein Zug funktioniert', sub: 'Ziehen & Ablegen',
      points: [
        { icon: '🀄', text: 'Deine Hand hat immer 13 Steine.' },
        { icon: '👆', text: 'An deinem Zug: 1 Stein von der Mauer ziehen → 1 unerwünschten Stein ablegen.' },
        { icon: '🎉', text: 'Wenn du den perfekten 14. Stein ziehst, oder jemand deinen letzten fehlenden ablegt — ruf Hu (胡)!' },
      ],
    },
    step4: {
      title: 'Chi · Pong · Hu', sub: 'Deine 3 Kernaktionen',
      actions: [
        {
          emoji: '🍜', title: 'Chi (Sequenz)',
          rule: 'Nur vom Spieler zu deiner LINKEN',
          desc: 'Vervollständige eine Sequenz (3 aufeinanderfolgende Zahlensteine). Wenn du 2 Steine einer Sequenz hältst, kannst du den fehlenden beanspruchen!',
          tiles: [11,12,13], tileLabel: '1-Wan genommen → 1-2-3 Wan Sequenz',
          chiDetail: 'Beispiele:',
          chiSym: '+Chi',
          detailExamples: [
            { have: [12,13], chi: 11, result: [11,12,13] },
            { have: [12,13], chi: 14, result: [12,13,14] },
            { have: [13,15], chi: 14, result: [13,14,15] },
          ],
          color: '#1a4848',
        },
        {
          emoji: '👊', title: 'Pong (Drilling)',
          rule: 'Von JEDEM Spieler möglich',
          desc: 'Vervollständige einen Drilling (3 identische Steine)',
          tiles: [46,46,46], tileLabel: 'Grüner Drache → Drilling',
          color: '#2a6020',
        },
        {
          emoji: '🎉', title: 'Hu (Sieg)',
          rule: 'Von JEDEM Spieler oder selbst gezogen — nicht nur von links!',
          desc: 'Wenn du noch einen Stein zur vollständigen Hand fehlst, bist du im „Wartezustand". Dieser letzte Stein kann von jedem beliebigen Spieler abgelegt werden — gegenüber, rechts, egal — oder du ziehst ihn selbst. Anders als Chi gibt es keine Einschränkung. Ruf „Hu!"',
          tiles: [12,13,14], tileLabel: '2-3 Wan auf der Hand, jemand legt 4-Wan ab (oder du ziehst) → Sequenz komplett, Hu!',
          color: '#9a2800',
        },
      ],
    },
    step5: {
      title: 'Priorität & Spezialzüge', sub: 'Wichtige Regeln',
      prioTitle: '⚡ Wer hat Vorrang?',
      prioItems: ['🏆 Hu/Sieg (höchste Priorität)', 'Pong / Kong', 'Chi (niedrigste Priorität)'],
      prioNote: 'Wollen mehrere Spieler denselben Stein, gewinnt die höhere Priorität. Ein Hu-Ruf schlägt alles!',
      kongTitle: '🀄 Kong (4 identische Steine)',
      kongTypes: [
        { name: 'Offener Kong', desc: 'Jemand legt deinen 4. identischen Stein ab → Offener Kong! Steine offen, für alle sichtbar.' },
        { name: 'Verdeckter Kong', desc: 'Du ziehst selbst den 4. Stein → Geheimer Kong! Steine verdeckt, niemand sieht sie.' },
      ],
      kongTiles: [46,46,46,46], kongLabel: '4× Grüner Drache = Kong!',
      kongNote: '💡 Der 4. Kong-Stein zählt nicht zu deinen 13 Steinen — nach dem Kong ziehst du sofort einen Ersatzstein vom Ende der Mauer.',
      flowerTitle: '🌸 Blumensteine (Bonus)',
      flowerDesc: 'Frühling/Sommer/Herbst/Winter, Pflaume/Orchidee/Bambus/Chrysantheme — sofort aufdecken, gibt Bonus-Fan-Punkte!',
      warning: '⚠️ Kritische Regel: Nach einem Kong ODER dem Ziehen einer Blume MUSST du sofort einen Ersatzstein vom ENDE der Mauer ziehen!',
    },
    step6: {
      title: 'Spezielle Gewinnhände', sub: 'Regelbrecher!',
      note: 'Neben 3+3+3+3+2 gibt es drei seltene Spezialformen. Antippen zum Aufklappen:',
      specials: [
        {
          name: 'Sieben Paare (七对) — 7 Paare und fertig!',
          tiles: [11,11, 23,23, 35,35, 41,41, 45,45, 46,46, 47,47],
          desc: 'Gewinne mit 7 Paaren — keine Sequenzen oder Drillinge nötig! Klingt einfach, ist aber überraschend schwer zu erreichen.',
        },
        {
          name: '13 Waisen (十三幺) — Die einsamsten 13 Steine',
          tiles: [11,19, 21,29, 31,39, 41,42,43,44, 45,46,47, 11],
          desc: 'Sammel einen von jedem Terminal (1 & 9 jeder Farbe) + alle 7 Ehrensteine (4 Winde + 3 Drachen), plus ein Duplikat eines davon. Extrem selten!',
        },
        {
          name: 'Sieben Sterne (七星不靠) — Der ultimative Außenseiter',
          tiles: [11,14,17, 22,25,28, 33, 41,42,43,44, 45,46,47],
          desc: 'Keine Paare, keine Sequenzen, keine Drillinge — nur alle 7 Ehrensteine + bestimmte nicht verbundene Zahlensteine aus 3 Farben (z.B. 1, 4, 7). Die ultimative Außenseiterhand!',
        },
      ],
    },
    fan: {
      title: 'Was ist „Fan"?', sub: 'Fortgeschrittenes — nebenbei lernen',
      beginnerNote: '🌱 Als Anfänger musst du nicht alle Fan-Kombinationen auswendig lernen — spiel einfach ein paar Runden mit dem Rechner und du wirst es nach und nach verstehen!',
      intro: 'Beim Chinesischen Standard-Mahjong brauchst du mindestens 8 Fan zum Gewinnen. Fan ist die Bewertungseinheit: Seltene und schwierige Hände bringen mehr Fan.',
      scoringTitle: 'Wie Gewinnen & Zahlen funktioniert',
      scoringItems: [
        { icon: '🎯', text: 'Abwurf-Sieg: Nur der Ableger zahlt den Fan-Betrag. Die anderen zwei Spieler sind nicht betroffen.' },
        { icon: '🀄', text: 'Selbstziehen: Alle drei anderen Spieler zahlen je einmal den vollen Fan-Betrag. Gewinner kassiert 3× Fan!' },
        { icon: '🔥', text: 'Doppel-Sieg: Verhilft ein abgelegter Stein zwei Spielern gleichzeitig zum Sieg, zahlt der Ableger an jeden Gewinner separat.' },
      ],
      exTitle: 'Drei Fan-Beispiele:',
      examples: [
        {
          name: 'Selbstziehen',
          score: '1 Fan',
          tiles: [11,12,13, 33,34,35, 46,46,46, 41,41,41, 23,23],
          desc: 'Du ziehst deinen Gewinnstein selbst von der Mauer. Selbstziehen gibt 1 Bonus-Fan, und alle drei zahlen: Gewinner erhält tatsächlich 3×1 = 3 Fan-Punkte.',
        },
        {
          name: 'Einfarbig (Full Flush)',
          score: '16 Fan',
          tiles: [21,22,23, 25,26,27, 21,22,23, 28,28,28, 24,24],
          desc: 'Alle 14 Steine gehören zu einer einzigen Farbe (hier: alles Bambus). Extrem schwer, aber sofort 16 Fan wert! Mit Selbstziehen kombiniert: mindestens 17 Fan.',
        },
        {
          name: 'Stapel-Beispiel',
          score: '9 Fan',
          tiles: [22,22,22, 33,33,33, 24,24,24, 36,36,36, 25,25],
          desc: 'Alle Drillinge (Alle Drillinge, 6 Fan) + alle Steine sind 2–8, keine Terminale oder Ehrensteine (Tanyao, 2 Fan) + selbst gezogen (Selbstziehen, 1 Fan) = 6+2+1 = 9 Fan, über der Mindestschwelle! Drei Muster zusammen machen es möglich.',
        },
      ],
      closing: 'Je mehr Fan-Muster du kennst, desto spannender die Abrechnung 😄 Alle Muster findest du im Tab „Fan-Typen"!',
    },
  },
};

// ─── Sub-components ───────────────────────────────────────────
function Tiles({ tiles, scale = 0.28, gap = 3 }) {
  return (
    <div className="m101-tiles" style={{ gap }}>
      {tiles.map((t, i) => <MahjongTile key={i} tile={t} scale={scale} />)}
    </div>
  );
}

function TileGroup({ tiles, label, scale = 0.28 }) {
  return (
    <div className="m101-tile-group">
      <Tiles tiles={tiles} scale={scale} gap={2} />
      {label && <div className="m101-tile-label">{label}</div>}
    </div>
  );
}

function StepCard({ num, title, sub, children }) {
  return (
    <div className="m101-card card">
      <div className="m101-card-head">
        <span className="m101-badge">{num}</span>
        <div>
          <div className="m101-step-title">{title}</div>
          {sub && <div className="m101-step-sub">{sub}</div>}
        </div>
      </div>
      <div className="m101-body">{children}</div>
    </div>
  );
}

function AccItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="m101-acc-item">
      <button className="m101-acc-btn" onClick={() => setOpen(o => !o)}>
        <span className="m101-acc-name">{item.name}</span>
        <span className="m101-acc-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="m101-acc-body">
          <FitTilesRow tiles={item.tiles} maxScale={0.28} />
          <p className="m101-acc-desc">{item.desc}</p>
        </div>
      )}
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────
export default function Mahjong101Page({ lang }) {
  const c = C[lang] || C.zh;
  const s = c.step1, s2 = c.step2, s3 = c.step3, s4 = c.step4, s5 = c.step5, s6 = c.step6, sf = c.fan;

  return (
    <div className="m101-page">
      <p className="m101-intro">{c.intro}</p>

      {/* ── Step 1: 认识牌型 ── */}
      <StepCard num={1} title={s.title} sub={s.sub}>
        <div className="m101-suits">
          {s.suits.map(suit => (
            <div key={suit.name} className="m101-suit-row">
              <div className="m101-suit-label" style={{ color: suit.color }}>{suit.name}</div>
              <div className="m101-suit-right">
                <div className="m101-tiles m101-tiles-wrap">
                  {suit.tiles.map((t, i) => (
                    <MahjongTile key={i} tile={t} scale={suit.tiles.length > 6 ? 0.23 : 0.28} />
                  ))}
                </div>
                <div className="m101-suit-desc">{suit.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </StepCard>

      {/* ── Step 2: 胡牌公式 ── */}
      <StepCard num={2} title={s2.title} sub={s2.sub}>
        {/* 大公式 */}
        <div className="m101-formula">
          {s2.formula.map((tok, i) => (
            tok === '=' ? <span key={i} className="m101-f-eq">=</span>
            : tok.includes('+') ? <span key={i} className="m101-f-op">+</span>
            : /^\d$/.test(tok) ? <span key={i} className="m101-f-num">{tok}</span>
            : <span key={i} className="m101-f-win">{tok}</span>
          ))}
        </div>

        {/* 顺子 / 刻子 */}
        <p className="m101-section-label">{s2.typeTitle}</p>
        <div className="m101-type-grid">
          {s2.types.map(tp => (
            <div key={tp.name} className="m101-type-card">
              <div className="m101-type-name">{tp.name}</div>
              <div className="m101-type-desc">{tp.desc}</div>
              {tp.note && <div className="m101-type-note">{tp.note}</div>}
              <div className="m101-type-examples">
                <TileGroup tiles={tp.tiles} scale={0.28} />
                <TileGroup tiles={tp.tiles2} scale={0.28} />
              </div>
            </div>
          ))}
        </div>

        {/* 将牌 */}
        <p className="m101-section-label">{s2.pairTitle}</p>
        <div className="m101-type-card" style={{ display: 'inline-block' }}>
          <div className="m101-type-name">{s2.pair.name}</div>
          <div className="m101-type-desc">{s2.pair.desc}</div>
          <TileGroup tiles={s2.pair.tiles} scale={0.28} />
        </div>

        {/* 完整示例 */}
        <p className="m101-section-label" style={{ marginTop: 14 }}>{s2.demoTitle}</p>
        <div className="m101-hand-demo">
          {s2.demoGroups.map((g, i) => (
            <div key={i} className="m101-demo-group">
              {i > 0 && <span className="m101-demo-sep">+</span>}
              <TileGroup tiles={g.tiles} label={g.label} scale={0.26} />
            </div>
          ))}
        </div>
        {s2.demoNote && <div className="m101-demo-note">{s2.demoNote}</div>}
      </StepCard>

      {/* ── Step 3: 回合流程 ── */}
      <StepCard num={3} title={s3.title} sub={s3.sub}>
        <div className="m101-points">
          {s3.points.map((p, i) => (
            <div key={i} className="m101-point">
              <span className="m101-point-icon">{p.icon}</span>
              <span className="m101-point-text">{p.text}</span>
            </div>
          ))}
        </div>
      </StepCard>

      {/* ── Step 4: 吃碰胡 ── */}
      <StepCard num={4} title={s4.title} sub={s4.sub}>
        <div className="m101-actions">
          {s4.actions.map(a => (
            <div key={a.title} className="m101-action">
              <div className="m101-action-head">
                <span className="m101-action-emoji">{a.emoji}</span>
                <span className="m101-action-title" style={{ color: a.color }}>{a.title}</span>
              </div>
              <div className="m101-action-rule">{a.rule}</div>
              <div className="m101-action-desc">{a.desc}</div>
              <div style={{ marginTop: 8 }}>
                <TileGroup tiles={a.tiles} label={a.tileLabel} scale={0.30} />
              </div>
              {a.detailExamples && (
                <div className="m101-chi-examples">
                  <div className="m101-chi-detail-label">{a.chiDetail}</div>
                  {a.detailExamples.map((ex, ei) => (
                    <div key={ei} className="m101-chi-row">
                      <Tiles tiles={ex.have} scale={0.24} />
                      <span className="m101-chi-sym">{a.chiSym}</span>
                      <Tiles tiles={[ex.chi]} scale={0.24} />
                      <span className="m101-chi-sym">→</span>
                      <Tiles tiles={ex.result} scale={0.24} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </StepCard>

      {/* ── Step 5: 优先级 & 特殊动作 ── */}
      <StepCard num={5} title={s5.title} sub={s5.sub}>
        {/* 优先级框 */}
        <div className="m101-prio-box">
          <div className="m101-prio-title">{s5.prioTitle}</div>
          <div className="m101-prio-list">
            {s5.prioItems.map((item, i) => (
              <div key={i} className={`m101-prio-item m101-prio-${i + 1}`}>{item}</div>
            ))}
          </div>
          <div className="m101-prio-note">{s5.prioNote}</div>
        </div>

        {/* 杠牌 */}
        <div className="m101-box m101-box-purple">
          <div className="m101-box-title">{s5.kongTitle}</div>
          {s5.kongTypes.map(kt => (
            <div key={kt.name} className="m101-kong-type">
              <strong>{kt.name}：</strong>{kt.desc}
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <TileGroup tiles={s5.kongTiles} label={s5.kongLabel} scale={0.30} />
          </div>
          {s5.kongNote && <div className="m101-kong-note">{s5.kongNote}</div>}
        </div>

        {/* 花牌 */}
        <div className="m101-box m101-box-green">
          <div className="m101-box-title">{s5.flowerTitle}</div>
          <div className="m101-box-desc">{s5.flowerDesc}</div>
        </div>

        {/* 警示 */}
        <div className="m101-warning">{s5.warning}</div>
      </StepCard>

      {/* ── Step 6: 特殊胡牌 ── */}
      <StepCard num={6} title={s6.title} sub={s6.sub}>
        <p className="m101-acc-note">{s6.note}</p>
        <div className="m101-accordion">
          {s6.specials.map((item, i) => (
            <AccItem key={i} item={item} />
          ))}
        </div>
      </StepCard>

      {/* ── 进阶：什么是番 ── */}
      <StepCard num="★" title={sf.title} sub={sf.sub}>
        <div className="m101-fan-beginner-note">{sf.beginnerNote}</div>
        <p className="m101-fan-intro">{sf.intro}</p>
        <p className="m101-section-label">{sf.scoringTitle}</p>
        <div className="m101-fan-scoring">
          {sf.scoringItems.map((item, i) => (
            <div key={i} className="m101-fan-scoring-item">
              <span className="m101-fan-scoring-icon">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        <p className="m101-section-label">{sf.exTitle}</p>
        <div className="m101-fan-examples">
          {sf.examples.map((ex, i) => (
            <div key={i} className="m101-fan-ex">
              <div className="m101-fan-ex-head">
                <span className="m101-fan-name">{ex.name}</span>
                <span className="m101-fan-score">{ex.score}</span>
              </div>
              <div style={{ margin: '8px 0' }}>
                <FitTilesRow tiles={ex.tiles} maxScale={0.26} />
              </div>
              <p className="m101-fan-ex-desc">{ex.desc}</p>
            </div>
          ))}
        </div>
        <div className="m101-fan-closing">{sf.closing}</div>
      </StepCard>

    </div>
  );
}
