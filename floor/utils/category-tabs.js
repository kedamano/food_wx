// 商家内分类 tab 的纯函数（从 pages/store-detail 抽离，便于单测）

function buildTabs(list) {
  var tabs = [{ id: 0, name: '全部' }];
  var seen = {};
  for (var i = 0; i < list.length; i++) {
    var cid = list[i].categoryId;
    if (cid && !seen[cid]) {
      seen[cid] = true;
      tabs.push({ id: cid, name: list[i].categoryName || ('分类' + cid) });
    }
  }
  return tabs;
}

function applyFilter(list, catId) {
  if (!catId) return list;
  var filtered = [];
  for (var i = 0; i < list.length; i++) {
    if (list[i].categoryId === catId) filtered.push(list[i]);
  }
  return filtered;
}

module.exports = {
  buildTabs: buildTabs,
  applyFilter: applyFilter
};
