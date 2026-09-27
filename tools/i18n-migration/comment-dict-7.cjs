#!/usr/bin/env node
// Batch 7 of zh->EN comment dictionary. Loaded by translate-comments.cjs.
const PHRASES = {
  '侧': 'side', '基': 'base', '题': 'topic', '仪': 'ceremony', '情': 'mood',
  '战': 'battle', '结': 'conclude', '阈': 'threshold', '功': 'function',
  '局': 'round', '溅': 'splash', '意': 'intent', '决策': 'decision',
  '住': 'hold', '约': 'approx', '道': 'way', '脱困': 'escape',
  '步': 'step', '扇形': 'fan-shaped', '询': 'query', '预': 'pre-',
  '质': 'quality', '配': 'allocate', '操': 'operate', '确': 'confirm',
  '解决': 'resolve', '礼': 'gift', '碑': 'monument', '材': 'material',
  '幅': 'frame', '扣': 'deduct', '映': 'reflect', '箭': 'arrow',
  '求': 'request', '每': 'per', '层': 'layer', '格': 'grid',
  '至': 'up to', '增': 'gain', '幅': 'magnitude', '度': 'ratio',
  '减': 'lessen', '伤': 'wound', '受': 'suffer', '创': 'wound',
  '痕': 'scar', '迹': 'trace', '印': 'imprint', '记': 'note',
  '贴': 'sticker', '附': 'attach', '加': 'append', '增': 'augment',
  '广': 'broad', '阔': 'vast', '宽': 'broad', '广': 'wide-ranging',
  '窄': 'confined', '狭': 'narrow', '隘': 'pass', '口': 'opening',
  '门': 'gate', '户': 'door', '窗': 'window', '墙': 'wall',
  '柱': 'pillar', '梁': 'beam', '板': 'board', '板': 'plank',
  '砖': 'brick', '瓦': 'tile', '石': 'rock', '岩': 'boulder',
  '沙': 'sand', '土': 'soil', '尘': 'dust', '埃': 'speck',
  '灰': 'ash', '烬': 'embers', '烟': 'smoke', '雾': 'mist',
  '霾': 'haze', '霭': 'mist', '云': 'cloud', '霄': 'sky',
  '天': 'heaven', '宇': 'cosmos', '宙': 'universe', '界': 'realm',
  '世': 'generation', '球': 'globe', '陆': 'continent', '洲': 'continent',
  '国': 'nation', '邦': 'state', '城': 'city', '镇': 'town',
  '村': 'village', '庄': 'manor', '园': 'garden', '林': 'forest',
  '森': 'woods', '木': 'tree', '树': 'timber', '枝': 'branch',
  '叶': 'leaf', '根': 'root', '茎': 'stem', '花': 'blossom',
  '草': 'grass', '苗': 'sprout', '芽': 'bud', '果': 'fruit',
  '实': 'fruit', '籽': 'seed', '种': 'seed', '核': 'pit',
  '仁': 'kernel', '皮': 'rind', '壳': 'husk', '茎': 'stalk',
  '干': 'trunk', '梢': 'tip', '尖': 'tip', '顶': 'apex',
  '巅': 'peak', '峰': 'summit', '岭': 'ridge', '坡': 'slope',
  '谷': 'valley', '渊': 'abyss', '壑': 'ravine', '沟': 'ditch',
  '渠': 'canal', '河': 'river', '江': 'river', '溪': 'stream',
  '涧': 'mountain stream', '川': 'plain', '流': 'current',
  '湖': 'lake', '泊': 'lake', '潭': 'pool', '池': 'pond',
  '海': 'sea', '洋': 'ocean', '湾': 'bay', '港': 'harbor',
  '岸': 'shore', '滩': 'beach', '岛': 'island', '屿': 'islet',
  '礁': 'reef', '洲': 'islet', '渚': 'islet', '汀': 'sandbar',
};

module.exports = PHRASES;
if (require.main === module) {
  console.log('batch7 terms:', Object.keys(PHRASES).length);
}
