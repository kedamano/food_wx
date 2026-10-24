# -*- coding: utf-8 -*-
"""一次性生成器：
1) PIL 生成 40 张菜品图 + 12 张商家招牌图（双端拷贝：floor 包内 + 根目录后端静态）
2) 生成 backend/sql/demo_data.sql：商家/商品/订单/明细/收藏/优惠券/评价/地址各约 500 条
"""
import io
import json
import os
import random
from PIL import Image, ImageDraw, ImageFont

random.seed(20261024)
ROOT = r'D:\work\项目\food_wx'
FLOOR_IMG = os.path.join(ROOT, 'floor', 'images')
ROOT_IMG = os.path.join(ROOT, 'images')
FONT = 'C:/Windows/Fonts/msyh.ttc'

# ============ 1. 图片生成 ============
CAT_HUES = {
    1: ((255, 205, 150), (255, 138, 101)),   # 面食 暖橙
    2: ((255, 214, 165), (255, 138, 128)),   # 披萨
    3: ((255, 190, 118), (240, 98, 146)),    # 汉堡
    4: ((255, 224, 178), (255, 171, 145)),   # 甜品 柔粉
    5: ((255, 158, 128), (229, 80, 57)),     # 川菜 红
    6: ((255, 229, 180), (255, 171, 64)),    # 粤菜 金
    7: ((255, 171, 145), (239, 83, 80)),     # 火锅烧烤
    8: ((173, 216, 230), (100, 181, 246)),   # 日料 蓝
    9: ((255, 236, 179), (255, 202, 40)),    # 饮品小吃
    10: ((200, 230, 201), (129, 199, 132)),  # 生鲜 绿
}

def grad_tile(w, h, c1, c2, label, font_size, radius=28):
    img = Image.new('RGB', (w * 2, h * 2))
    d = ImageDraw.Draw(img)
    for y in range(h * 2):
        t = y / (h * 2)
        d.line([(0, y), (w * 2, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(c1, c2)))
    try:
        f = ImageFont.truetype(FONT, font_size * 2)
    except Exception:
        f = ImageFont.truetype(FONT, font_size)
    bbox = d.textbbox((0, 0), label, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((w * 2 - tw) / 2 - bbox[0], (h * 2 - th) / 2 - bbox[1]), label, fill=(255, 255, 255), font=f)
    return img.resize((w, h), Image.LANCZOS)

def save_jpg(img, rel, quality=70):
    for base in (FLOOR_IMG, ROOT_IMG):
        path = os.path.join(base, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        img.save(path, 'JPEG', quality=quality)

DISHES = {
    1: ['兰州拉面', '武汉热干面', '重庆小面', '刀削面', '葱油拌面', '炸酱面', '肥肠粉', '云吞面', '牛腩面', '担担面', '酸辣粉', '阳春面'],
    2: ['玛格丽特披萨', '香肠披萨', '夏威夷披萨', '榴莲披萨', '培根薯角披萨', '海鲜至尊披萨', '四合一披萨', '鸡肉蘑菇披萨'],
    3: ['经典芝士堡', '双层牛肉堡', '香辣鸡腿堡', '板烧鸡腿堡', '培根蛋堡', '鳕鱼堡', '藤椒鸡排堡', '牛肉至尊堡'],
    4: ['提拉米苏', '芒果班戟', '杨枝甘露', '雪山包', '焦糖布丁', '葡式蛋挞', '双皮奶', '草莓蛋糕卷'],
    5: ['麻婆豆腐', '水煮鱼', '回锅肉', '宫保鸡丁', '辣子鸡', '毛血旺', '鱼香肉丝', '水煮牛肉', '夫妻肺片', '干煸四季豆'],
    6: ['白切鸡', '蜜汁叉烧', '清蒸鲈鱼', '虾饺', '干炒牛河', '煲仔饭', '豉汁凤爪', '艇仔粥'],
    7: ['麻辣火锅', '潮汕牛肉锅', '番茄鸳鸯锅', '烤羊肉串', '炭烤五花肉', '锡纸烤鱼', '炭烤生蚝', '韩式烤肉'],
    8: ['三文鱼刺身', '鳗鱼饭', '天妇罗', '豚骨拉面', '加州卷', '唐扬鸡块', '亲子丼', '味噌拉面'],
    9: ['珍珠奶茶', '手打柠檬茶', '杨梅饮', '冰粉', '章鱼小丸子', '鸡蛋仔', '凉皮', '狼牙土豆'],
    10: ['智利车厘子', '阳光玫瑰葡萄', '有机蔬菜拼', '谷饲牛排', '土鸡蛋', '五常大米'],
}

print('构建真实图片池（floor/images 优先，过滤 0 字节/不存在文件）...')
def build_pool(subdir, prefix):
    pool = []
    seen = set()
    for base in (FLOOR_IMG, ROOT_IMG):
        d = os.path.join(base, subdir)
        if not os.path.isdir(d):
            continue
        for f in sorted(os.listdir(d)):
            fp = os.path.join(d, f)
            rel = '/images/' + subdir + '/' + f
            if rel in seen or f.startswith('.'):
                continue
            if os.path.getsize(fp) <= 0:
                continue
            seen.add(rel)
            pool.append(rel)
    return pool

food_files = build_pool('foods', 'dish_')
store_files = build_pool('stores', 'store_photo')
assert len(food_files) > 20, '菜品图池过小: %d' % len(food_files)
assert len(store_files) > 5, '商家图池过小: %d' % len(store_files)

# ============ 2. SQL 生成 ============
CITIES = ('广东省', '深圳市')
DISTRICTS = ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区', '龙华区', '南山区', '福田区']
ROADS = ['科技园南路', '深南大道', '福华路', '桂园路', '宝安大道', '龙翔大道', '民治大道', '创业路', '后海大道', '彩田路']
ESTATES = ['万科城', '中海阳光苑', '星河丹堤', '半岛城邦', '华润城', '大冲新城花园', '四季家园', '绿景虹湾', '龙光城', '金域缇香']
BRANDS = ['蜀香', '粤海', '北方', '江南', '食在', '味觉', '暖胃', '深夜', '转角', '巷子',
          '老王', '阿强', '幸福', '旺角', '磁石', '小满', '功夫', '遇见', '禾木', '沸腾']
SUFFIX = ['小馆', '人家', '食府', '餐厅', '美食城', '厨房', '大牌档', 'Express店']
NAMES = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑爽', '冯 eleven',
         '陈晨', '林悦', '黄磊', '徐静', '何平', '高远', '罗成', '宋佳', '谢婷', '唐磊']
REVIEW_5 = ['味道很赞，分量足，下次还点！', '配送很快，到手还是热的，好评！', '包装很用心，卖相和味道都在线。',
            '回购好几次了，出品稳定，强烈推荐！', '性价比很高，家人都爱吃。', '汤汁浓郁，米饭杀手！']
REVIEW_4 = ['整体不错，稍微有点咸。', '味道可以，配送慢了一些。', '分量扎实，口味中等偏上。',
            '不错，比想象中好，还会再来。', '正常发挥，解馋够了。']
REVIEW_3 = ['一般般，凑合能吃。', '有点凉了，味道还行。', '量和图片有差距，味道普通。']
COUPON_POOL = [(8, 30), (15, 50), (5, 20), (20, 80), (10, 40), (30, 120), (12, 45), (6, 25)]

def esc(t):
    return t.replace('\\', '\\\\').replace("'", "''")

def dt(days_ago):
    import datetime
    base = datetime.datetime(2026, 10, 24, 20, 0, 0)
    t = base - datetime.timedelta(days=days_ago,
                                  hours=random.randint(0, 12),
                                  minutes=random.randint(0, 59))
    return t.strftime('%Y-%m-%d %H:%M:%S')

sql = []
sql.append('-- 自动生成的演示数据（每类约 500 条，向 zhangsan/user_id=1 加权）')
sql.append('SET NAMES utf8mb4;')
sql.append('USE food_wx;')
sql.append('SET FOREIGN_KEY_CHECKS = 0;')
sql.append("DELETE FROM order_details; DELETE FROM payment_records; DELETE FROM reviews;")
sql.append("DELETE FROM user_favorites; DELETE FROM user_coupons; DELETE FROM coupons;")
sql.append("DELETE FROM orders; DELETE FROM address; DELETE FROM users WHERE user_id > 1;")
sql.append("DELETE FROM foods; DELETE FROM stores; DELETE FROM cart; DELETE FROM points_log;")
sql.append("DELETE FROM categories;")
sql.append('SET FOREIGN_KEY_CHECKS = 1;')

# 分类（10）
all_cats = [(1, '面食'), (2, '披萨'), (3, '汉堡'), (4, '甜品'), (5, '川菜'),
            (6, '粤菜'), (7, '火锅烧烤'), (8, '日料'), (9, '饮品小吃'), (10, '生鲜超市')]
sql.append('INSERT INTO categories (category_id, category_name, sort_order, status) VALUES ' +
           ','.join("(%d,'%s',%d,1)" % (cid, esc(n), i) for i, (cid, n) in enumerate(all_cats)) + ';')

# 商家 500
stores = []
for i in range(500):
    sid = i + 1
    name = '%s%s' % (BRANDS[i % len(BRANDS)], SUFFIX[(i // len(BRANDS)) % len(SUFFIX)])
    if i >= len(BRANDS) * len(SUFFIX):
        name += str(i // 40)
    if i < 4:
        name = ['川味人家', '面点王', '汉堡世界', '粤味轩'][i]
    lat = round(random.uniform(22.52, 22.62), 6)
    lng = round(random.uniform(113.92, 114.08), 6)
    stores.append(sid)
    sql.append("INSERT INTO stores (store_id, store_name, logo, address, phone, rating, delivery_time, delivery_fee, status, lat, lng, price_level) "
               "VALUES (%d, '%s', '%s', '%s深圳市%s%s %d 号', '0755-%08d', %.1f, %d, %.1f, 1, %s, %s, %d);"
               % (sid, esc(name), random.choice(store_files),
                  CITIES[0], random.choice(DISTRICTS), random.choice(ROADS), random.randint(1, 999),
                  random.randint(10000000, 99999999),
                  round(random.uniform(3.6, 5.0), 1), random.randint(20, 55),
                  round(random.uniform(0, 6), 1), lat, lng, random.randint(15, 90)))

# 商品 500
foods = []
fid = 0
for cat, names in DISHES.items():
    for base_name in names:
        for variant in range(6):
            fid += 1
            name = base_name if variant == 0 else '%s(%s)' % (base_name, ['小份', '标准份', '大份', '双人份', '家庭分享装'][variant - 1])
            store_id = ((fid * 7) % 500) + 1
            price = round(random.uniform(12, 88), 1)
            sql.append("INSERT INTO foods (food_id, name, price, description, image, category_id, store_id, rating, sales, tags, status) "
                       "VALUES (%d, '%s', %s, '%s，新鲜制作，口味地道', '%s', %d, %d, %.1f, %d, '[\"招牌\",\"推荐\"]', 1);"
                       % (fid, esc(name), price, esc(name), random.choice(food_files), cat, store_id,
                          round(random.uniform(3.8, 5.0), 1), random.randint(20, 3000)))
            foods.append({'id': fid, 'name': name, 'price': price, 'store': store_id, 'cat': cat})

# 用户 2..51
sql.append("REPLACE INTO users (user_id, username, password, avatar, level, points, phone, role) VALUES "
           "(1, 'zhangsan', '$2a$10$lkDzJKpWZc10aEhdM6fGOOwEXbqE8N7zxXeVVX8elFREgnFa5XPqC', '/images/avatars/avatar1.png', '黄金会员', 1250, '13800138001', 'USER');")
user_rows = []
for u in range(2, 52):
    name = NAMES[(u - 2) % len(NAMES)] + (str(u) if u > 11 else '')
    phone = '13%09d' % random.randint(0, 999999999)
    user_rows.append((u, 'user%d' % u, name, phone))
    sql.append("INSERT INTO users (user_id, username, password, avatar, level, points, phone, role) "
               "VALUES (%d, '%s', '$2a$10$lkDzJKpWZc10aEhdM6fGOOwEXbqE8N7zxXeVVX8elFREgnFa5XPqC', '/images/avatars/default.png', '普通会员', %d, '%s', 'USER');"
               % (u, esc(user_rows[-1][1]), random.randint(0, 500), phone))

# 地址 500（zhangsan 12 条）
addr_count = 0
for owner in [1] * 12 + [u for u in range(2, 52) for _ in range(9)] + [random.randint(2, 51) for _ in range(8)]:
    addr_count += 1
    who = user_rows[owner - 2] if owner > 1 else (1, 'zhangsan', '张三', '13800138001')
    detail = '%s%d 号 %s %d 栋 %d 室' % (random.choice(ROADS), random.randint(1, 200),
                                        random.choice(ESTATES), random.randint(1, 18), random.randint(101, 2404))
    sql.append("INSERT INTO address (user_id, name, phone, province, city, district, detail, full_address, tag, is_default) "
               "VALUES (%d, '%s', '%s', '%s', '%s', '%s', '%s', '%s深圳市%s%s', '%s', %d);"
               % (owner, esc(who[2]), who[3], CITIES[0], CITIES[1],
                  random.choice(DISTRICTS), esc(detail), CITIES[1], esc(random.choice(DISTRICTS)), esc(detail),
                  random.choice(['home', 'work', 'other']), 1 if addr_count == 1 else 0))

# 订单 500 + 明细 + 支付记录
STATUSES = ['待付款'] * 60 + ['制作中'] * 80 + ['配送中'] * 90 + ['已完成'] * 240 + ['已取消'] * 30
owners = [1] * 150 + [random.randint(2, 51) for _ in range(350)]
random.shuffle(owners)
completed_orders = []
oid = 0
detail_rows = []
pay_rows = []
for oi in range(500):
    oid += 1
    owner = owners[oi]
    status = STATUSES[oi]
    n_items = random.choice([1, 1, 2, 2, 3])
    picks = random.sample(foods, n_items)
    total = sum(p['price'] * random.randint(1, 2) for p in picks)
    delivery = random.choice([0, 3, 5, 5, 6, 8])
    pay = round(total + delivery, 2)
    created = dt(random.randint(0, 45))
    store_id = picks[0]['store']
    addr_user = user_rows[owner - 2] if owner > 1 else (1, 'zhangsan', '张三', '13800138001')
    addr_text = '深圳市%s%s %d 号' % (random.choice(DISTRICTS), random.choice(ROADS), random.randint(1, 200))
    order_no = 'ORD' + created.replace('-', '').replace(' ', '').replace(':', '')[-14:] + ('%04d' % oid)
    sql.append("INSERT INTO orders (order_id, order_no, user_id, store_id, total_amount, delivery_fee, discount_amount, pay_amount, status, address, phone, remark, create_time, update_time) "
               "VALUES (%d, '%s', %d, %d, %s, %s, 0, %s, '%s', '%s', '%s', '%s', '%s', '%s');"
               % (oid, order_no, owner, store_id, round(total, 2), delivery, pay, status,
                  esc(addr_text), addr_user[3], random.choice(['', '不要辣', '多加餐具', '放门口']),
                  created, created))
    di = 0
    for p in picks:
        di += 1
        qty = random.randint(1, 2)
        detail_rows.append((oid, p, qty))
        sql.append("INSERT INTO order_details (order_id, food_id, food_name, price, quantity, total_price) "
                   "VALUES (%d, %d, '%s', %s, %d, %s);"
                   % (oid, p['id'], esc(p['name']), p['price'], qty, round(p['price'] * qty, 2)))
    if status not in ('待付款', '已取消'):
        pay_rows.append((oid, pay, created))
        sql.append("INSERT INTO payment_records (order_id, payment_no, payment_method, amount, status, pay_time, create_time) "
                   "VALUES (%d, 'PAY%s%04d', '%s', %s, '已支付', '%s', '%s');"
                   % (oid, created[:10].replace('-', ''), oid,
                      random.choice(['微信支付', '模拟支付', '支付宝']), pay, created, created))
    if status == '已完成':
        completed_orders.append((oid, owner, picks, created))

# 收藏 500（zhangsan 80）
fav_owners = [1] * 80 + [random.randint(2, 51) for _ in range(420)]
seen = set()
fav_count = 0
for owner in fav_owners:
    sid = random.randint(1, 500)
    key = (owner, sid)
    if key in seen:
        continue
    seen.add(key)
    fav_count += 1
    created = dt(random.randint(0, 60))
    sql.append("INSERT INTO user_favorites (user_id, store_id, create_time) VALUES (%d, %d, '%s');" % (owner, sid, created))

# 优惠券模板 500 + 用户券 300
for i in range(500):
    amount, threshold = COUPON_POOL[i % len(COUPON_POOL)]
    start = dt(random.randint(30, 60))
    end = dt(-random.randint(30, 200))  # 未来
    sql.append("INSERT INTO coupons (coupon_id, coupon_name, discount_amount, min_amount, start_time, end_time, status) "
               "VALUES (%d, '满%d减%d券', %d, %d, '%s', '%s', 1);"
               % (i + 1, threshold, amount, amount, threshold, start, end))
uc = 0
uc_owners = [1] * 60 + [random.randint(2, 51) for _ in range(240)]
for owner in uc_owners:
    uc += 1
    used = 1 if random.random() < 0.3 else 0
    sql.append("INSERT INTO user_coupons (user_id, coupon_id, is_used) VALUES (%d, %d, %d);"
               % (owner, random.randint(1, 500), used))

# 评价 500（挂在已完成订单上，同一订单可被评价多次以凑足量）
rv = 0
while rv < 500:
    oid, owner, picks, created = random.choice(completed_orders)
    rv += 1
    rating = random.choice([5, 5, 5, 5, 4, 4, 4, 3])
    content = random.choice(REVIEW_5 if rating == 5 else (REVIEW_4 if rating == 4 else REVIEW_3))
    food = random.choice(picks)
    imgs = random.choice(['[]', '[]', '["/images/foods/dish_31.jpg"]', '["/images/foods/dish_45.jpg","/images/foods/dish_12.jpg"]'])
    sql.append("INSERT INTO reviews (order_id, user_id, food_id, rating, content, images, status, create_time, update_time) "
               "VALUES (%d, %d, %d, %d, '%s', '%s', 1, '%s', '%s');"
               % (oid, owner, food['id'], rating, esc(content), imgs, created, created))

banner_files = json.load(open('tmp_img/pools.json'))['banners'] if os.path.exists('tmp_img/pools.json') else []
if len(banner_files) >= 3:
    for bi, bfile in enumerate(banner_files[:3]):
        sql.append("UPDATE banners SET image_url = '%s' WHERE id = %d;" % (bfile, bi + 1))

out = os.path.join(ROOT, 'backend', 'sql', 'demo_data.sql')
io.open(out, 'w', encoding='utf-8', newline='\n').write('\n'.join(sql) + '\n')
size_kb = os.path.getsize(out) // 1024
total_img_kb = sum(os.path.getsize(os.path.join(dp, f)) // 1024
                   for dp, dn, fn in os.walk(FLOOR_IMG) for f in fn) 
print('demo_data.sql: %d KB' % size_kb)
print('foods: 500, stores: 500, orders: 500, details: %d, addresses: %d, favorites: %d, reviews: 500, coupons: 500, user_coupons: %d'
      % (len(detail_rows), addr_count, fav_count, uc))
print('floor/images total: %d KB' % total_img_kb)
