// S3 验收：utils/category-tabs.js（TDD 红→绿）
const { buildTabs, applyFilter } = require('../utils/category-tabs');

describe('buildTabs', () => {
  test('首项恒为"全部"，分类按出现顺序去重', () => {
    const tabs = buildTabs([
      { categoryId: 3, name: 'X' }, { categoryId: 1, name: 'Y' },
      { categoryId: 3, name: 'Z' }, { categoryId: 1, name: 'W' }
    ]);
    expect(tabs.map(t => t.id)).toEqual([0, 3, 1]);
    expect(tabs[0].name).toBe('全部');
  });

  test('空列表 → 仅"全部"', () => {
    expect(buildTabs([])).toEqual([{ id: 0, name: '全部' }]);
  });
});

describe('applyFilter', () => {
  const list = [
    { categoryId: 3, name: 'X' }, { categoryId: 1, name: 'Y' }, { categoryId: 3, name: 'Z' }
  ];
  test('catId=0 返回全部（原数组内容）', () => {
    expect(applyFilter(list, 0)).toHaveLength(3);
  });
  test('按分类过滤', () => {
    expect(applyFilter(list, 3).map(i => i.name)).toEqual(['X', 'Z']);
  });
  test('无匹配返回空数组', () => {
    expect(applyFilter(list, 99)).toEqual([]);
  });
});
