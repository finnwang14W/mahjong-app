// ============================================================
// 番种字典 — 供"规则说明页"和"算番结果 Accordion"共同调用
// tiles 字段使用 Unicode 麻将字符展示牌型示例
// 万 🀇🀈🀉🀊🀋🀌🀍🀎🀏  筒 🀙🀚🀛🀜🀝🀞🀟🀠🀡
// 条 🀐🀑🀒🀓🀔🀕🀖🀗🀘  风 🀀🀁🀂🀃  箭 🀄︎🀅🀆
// ============================================================

export const FAN_DICT = {

  /* ══════════════════════ 88 番 ══════════════════════ */
  '大四喜': {
    value: 88,
    tiles: '🀀🀀🀀 🀁🀁🀁 🀂🀂🀂 🀃🀃🀃 🀇🀇',
    desc: {
      zh: '四组面子全是风刻（东南西北各碰一次）。风牌中最顶级的番型，极其罕见。',
      en: 'All four sets are wind triplets (East, South, West, North). The rarest wind-based hand.',
      de: 'Alle vier Sätze sind Wind-Drillinge (Ost, Süd, West, Nord). Äußerst selten.',
    },
  },
  '大三元': {
    value: 88,
    tiles: '🀄︎🀄︎🀄︎ 🀅🀅🀅 🀆🀆🀆 🀇🀈🀉 🀙🀙',
    desc: {
      zh: '中、发、白三张箭牌全部碰成刻子。三元牌全收，超级大牌。',
      en: 'Triplets of all three dragon tiles (Red, Green, White). Ultimate dragon hand.',
      de: 'Drillinge aller drei Drachen (Rot, Grün, Weiß). Der ultimative Drachen-Hand.',
    },
  },
  '绿一色': {
    value: 88,
    tiles: '🀑🀑🀑 🀒🀒🀒 🀕🀕🀕 🀑🀒🀓 🀅🀅',
    desc: {
      zh: '全部牌都是绿色牌：二条、三条、四条、六条、八条和发（绿）。',
      en: 'All tiles are "green": 2, 3, 4, 6, 8 of bamboo and Green Dragon.',
      de: 'Alle Steine sind "grün": 2, 3, 4, 6, 8 der Bambus und Grüner Drache.',
    },
  },
  '九莲宝灯': {
    value: 88,
    tiles: '🀇🀇🀇🀈🀉🀊🀋🀌🀍🀎🀏🀏🀏 +1',
    desc: {
      zh: '同一花色 1-1-1-2-3-4-5-6-7-8-9-9-9 共 13 张，再加上该花色任意一张，即可胡牌。清一色顶级形态。',
      en: '1-1-1-2-3-4-5-6-7-8-9-9-9 all in one suit, waiting on any tile of that suit. The pinnacle of pure-suit hands.',
      de: '1-1-1-2-3-4-5-6-7-8-9-9-9 in einer Farbe, wartet auf jede Karte dieser Farbe.',
    },
  },
  '四杠': {
    value: 88,
    tiles: '（四次杠牌操作）',
    desc: {
      zh: '在一局中打出四个杠（明杠或暗杠均可）。极罕见。',
      en: 'Four kongs (open or concealed) in one hand. Incredibly rare.',
      de: 'Vier Kongs (offen oder verdeckt) in einer Runde. Äußerst selten.',
    },
  },
  '连七对': {
    value: 88,
    tiles: '🀇🀇 🀈🀈 🀉🀉 🀊🀊 🀋🀋 🀌🀌 🀍🀍',
    desc: {
      zh: '七个对子，且点数连续（如一万到七万）。比普通七对更难，但番值更高。',
      en: 'Seven consecutive pairs (e.g. 1–7 of one suit). Harder than regular seven pairs.',
      de: 'Sieben aufeinanderfolgende Paare (z. B. 1–7 einer Farbe). Schwerer als normale sieben Paare.',
    },
  },
  '十三幺': {
    value: 88,
    tiles: '🀇🀏🀙🀡🀐🀘🀀🀁🀂🀃🀄︎🀅🀆 +1',
    desc: {
      zh: '集齐九个幺九牌（一九万、一九筒、一九条）和四张风牌、三张箭牌，13种各一张再加任意一种。',
      en: 'One of each terminal and honor tile (13 types), plus one duplicate. A unique special hand.',
      de: 'Eines von jedem Terminal und Ehren-Stein (13 Typen) plus ein Duplikat. Einzigartige Sonderhand.',
    },
  },

  /* ══════════════════════ 64 番 ══════════════════════ */
  '一色双龙会': {
    value: 64,
    tiles: '🀇🀈🀉 🀇🀈🀉 🀍🀎🀏 🀍🀎🀏 🀋🀋',
    desc: {
      zh: '同一花色：两组123顺子 + 两组789顺子 + 5作雀头。',
      en: 'Same suit: two 1-2-3 sequences + two 7-8-9 sequences + 5 as the pair.',
      de: 'Gleiche Farbe: zwei 1-2-3 Sequenzen + zwei 7-8-9 Sequenzen + 5 als Paar.',
    },
  },
  '四暗刻': {
    value: 64,
    tiles: '🀇🀇🀇 🀉🀉🀉 🀌🀌🀌 🀏🀏🀏 🀙🀙',
    desc: {
      zh: '四组面子全是暗刻（不靠杠、不靠碰，自摸或门清条件下才能算）。',
      en: 'Four concealed triplets. Must be won without open melds.',
      de: 'Vier verdeckte Drillinge. Muss ohne offene Sätze gewonnen werden.',
    },
  },
  '清幺九': {
    value: 64,
    tiles: '🀇🀇🀇 🀏🀏🀏 🀙🀙🀙 🀡🀡🀡 🀇🀏',
    desc: {
      zh: '全部是一和九的数字牌（幺九牌），不含字牌。每组都是1或9的刻子或顺子。',
      en: 'All tiles are 1s and 9s (terminals only, no honors). Every set contains only 1 or 9.',
      de: 'Alle Steine sind Einser und Neuner (nur Terminale, keine Ehren).',
    },
  },
  '小四喜': {
    value: 64,
    tiles: '🀀🀀🀀 🀁🀁🀁 🀂🀂🀂 🀇🀈🀉 🀃🀃',
    desc: {
      zh: '三组风刻 + 一组风对（雀头）。东南西北集齐，但有一种是对子而非刻子。',
      en: 'Three wind triplets + one wind pair. All four winds present.',
      de: 'Drei Wind-Drillinge + ein Wind-Paar. Alle vier Winde vorhanden.',
    },
  },
  '小三元': {
    value: 64,
    tiles: '🀄︎🀄︎🀄︎ 🀅🀅🀅 🀇🀈🀉 🀙🀚🀛 🀆🀆',
    desc: {
      zh: '两组箭刻 + 一组箭对（雀头）。中发白集齐，其中一种是对子。',
      en: 'Two dragon triplets + one dragon pair. All three dragons present.',
      de: 'Zwei Drachen-Drillinge + ein Drachen-Paar. Alle drei Drachen vorhanden.',
    },
  },
  '字一色': {
    value: 64,
    tiles: '🀀🀀🀀 🀁🀁🀁 🀄︎🀄︎🀄︎ 🀅🀅🀅 🀆🀆',
    desc: {
      zh: '全部是字牌（风牌+箭牌），没有一张数字牌。',
      en: 'All tiles are honor tiles (winds + dragons), no number tiles.',
      de: 'Alle Steine sind Ehrensteine (Winde + Drachen), keine Zahlensteine.',
    },
  },

  /* ══════════════════════ 48 番 ══════════════════════ */
  '一色四同顺': {
    value: 48,
    tiles: '🀇🀈🀉 🀇🀈🀉 🀇🀈🀉 🀇🀈🀉 🀙🀙',
    desc: {
      zh: '同一花色的同一组顺子，重复四次。如四组一万二万三万。',
      en: 'The exact same sequence in one suit, four times.',
      de: 'Dieselbe Sequenz in einer Farbe, viermal.',
    },
  },
  '一色四节高': {
    value: 48,
    tiles: '🀇🀇🀇 🀈🀈🀈 🀉🀉🀉 🀊🀊🀊 🀙🀙',
    desc: {
      zh: '同一花色中四组刻子，点数依次相差1（如123456刻子组合）。',
      en: 'Four triplets in one suit with consecutive ranks (e.g. 1,2,3,4 triplets).',
      de: 'Vier Drillinge in einer Farbe mit aufeinanderfolgenden Werten.',
    },
  },

  /* ══════════════════════ 32 番 ══════════════════════ */
  '一色四步高': {
    value: 32,
    tiles: '🀇🀈🀉 🀈🀉🀊 🀉🀊🀋 🀊🀋🀌 🀙🀙',
    desc: {
      zh: '同一花色四组顺子，每组起始点数依次递增1（或递增2），形成"阶梯形"。',
      en: 'Four sequences in one suit, each starting one (or two) higher than the previous.',
      de: 'Vier Sequenzen in einer Farbe, jede um eins (oder zwei) höher startend.',
    },
  },
  '三杠': {
    value: 32,
    tiles: '（三次杠牌操作）',
    desc: {
      zh: '在一局中打出三个杠（明杠+暗杠共三个）。',
      en: 'Three kongs (any combination of open/concealed) in one hand.',
      de: 'Drei Kongs (beliebige Kombination offen/verdeckt) in einer Runde.',
    },
  },
  '混幺九': {
    value: 32,
    tiles: '🀀🀀🀀 🀇🀇🀇 🀏🀏🀏 🀇🀏🀘 🀙🀙',
    desc: {
      zh: '每组面子都含有幺九牌（1、9）或字牌（风/箭），但同时包含数字幺九牌和字牌两类。',
      en: 'Every set contains a terminal (1 or 9) or honor tile, mixing terminals and honors.',
      de: 'Jeder Satz enthält einen Terminal (1 oder 9) oder Ehrenstein, gemischt.',
    },
  },

  /* ══════════════════════ 24 番 ══════════════════════ */
  '七对': {
    value: 24,
    tiles: '🀇🀇 🀉🀉 🀌🀌 🀙🀙 🀛🀛 🀐🀐 🀀🀀',
    desc: {
      zh: '七个对子，每种牌各两张（不能有四张相同的牌）。',
      en: 'Seven pairs (no four-of-a-kind allowed). A special hand structure.',
      de: 'Sieben Paare (kein Vierling erlaubt). Eine besondere Handstruktur.',
    },
  },
  '七星不靠': {
    value: 24,
    tiles: '🀇🀊🀍 🀙🀜🀟 🀐🀓🀖 🀀🀁🀄︎🀅',
    desc: {
      zh: '万条筒各取1-4-7、2-5-8、3-6-9中的一组，加上任意五种字牌，不形成任何顺子或刻子。',
      en: 'One tile from each "1-4-7", "2-5-8", "3-6-9" sequence across suits, plus 5 honor tiles. No melds.',
      de: 'Je ein Stein der "1-4-7", "2-5-8", "3-6-9" Gruppen über alle Farben, plus 5 Ehrensteine.',
    },
  },
  '全双刻': {
    value: 24,
    tiles: '🀈🀈🀈 🀊🀊🀊 🀌🀌🀌 🀎🀎🀎 🀈🀈',
    desc: {
      zh: '四组刻子全是偶数牌（2、4、6、8），雀头也是偶数牌。',
      en: 'All four triplets and the pair are even-numbered tiles (2, 4, 6, 8).',
      de: 'Alle vier Drillinge und das Paar sind gerade Zahlen (2, 4, 6, 8).',
    },
  },
  '清一色': {
    value: 24,
    tiles: '🀇🀈🀉 🀉🀉🀉 🀊🀋🀌 🀍🀎🀏 🀇🀇',
    desc: {
      zh: '所有牌都是同一花色（万、筒或条），不含任何字牌。最常见的中高番型。',
      en: 'All tiles are from the same suit (characters, circles, or bamboo). No honor tiles.',
      de: 'Alle Steine aus derselben Farbe (Zeichen, Kreise oder Bambus). Keine Ehrensteine.',
    },
  },
  '一色三同顺': {
    value: 24,
    tiles: '🀇🀈🀉 🀇🀈🀉 🀇🀈🀉 🀌🀌🀌 🀙🀙',
    desc: {
      zh: '同一花色的同一组顺子，重复三次。',
      en: 'The exact same sequence in one suit, three times.',
      de: 'Dieselbe Sequenz in einer Farbe, dreimal.',
    },
  },
  '一色三节高': {
    value: 24,
    tiles: '🀇🀇🀇 🀈🀈🀈 🀉🀉🀉 🀌🀌🀌 🀙🀙',
    desc: {
      zh: '同一花色三组刻子，点数依次递增1（如一二三刻子）。',
      en: 'Three triplets in one suit with consecutive ranks.',
      de: 'Drei Drillinge in einer Farbe mit aufeinanderfolgenden Werten.',
    },
  },
  '全大': {
    value: 24,
    tiles: '🀍🀍🀍 🀎🀎🀎 🀍🀎🀏 🀟🀠🀡 🀖🀖',
    desc: {
      zh: '全部是7、8、9的数字牌，不含字牌。',
      en: 'All tiles are 7, 8, or 9 (high terminals). No honor tiles.',
      de: 'Alle Steine sind 7, 8 oder 9 (hohe Terminale). Keine Ehrensteine.',
    },
  },
  '全中': {
    value: 24,
    tiles: '🀊🀊🀊 🀋🀋🀋 🀊🀋🀌 🀜🀝🀞 🀓🀓',
    desc: {
      zh: '全部是4、5、6的数字牌，不含字牌。',
      en: 'All tiles are 4, 5, or 6 (middle numbers). No honor tiles.',
      de: 'Alle Steine sind 4, 5 oder 6 (mittlere Zahlen). Keine Ehrensteine.',
    },
  },
  '全小': {
    value: 24,
    tiles: '🀇🀇🀇 🀈🀈🀈 🀇🀈🀉 🀙🀚🀛 🀐🀐',
    desc: {
      zh: '全部是1、2、3的数字牌，不含字牌。',
      en: 'All tiles are 1, 2, or 3 (low terminals). No honor tiles.',
      de: 'Alle Steine sind 1, 2 oder 3 (niedrige Terminale). Keine Ehrensteine.',
    },
  },

  /* ══════════════════════ 16 番 ══════════════════════ */
  '清龙': {
    value: 16,
    tiles: '🀇🀈🀉 🀊🀋🀌 🀍🀎🀏 🀐🀐🀐 🀙🀙',
    desc: {
      zh: '同一花色的123、456、789三组顺子，合成1-9的完整龙。',
      en: 'One suit contains 1-2-3, 4-5-6, and 7-8-9 sequences — a complete 1-9 run.',
      de: 'Eine Farbe enthält 1-2-3, 4-5-6 und 7-8-9 Sequenzen — ein vollständiger Lauf.',
    },
  },
  '三色双龙会': {
    value: 16,
    tiles: '🀇🀈🀉 🀍🀎🀏 🀙🀚🀛 🀟🀠🀡 🀋🀋',
    desc: {
      zh: '某一花色的123和789各一组，雀头是该花色的5，另外两花色各凑一组面子。',
      en: 'One suit has 1-2-3 and 7-8-9 sequences with its 5 as the pair; other suits fill the rest.',
      de: 'Eine Farbe hat 1-2-3 und 7-8-9 Sequenzen mit ihrer 5 als Paar.',
    },
  },
  '一色三步高': {
    value: 16,
    tiles: '🀇🀈🀉 🀈🀉🀊 🀉🀊🀋 🀌🀌🀌 🀙🀙',
    desc: {
      zh: '同一花色三组顺子，每组起始点数依次递增1（或递增2）。',
      en: 'Three sequences in one suit, each starting one (or two) higher than the last.',
      de: 'Drei Sequenzen in einer Farbe, jede um eins (oder zwei) höher.',
    },
  },
  '全带五': {
    value: 16,
    tiles: '🀋🀋🀋 🀊🀋🀌 🀝🀝🀝 🀓🀔🀕 🀋🀋',
    desc: {
      zh: '每一组面子（含雀头）都含有5这张牌（五万/五筒/五条均可）。',
      en: 'Every set (including the pair) contains a 5 tile.',
      de: 'Jeder Satz (einschließlich des Paares) enthält einen 5er Stein.',
    },
  },
  '三同刻': {
    value: 16,
    tiles: '🀉🀉🀉 🀛🀛🀛 🀒🀒🀒 🀌🀌🀌 🀙🀙',
    desc: {
      zh: '三门不同花色的刻子，点数相同（如三万、三筒、三条各碰一刻）。',
      en: 'Triplets of the same rank in all three suits (e.g. three 3s in characters, circles, bamboo).',
      de: 'Drillinge desselben Wertes in allen drei Farben.',
    },
  },
  '三暗刻': {
    value: 16,
    tiles: '🀇🀇🀇 🀉🀉🀉 🀌🀌🀌 🀇🀈🀉 🀙🀙',
    desc: {
      zh: '手牌中有三组暗刻（自摸或门清胡牌时刻子视为暗刻）。',
      en: 'Three concealed triplets in hand (not formed by open melding).',
      de: 'Drei verdeckte Drillinge in der Hand.',
    },
  },

  /* ══════════════════════ 12 番 ══════════════════════ */
  '全不靠': {
    value: 12,
    tiles: '🀇🀊🀍 🀙🀜🀟 🀐🀓🀖 🀀🀁🀄︎🀆',
    desc: {
      zh: '牌不能形成任何顺子或刻子，全靠间隔的散牌组合（1-4-7、2-5-8或3-6-9）加字牌凑成。',
      en: 'No sets or pairs; tiles are scattered in a "1-4-7 / 2-5-8 / 3-6-9" pattern plus honors.',
      de: 'Keine Sätze oder Paare; Steine im "1-4-7 / 2-5-8 / 3-6-9" Muster plus Ehrensteine.',
    },
  },
  '组合龙': {
    value: 12,
    tiles: '🀇🀈🀉 🀜🀝🀞 🀖🀗🀘 🀌🀌🀌 🀙🀙',
    desc: {
      zh: '三门花色各取123、456、789之一，恰好覆盖1到9的全部点数，加上一组刻子和雀头。',
      en: 'Three suits contribute 1-2-3, 4-5-6, and 7-8-9 respectively, covering all ranks 1–9.',
      de: 'Drei Farben tragen je 1-2-3, 4-5-6 und 7-8-9 bei, alle Werte 1–9 abgedeckt.',
    },
  },
  '大于五': {
    value: 12,
    tiles: '🀌🀌🀌 🀍🀎🀏 🀞🀟🀠 🀖🀗🀘 🀞🀞',
    desc: {
      zh: '全部是数字牌，且每张牌的点数都大于5（即6、7、8、9），不含字牌。',
      en: 'All tiles are numbers greater than 5 (6, 7, 8, 9). No honor tiles.',
      de: 'Alle Steine sind Zahlen größer als 5 (6, 7, 8, 9). Keine Ehrensteine.',
    },
  },
  '小于五': {
    value: 12,
    tiles: '🀇🀇🀇 🀈🀉🀊 🀙🀚🀛 🀐🀑🀒 🀈🀈',
    desc: {
      zh: '全部是数字牌，且每张牌的点数都小于5（即1、2、3、4），不含字牌。',
      en: 'All tiles are numbers less than 5 (1, 2, 3, 4). No honor tiles.',
      de: 'Alle Steine sind Zahlen kleiner als 5 (1, 2, 3, 4). Keine Ehrensteine.',
    },
  },
  '三风刻': {
    value: 12,
    tiles: '🀀🀀🀀 🀁🀁🀁 🀂🀂🀂 🀇🀈🀉 🀙🀙',
    desc: {
      zh: '手牌中有三组不同的风牌刻子（如东东东、南南南、西西西）。',
      en: 'Three triplets of different wind tiles.',
      de: 'Drei Drillinge verschiedener Wind-Steine.',
    },
  },

  /* ══════════════════════ 8 番 ══════════════════════ */
  '花龙': {
    value: 8,
    tiles: '🀇🀈🀉 🀜🀝🀞 🀖🀗🀘 🀌🀌🀌 🀙🀙',
    desc: {
      zh: '123、456、789三段分布在恰好两门花色中（如万筒各出一组，条出一组）。',
      en: '1-2-3, 4-5-6, 7-8-9 spread across exactly two suits.',
      de: '1-2-3, 4-5-6, 7-8-9 auf genau zwei Farben verteilt.',
    },
  },
  '三色三同顺': {
    value: 8,
    tiles: '🀉🀊🀋 🀛🀜🀝 🀒🀓🀔 🀍🀍🀍 🀙🀙',
    desc: {
      zh: '三门花色各有一组起始点数相同的顺子（如万筒条各有345顺子）。',
      en: 'Three sequences with the same starting rank, one in each suit.',
      de: 'Drei Sequenzen mit demselben Startwert, eine in jeder Farbe.',
    },
  },
  '三色三节高': {
    value: 8,
    tiles: '🀉🀉🀉 🀜🀜🀜 🀔🀔🀔 🀌🀌🀌 🀙🀙',
    desc: {
      zh: '三门花色各有一组刻子，三组刻子的点数依次递增1（如万3、筒4、条5各碰一刻）。',
      en: 'Three triplets, one per suit, with consecutive ranks across suits.',
      de: 'Drei Drillinge, einer pro Farbe, mit aufeinanderfolgenden Werten.',
    },
  },
  '妙手回春': {
    value: 8,
    tiles: '（最后一张自摸）',
    desc: {
      zh: '摸到牌墙最后一张牌并自摸和牌。',
      en: 'Win by self-drawing the very last tile from the wall.',
      de: 'Sieg durch Selbstziehen der allerletzten Karte von der Mauer.',
    },
  },
  '海底捞月': {
    value: 8,
    tiles: '（最后一张点炮）',
    desc: {
      zh: '和牌时，所摸的是牌墙最后一张牌（点炮形式）。',
      en: 'Win by claiming the very last discarded tile.',
      de: 'Sieg durch Beanspruchen des allerletzten abgeworfenen Steins.',
    },
  },
  '杠上开花': {
    value: 8,
    tiles: '（杠后补牌和牌）',
    desc: {
      zh: '打杠之后，摸补的那张牌恰好和牌。',
      en: 'Win on the tile drawn after declaring a kong.',
      de: 'Sieg mit dem Stein, der nach einem Kong gezogen wird.',
    },
  },
  '抢杠和': {
    value: 8,
    tiles: '（拦截对手的杠）',
    desc: {
      zh: '当别人想把碰牌升级为杠时，你恰好可以用那张牌胡牌，即"抢杠"。',
      en: 'Win by claiming the tile another player tries to add to their triplet to form a kong.',
      de: 'Sieg durch Beanspruchen des Steins, den ein Spieler zu einem Kong hinzufügen will.',
    },
  },
  '双暗杠': {
    value: 8,
    tiles: '（两次暗杠操作）',
    desc: {
      zh: '手牌中有两个暗杠（四张相同的牌，全在手里，不亮出）。',
      en: 'Two concealed kongs (four identical tiles kept hidden in hand).',
      de: 'Zwei verdeckte Kongs (vier identische Steine verborgen in der Hand).',
    },
  },

  /* ══════════════════════ 6 番 ══════════════════════ */
  '碰碰和': {
    value: 6,
    tiles: '🀇🀇🀇 🀉🀉🀉 🀌🀌🀌 🀀🀀🀀 🀙🀙',
    desc: {
      zh: '四组面子全是刻子（无顺子），和单钓将。俗称"全碰"，不需要任何顺子。',
      en: 'All four sets are triplets (no sequences). Also called "all pungs".',
      de: 'Alle vier Sätze sind Drillinge (keine Sequenzen). Auch "alle Tripel" genannt.',
    },
  },
  '混一色': {
    value: 6,
    tiles: '🀇🀈🀉 🀇🀇🀇 🀊🀋🀌 🀀🀀🀀 🀁🀁',
    desc: {
      zh: '只使用一种数字花色加上字牌（风/箭），不含其他花色数字牌。',
      en: 'Only one suit of number tiles, mixed with honor tiles. No other number suits.',
      de: 'Nur eine Zahlfarbe, gemischt mit Ehrensteinen. Keine anderen Zahlfarben.',
    },
  },
  '三色三步高': {
    value: 6,
    tiles: '🀇🀈🀉 🀚🀛🀜 🀓🀔🀕 🀌🀌🀌 🀙🀙',
    desc: {
      zh: '三门花色各有一组顺子，三组顺子的起始点数依次递增1（或递增2）。',
      en: 'Three sequences across three suits, each starting one (or two) higher than the last.',
      de: 'Drei Sequenzen in drei Farben, jede um eins (oder zwei) höher.',
    },
  },
  '五门齐': {
    value: 6,
    tiles: '🀇🀈🀉 🀙🀙🀙 🀐🀐🀐 🀀🀀🀀 🀄︎🀄︎',
    desc: {
      zh: '手牌中同时包含万、筒、条、风、箭五种类型的牌。',
      en: 'Hand contains all five tile categories: characters, circles, bamboo, winds, and dragons.',
      de: 'Hand enthält alle fünf Steinkategorien: Zeichen, Kreise, Bambus, Winde und Drachen.',
    },
  },
  '双箭刻': {
    value: 6,
    tiles: '🀄︎🀄︎🀄︎ 🀅🀅🀅 🀇🀈🀉 🀊🀋🀌 🀆🀆',
    desc: {
      zh: '中和发（或白）各碰一组刻子，两种箭牌刻子同时出现。',
      en: 'Triplets of two different dragon tiles.',
      de: 'Drillinge von zwei verschiedenen Drachen-Steinen.',
    },
  },
  '明暗杠': {
    value: 6,
    tiles: '（一明杠+一暗杠）',
    desc: {
      zh: '同时拥有至少一个明杠（亮出的四张）和一个暗杠（不亮出的四张）。',
      en: 'At least one open kong and one concealed kong in the same hand.',
      de: 'Mindestens ein offener und ein verdeckter Kong in derselben Hand.',
    },
  },
  '全求人': {
    value: 6,
    tiles: '（全部吃碰杠获得面子）',
    desc: {
      zh: '所有面子都通过吃、碰、杠获得（无一张摸牌），最后点炮胡牌。',
      en: 'Every set is formed by claiming discards; hand won by discard (not self-draw).',
      de: 'Jeder Satz durch Beanspruchen von Abwürfen; Sieg durch Abwurf.',
    },
  },

  /* ══════════════════════ 4 番 ══════════════════════ */
  '全带幺': {
    value: 4,
    tiles: '🀇🀈🀉 🀏🀏🀏 🀙🀚🀛 🀐🀑🀒 🀇🀇',
    desc: {
      zh: '每组面子（含雀头）都含有一张幺九牌或字牌（1、9、风、箭任意一种）。',
      en: 'Every set (including the pair) contains a terminal (1 or 9) or an honor tile.',
      de: 'Jeder Satz (einschließlich des Paares) enthält einen Terminal oder Ehrenstein.',
    },
  },
  '不求人': {
    value: 4,
    tiles: '（门前清自摸）',
    desc: {
      zh: '全程没有吃、碰、杠，全靠自摸凑成手牌并自摸和牌。等于"门前清+自摸"。',
      en: 'Fully concealed hand won by self-draw. No open melds of any kind.',
      de: 'Vollständig verdeckte Hand durch Selbstziehen gewonnen. Keine offenen Sätze.',
    },
  },
  '双明杠': {
    value: 4,
    tiles: '（两次明杠操作）',
    desc: {
      zh: '手牌中有两个明杠（两次将碰到的刻子加上第四张亮出来）。',
      en: 'Two open kongs (two triplets extended to four tiles, revealed).',
      de: 'Zwei offene Kongs (zwei Drillinge auf vier Steine erweitert, aufgedeckt).',
    },
  },
  '和绝张': {
    value: 4,
    tiles: '（和最后一种牌）',
    desc: {
      zh: '胡牌的那张是场上剩余最后一张同种牌（其他三张已经被打出或杠掉）。',
      en: 'Win on the last remaining tile of its kind (the other three are visible on the table).',
      de: 'Sieg mit dem letzten verbleibenden Stein seiner Art.',
    },
  },

  /* ══════════════════════ 2 番 ══════════════════════ */
  '箭刻': {
    value: 2,
    tiles: '🀄︎🀄︎🀄︎ 🀇🀈🀉 🀊🀋🀌 🀍🀎🀏 🀙🀙',
    desc: {
      zh: '碰了一组箭牌（中/发/白）刻子，每组计2番，可重复计算。',
      en: 'A triplet of one dragon tile (Red, Green, or White). Scores 2 fan per dragon triplet.',
      de: 'Ein Drilling eines Drachen-Steins. Gibt 2 Fan pro Drachen-Drilling.',
    },
  },
  '圈风刻': {
    value: 2,
    tiles: '🀀🀀🀀 🀇🀈🀉 🀊🀋🀌 🀍🀎🀏 🀙🀙',
    desc: {
      zh: '碰了当前圈风（本局的场风）的刻子。例如东风圈碰了东东东。',
      en: 'A triplet of the current round wind. Adds 2 fan to the base score.',
      de: 'Ein Drilling des aktuellen Rundwindes. Gibt 2 Fan.',
    },
  },
  '门风刻': {
    value: 2,
    tiles: '🀁🀁🀁 🀇🀈🀉 🀊🀋🀌 🀍🀎🀏 🀙🀙',
    desc: {
      zh: '碰了自己的门风（座位风）刻子。例如南家碰了南南南。',
      en: 'A triplet of your own seat wind. Adds 2 fan.',
      de: 'Ein Drilling des eigenen Sitzwindes. Gibt 2 Fan.',
    },
  },
  '门前清': {
    value: 2,
    tiles: '（全程未吃碰，点炮胡）',
    desc: {
      zh: '全程没有吃牌或碰牌（可以有暗杠），最后点炮胡牌。若自摸则算"不求人"。',
      en: 'No claimed discards (concealed kongs allowed); win by discard.',
      de: 'Keine beanspruchten Abwürfe (verdeckte Kongs erlaubt); Sieg durch Abwurf.',
    },
  },
  '平和': {
    value: 2,
    tiles: '🀇🀈🀉 🀊🀋🀌 🀙🀚🀛 🀐🀑🀒 🀌🀌',
    desc: {
      zh: '四组面子全是顺子，雀头是数字牌（非字牌），且没有其他特殊条件。最基础的番型。',
      en: 'Four sequences and a non-honor pair. The most basic scoring hand.',
      de: 'Vier Sequenzen und ein Nicht-Ehren-Paar. Die grundlegendste Wertungshand.',
    },
  },
  '四归一': {
    value: 2,
    tiles: '🀇🀇🀇🀇（分布在不同面子）',
    desc: {
      zh: '某种牌的四张全都在自己手里，但没有构成杠（分散在各组面子中）。',
      en: 'All four of the same tile are in hand, but not declared as a kong.',
      de: 'Alle vier gleichen Steine in der Hand, aber nicht als Kong deklariert.',
    },
  },
  '双同刻': {
    value: 2,
    tiles: '🀉🀉🀉 🀛🀛🀛 🀇🀈🀉 🀊🀋🀌 🀙🀙',
    desc: {
      zh: '两门不同花色各有一组点数相同的刻子（如三万刻+三筒刻）。',
      en: 'Triplets of the same rank in two different suits.',
      de: 'Drillinge desselben Wertes in zwei verschiedenen Farben.',
    },
  },
  '双暗刻': {
    value: 2,
    tiles: '🀇🀇🀇 🀉🀉🀉 🀇🀈🀉 🀊🀋🀌 🀙🀙',
    desc: {
      zh: '手牌中有两组暗刻（自摸状态下的刻子，不是靠碰得来的）。',
      en: 'Two concealed triplets in hand.',
      de: 'Zwei verdeckte Drillinge in der Hand.',
    },
  },
  '暗杠': {
    value: 2,
    tiles: '（一次暗杠操作）',
    desc: {
      zh: '手摸到第四张相同的牌，不亮出来进行暗杠。每个暗杠计2番，可叠加。',
      en: 'A concealed kong (four identical tiles kept hidden). 2 fan per kong.',
      de: 'Ein verdeckter Kong (vier identische Steine verborgen). 2 Fan pro Kong.',
    },
  },
  '断幺': {
    value: 2,
    tiles: '🀈🀉🀊 🀚🀛🀜 🀑🀒🀓 🀊🀊🀊 🀈🀈',
    desc: {
      zh: '全部是2-8的数字牌，没有幺九牌（1和9），也没有字牌。',
      en: 'All tiles are 2–8 (no terminals 1 or 9, no honor tiles). Also called "Tanyao".',
      de: 'Alle Steine sind 2–8 (keine Terminale 1 oder 9, keine Ehrensteine).',
    },
  },

  /* ══════════════════════ 1 番 ══════════════════════ */
  '一般高': {
    value: 1,
    tiles: '🀇🀈🀉 🀇🀈🀉 🀊🀋🀌 🀍🀎🀏 🀙🀙',
    desc: {
      zh: '同一花色的同一组顺子出现两次（如两组一二三万）。',
      en: 'The same sequence appears twice in one suit.',
      de: 'Dieselbe Sequenz erscheint zweimal in einer Farbe.',
    },
  },
  '喜相逢': {
    value: 1,
    tiles: '🀇🀈🀉 🀙🀚🀛 🀊🀋🀌 🀌🀌🀌 🀐🀐',
    desc: {
      zh: '两门不同花色各有一组起始点数相同的顺子（如一万二万三万 + 一筒二筒三筒）。',
      en: 'Same-rank sequence in two different suits (e.g. 1-2-3 in characters and circles).',
      de: 'Sequenz desselben Startwerts in zwei verschiedenen Farben.',
    },
  },
  '连六': {
    value: 1,
    tiles: '🀇🀈🀉 🀊🀋🀌 🀉🀉🀉 🀙🀚🀛 🀐🀐',
    desc: {
      zh: '同一花色中，两组顺子首尾相连形成六张连续（如123+456=123456）。',
      en: 'Two sequences in one suit that together form six consecutive tiles.',
      de: 'Zwei Sequenzen in einer Farbe, die zusammen sechs aufeinanderfolgende Steine bilden.',
    },
  },
  '老少副': {
    value: 1,
    tiles: '🀇🀈🀉 🀍🀎🀏 🀉🀉🀉 🀙🀚🀛 🀐🀐',
    desc: {
      zh: '同一花色中同时有123和789两组顺子（老头牌与末尾牌同时出现）。',
      en: 'One suit has both a 1-2-3 and a 7-8-9 sequence.',
      de: 'Eine Farbe hat sowohl eine 1-2-3 als auch eine 7-8-9 Sequenz.',
    },
  },
  '幺九刻': {
    value: 1,
    tiles: '🀇🀇🀇 🀈🀉🀊 🀙🀚🀛 🀐🀑🀒 🀙🀙',
    desc: {
      zh: '碰了一组幺九牌（1或9）的刻子（非箭牌，非圈风，非门风）。可重复计算。',
      en: 'A triplet of a terminal tile (1 or 9), not a dragon or wind. 1 fan per such triplet.',
      de: 'Ein Drilling eines Terminal-Steins (1 oder 9), kein Drache oder Wind.',
    },
  },
  '明杠': {
    value: 1,
    tiles: '（一次明杠操作）',
    desc: {
      zh: '将碰来的刻子加上第四张变成明杠，每个明杠计1番，可叠加。',
      en: 'An open kong (triplet extended by a fourth tile, revealed). 1 fan per kong.',
      de: 'Ein offener Kong (Drilling um einen vierten Stein erweitert). 1 Fan pro Kong.',
    },
  },
  '缺一门': {
    value: 1,
    tiles: '🀇🀈🀉 🀇🀇🀇 🀙🀚🀛 🀙🀙🀙 🀀🀀',
    desc: {
      zh: '数字牌只用了万、筒、条三门中的两门，缺少一门花色（但可以有字牌）。',
      en: 'Only two of the three number suits are used (characters, circles, bamboo); one is missing.',
      de: 'Nur zwei der drei Zahlfarben werden verwendet; eine fehlt.',
    },
  },
  '无字': {
    value: 1,
    tiles: '🀇🀈🀉 🀊🀋🀌 🀙🀚🀛 🀐🀑🀒 🀌🀌',
    desc: {
      zh: '全部是数字牌（万/筒/条），没有任何字牌（风/箭）。',
      en: 'All tiles are number tiles (characters, circles, bamboo); no honor tiles.',
      de: 'Alle Steine sind Zahlensteine; keine Ehrensteine.',
    },
  },
  '边张': {
    value: 1,
    tiles: '🀇🀇🀇 🀈🀉？ 🀙🀚🀛 🀐🀑🀒 🀌🀌',
    desc: {
      zh: '听的是边张（只有一种牌可以胡）：等123的3，或等789的7。',
      en: 'Waiting on a one-sided wait: the 3 to complete 1-2-3, or the 7 to complete 7-8-9.',
      de: 'Warten auf einen einseitigen Abschluss: die 3 für 1-2-3 oder die 7 für 7-8-9.',
    },
  },
  '坎张': {
    value: 1,
    tiles: '🀇🀇🀇 🀈？🀊 🀙🀚🀛 🀐🀑🀒 🀌🀌',
    desc: {
      zh: '听的是嵌张（中间张）：等一组顺子中间的那张牌（如等3凑成2-3-4）。',
      en: 'Waiting on the middle tile of a sequence (e.g. the 3 to complete 2-3-4).',
      de: 'Warten auf den mittleren Stein einer Sequenz (z. B. die 3 für 2-3-4).',
    },
  },
  '单钓将': {
    value: 1,
    tiles: '🀇🀈🀉 🀊🀋🀌 🀙🀚🀛 🀐🀑🀒 ？？',
    desc: {
      zh: '只等一张特定的牌作为雀头（将牌），四组面子已凑齐，单等将牌。',
      en: 'Waiting only on the pair tile with all four sets complete.',
      de: 'Nur auf den Paar-Stein warten, alle vier Sätze sind vollständig.',
    },
  },
  '自摸': {
    value: 1,
    tiles: '（自己摸牌和牌）',
    desc: {
      zh: '不靠别人打牌，自己从牌墙摸到胡牌的那张。',
      en: 'Win by drawing the winning tile yourself from the wall.',
      de: 'Sieg durch eigenes Ziehen des Siegsteins von der Mauer.',
    },
  },
  '花牌': {
    value: 1,
    tiles: '（每张花牌各计1番）',
    desc: {
      zh: '花牌（梅兰菊竹春夏秋冬）不参与和牌组合，每摸到一张计1番。',
      en: 'Flower tiles (Plum, Orchid, Chrysanthemum, Bamboo, Spring, Summer, Autumn, Winter) score 1 fan each.',
      de: 'Blumensteine (Pflaume, Orchidee, Chrysantheme, Bambus usw.) geben je 1 Fan.',
    },
  },
};

// 按番值分组，供规则页使用
export const FAN_TIERS_ORDERED = [88, 64, 48, 32, 24, 16, 12, 8, 6, 4, 2, 1];

export function getFansByTier(value) {
  return Object.entries(FAN_DICT)
    .filter(([, d]) => d.value === value)
    .map(([name, d]) => ({ name, ...d }));
}
