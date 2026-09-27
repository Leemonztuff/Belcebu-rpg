#!/usr/bin/env node
// Batch 12 of zh->EN comment dictionary. Loaded by translate-comments.cjs.
const PHRASES = {
  '骷髅': 'skeleton', '之': 'of', '梯': 'ladder', '命': 'life',
  '暂': 'temporarily', '律': 'law', '赌博': 'gamble', '说': 'say',
  '监听': 'listen for', '咕噜噜': 'gurgle', '史诗': 'epic', '堂之': 'hall of',
  '堂': 'hall', '叮': 'ding', '轰': 'boom', '砰': 'thud', '温暖': 'warm',
  '渐': 'gradually', '欧': 'Euro', '拆': 'disassemble', '障碍': 'obstacle',
  '困': 'stuck', '办': 'handle', '拐': 'turn', '怪叫': 'weird cry',
  '咆哮': 'roar', '低吼': 'growl', '嘶吼': 'shriek', '尖叫': 'scream',
  '惨叫': 'agonized scream', '哀嚎': 'wail', '呻吟': 'moan',
  '喘息': 'pant', '呼吸': 'breathing', '心跳声': 'heartbeat sound',
  '脚步声': 'footsteps', '跑步声': 'running steps', '落地声': 'landing sound',
  '碰撞声': 'collision sound', '撞击声': 'impact sound', '破碎声': 'shattering sound',
  '玻璃碎': 'glass shatter', '金属声': 'metallic sound', '刀剑声': 'blade sound',
  '挥砍声': 'swishing sound', '劈砍': 'chop', '斩击': 'slash attack',
  '突刺': 'thrust', '戳刺': 'jab', '锤击': 'hammer blow', '砸击': 'smash',
  '重击': 'heavy blow', '轻击': 'light hit', '连击声': 'combo sound',
  '爆裂': 'burst', '爆裂声': 'bursting sound', '爆炸声': 'explosion sound',
  '轰鸣': 'rumble', '雷鸣': 'thunderclap', '雷声': 'thunder sound',
  '风声': 'wind sound', '雨声': 'rain sound', '水声': 'water sound',
  '流水声': 'flowing water sound', '瀑布声': 'waterfall sound',
  '火焰声': 'flame sound', '燃烧声': 'burning sound', '噼啪': 'crackle',
  '沙沙': 'rustle', '簌簌': 'rustling', '嗡嗡': 'buzzing', '嗡嗡': 'humming',
  '滴答': 'tick-tock', '咔哒': 'click', '咔嚓': 'snap', '吱嘎': 'creak',
  '嘎吱': 'squeak', '咿呀': 'creaking', '呜咽': 'whimper',
  '呜呜': 'whimpering', '呼呼': 'whooshing', '呼啸': 'howling wind',
  '呼啦': 'swishing', '哗啦': 'clattering', '哗哗': 'rushing sound',
  '淙淙': 'gurgling', '潺潺': 'babbling', '汩汩': 'burbling',
  '咕嘟': 'bubbling', '咕咕': 'cooing', '叽叽': 'chirping',
  '喳喳': 'chattering', '喵喵': 'meowing', '汪汪': 'barking',
  '咩咩': 'bleating', '哞哞': 'mooing', '嘶嘶': 'hissing',
  '嚯嚯': 'whooshing', '霍霍': 'whetting', '锵锵': 'clanging',
  '当当': 'donging', '铃铃': 'ringing', '丁零': 'tinkling',
  '叮咚': 'ding-dong', '咚咚': 'thumping', '怦怦': 'pounding',
  '扑通': 'plop', '啪嗒': 'patter', '吧唧': 'squishing',
  '噗嗤': 'snort', '扑哧': 'puffing', '咯咯': 'giggling',
  '呵呵': 'chuckling', '哈哈': 'laughing', '嘿嘿': 'snickering',
  '嘻嘻': 'tittering', '嘻嘻哈哈': 'giggling and laughing',
};

module.exports = PHRASES;
if (require.main === module) {
  console.log('batch12 terms:', Object.keys(PHRASES).length);
}
