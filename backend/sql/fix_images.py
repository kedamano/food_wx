# -*- coding: utf-8 -*-
"""清理 0 字节图片、旧瓦片残留；gen_demo 池过滤空文件。"""
import io
import os

ROOT = r'D:\work\项目\food_wx'

# 1) 删除 0 字节图片（双端）
removed = 0
for base in ['floor/images/foods', 'images/foods', 'floor/images/avatars', 'images/avatars',
             'floor/images/stores', 'images/stores']:
    full_base = os.path.join(ROOT, base)
    if not os.path.isdir(full_base):
        continue
    for f in os.listdir(full_base):
        p = os.path.join(full_base, f)
        if f.endswith('.png') and os.path.getsize(p) == 0:
            os.remove(p)
            removed += 1
            print('removed empty:', base + '/' + f)
print('empty removed:', removed)

# 2) 删除旧瓦片残留 food_*.jpg（DB 已改指向 dish_*.jpg）
n = 0
for base in ['floor/images/foods', 'images/foods']:
    full_base = os.path.join(ROOT, base)
    for f in os.listdir(full_base):
        if f.startswith('food_') and f.endswith('.jpg'):
            os.remove(os.path.join(full_base, f))
            n += 1
print('old tiles removed:', n)

# 3) gen_demo：png 池过滤 0 字节；store_files 兜底读文件系统
p = os.path.join(ROOT, 'backend', 'sql', 'gen_demo.py')
s = io.open(p, encoding='utf-8').read()
old_png = """for f in sorted(os.listdir(FLOOR_FOODS)):
    if f.endswith('.png'):
        food_files.append('/images/foods/' + f)"""
new_png = """for f in sorted(os.listdir(FLOOR_FOODS)):
    fp = os.path.join(FLOOR_FOODS, f)
    if f.endswith('.png') and os.path.getsize(fp) > 0:
        food_files.append('/images/foods/' + f)"""
assert old_png in s
s = s.replace(old_png, new_png, 1)

old_store = """store_files = []
if os.path.exists('tmp_img/pools.json'):
    store_files = json.load(open('tmp_img/pools.json'))['stores']"""
new_store = """store_files = []
if os.path.exists('tmp_img/pools.json'):
    store_files = json.load(open('tmp_img/pools.json'))['stores']
else:
    sd = os.path.join(FLOOR_IMG, 'stores')
    store_files = ['/images/stores/' + f for f in sorted(os.listdir(sd)) if f.endswith('.jpg')]"""
assert old_store in s
s = s.replace(old_store, new_store, 1)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('gen_demo patched')
