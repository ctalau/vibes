const fs = require('fs');
const vm = require('vm');
const context = {};
['keywords.js','htmlFileInfoList.js','link-to-parent.js','stopwords.js','index-1.js','index-2.js','index-3.js'].forEach(f=>{
  const code = fs.readFileSync(f, 'utf8');
  vm.runInNewContext(code, context);
});
const words = Object.assign({}, context.index1, context.index2, context.index3);
const index = {
  w: words,
  stopWords: context.stopwords,
  fil: context.htmlFileInfoList,
  link2parent: context.linkToParent
};
function search(query) {
  query = query.toLowerCase();
  const tokens = query.split(/\s+/).filter(t => t && !index.stopWords.includes(t));
  const scores = {};
  tokens.forEach(token => {
    const entry = index.w[token];
    if (!entry) return;
    entry.split(',').forEach(seg => {
      const [idStr, scoreStr] = seg.split('*');
      const id = parseInt(idStr, 10);
      const sc = parseInt(scoreStr, 10) || 0;
      if (!scores[id]) scores[id] = 0;
      scores[id] += sc;
    });
  });
  return Object.entries(scores)
    .sort((a,b) => b[1]-a[1])
    .map(([id,score]) => {
      const info = index.fil[id];
      const [path,title,desc] = info.split('@@@');
      return {path,title,desc,score};
    });
}

const results = search('structure autocorrect');
console.log(results);
