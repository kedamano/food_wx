# -*- coding: utf-8 -*-
"""一次性脚本：从 TheMealDB / Unsplash 抓真实菜品图、商家图、banner，
PIL 裁剪压缩后写入 floor/images 与根目录 images。"""
import io
import json
import os
import subprocess
import sys
from PIL import Image

PROXY = 'http://127.0.0.1:7897'
ROOT = r'D:\work\项目\food_wx'
TMP = os.path.join(ROOT, 'backend', 'sql', 'tmp_img')
os.makedirs(TMP, exist_ok=True)

FETCHED = {}


def fetch(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 5000:
        return True
    r = subprocess.run(['curl', '-s', '-m', '25', '-x', PROXY, '-L', url, '-o', path],
                       capture_output=True)
    ok = r.returncode == 0 and os.path.exists(path) and os.path.getsize(path) > 5000
    if not ok and os.path.exists(path):
        os.remove(path)
    return ok


def save_processed(src, rel, w, h, quality=72):
    img = Image.open(src).convert('RGB')
    sw, sh = img.size
    scale = max(w / sw, h / sh)
    nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)
    img = img.resize((nw, nh), Image.LANCZOS)
    left, top = (nw - w) // 2, (nh - h) // 2
    img = img.crop((left, top, left + w, top + h))
    for base in (os.path.join(ROOT, 'floor', 'images'), os.path.join(ROOT, 'images')):
        path = os.path.join(base, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        img.save(path, 'JPEG', quality=quality)


# ---------- 1. 菜品图（TheMealDB） ----------
def mealdb_urls():
    urls = []  # (url, 分类号)  分类号对应 demo 数据 1..10
    def cat(n):
        r = subprocess.run(['curl', '-s', '-m', '20', '-x', PROXY,
                            'https://www.themealdb.com/api/json/v1/1/filter.php?c=%s' % n],
                           capture_output=True)
        try:
            meals = json.loads(r.stdout.decode('utf-8')).get('meals') or []
        except Exception:
            meals = []
        return [m['strMealThumb'] for m in meals]

    def search(kw):
        r = subprocess.run(['curl', '-s', '-m', '20', '-x', PROXY,
                            'https://www.themealdb.com/api/json/v1/1/search.php?s=%s' % kw],
                           capture_output=True)
        try:
            meals = json.loads(r.stdout.decode('utf-8')).get('meals') or []
        except Exception:
            meals = []
        return [m['strMealThumb'] for m in meals]

    per = 6
    for u in cat('Pasta')[:per]:        urls.append((u, 1))   # 面食
    for u in search('noodle')[:per]:    urls.append((u, 1))
    for u in search('pizza')[:per]:     urls.append((u, 2))   # 披萨
    for u in search('burger')[:per]:    urls.append((u, 3))   # 汉堡
    for u in cat('Dessert')[:per]:      urls.append((u, 4))   # 甜品
    for u in cat('Chicken')[:per]:      urls.append((u, 5))   # 川菜热菜用禽肉图
    for u in cat('Beef')[:per]:         urls.append((u, 5))
    for u in cat('Pork')[:4]:           urls.append((u, 6))   # 粤菜烧腊用猪肉图
    for u in search('grill')[:per]:     urls.append((u, 7))   # 火锅烧烤
    for u in search('rice')[:4]:        urls.append((u, 6))
    for u in search('sushi')[:per]:     urls.append((u, 8))   # 日料
    for u in search('salmon')[:4]:      urls.append((u, 8))
    for u in search('tea')[:4]:         urls.append((u, 9))   # 饮品小吃
    for u in search('soup')[:4]:        urls.append((u, 9))
    for u in search('salad')[:per]:     urls.append((u, 10))  # 生鲜
    for u in search('fruit')[:4]:       urls.append((u, 10))
    return urls


print('收集菜品图 URL...')
pairs = mealdb_urls()
print('URL 总数:', len(pairs))

food_files = []
idx = 0
for url, cat in pairs:
    idx += 1
    tmp_path = os.path.join(TMP, 'meal_%d.jpg' % idx)
    if not fetch(url, tmp_path):
        continue
    try:
        rel = 'foods/dish_%02d.jpg' % idx
        save_processed(tmp_path, rel, 320, 240)
        food_files.append('/images/foods/dish_%02d.jpg' % idx)
    except Exception as e:
        print('skip', url, e)

# 原 15 张 PNG 一并入池
FLOOR_FOODS = os.path.join(ROOT, 'floor', 'images', 'foods')
for f in sorted(os.listdir(FLOOR_FOODS)):
    if f.endswith('.png'):
        food_files.append('/images/foods/' + f)

print('菜品图池:', len(food_files))

# ---------- 2. 商家图 12 张（Unsplash 餐厅/美食） ----------
STORE_IDS = [
    '1555396273-367ea4eb4db5', '1517248135467-4c7edcad34c4', '1552566626-52f8b828add9',
    '1414235077428-338989a2e8c0', '1466978913421-dad2ebd01d17', '1540189549336-e6e99c3679fe',
    '1565299624946-b28f40a0ae38', '1567620905732-2d1ec7ab7445', '1546069901-ba9599a7e63c',
    '1565958011703-44f9829ba187', '1482049016688-2d3e1b311543', '1504754524776-8f4f37790ca0',
]
store_files = []
for i, pid in enumerate(STORE_IDS):
    path = os.path.join(TMP, 'store_%d.jpg' % i)
    url = 'https://images.unsplash.com/photo-%s?w=400&h=400&fit=crop&q=70&fm=jpg' % pid
    if fetch(url, path):
        try:
            rel = 'stores/store_photo_%02d.jpg' % (i + 1)
            save_processed(path, rel, 300, 300)
            store_files.append('/images/stores/store_photo_%02d.jpg' % (i + 1))
        except Exception as e:
            print('store skip', pid, e)
print('商家图池:', len(store_files))

# ---------- 3. Banner 3 张（宽幅） ----------
BANNER_IDS = ['1504674900247-0877df9cc836', '1555939594-58d7cb561ad1', '1567620905732-2d1ec7ab7445']
banner_files = []
for i, pid in enumerate(BANNER_IDS):
    path = os.path.join(TMP, 'banner_%d.jpg' % i)
    url = 'https://images.unsplash.com/photo-%s?w=750&h=360&fit=crop&q=72&fm=jpg' % pid
    if fetch(url, path):
        try:
            rel = 'banners/banner_%d.jpg' % (i + 1)
            save_processed(path, rel, 750, 360)
            banner_files.append('/images/banners/banner_%d.jpg' % (i + 1))
        except Exception as e:
            print('banner skip', pid, e)
print('banner:', len(banner_files))

json.dump({'foods': food_files, 'stores': store_files, 'banners': banner_files},
          open(os.path.join(TMP, 'pools.json'), 'w'))
print('DONE, pools.json written')
