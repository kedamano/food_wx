# -*- coding: utf-8 -*-
import os, re

def u(s):
    return s.decode('utf-8') if isinstance(s, bytes) else s

ICON_MAP = {
    'fa-utensils': u('\xf0\x9f\x8d\xb4'),      # 🍴
    'fa-rocket': u('\xf0\x9f\x9a\x80'),        # 🚀
    'fa-credit-card': u('\xf0\x9f\x92\xb3'),   # 💳
    'fa-star': u('\xe2\xad\x90'),              # ⭐
    'fa-book': u('\xf0\x9f\x93\x9a'),          # 📖
    'fa-map-marker': u('\xf0\x9f\x93\x8d'),    # 📍
    'fa-question-circle': u('\xe2\x9d\x93'),   # ❓
    'fa-user': u('\xf0\x9f\x91\xa4'),           # 👤
    'fa-truck': u('\xf0\x9f\x9a\x9a'),          # 🚚
    'fa-lightbulb': u('\xf0\x9f\x92\xa1'),     # 💡
    'fa-bug': u('\xf0\x9f\x90\x9b'),           # 🐛
    'fa-mobile-alt': u('\xf0\x9f\x93\xb1'),    # 📱
    'fa-pen': u('\xe2\x9c\x8f'),               # ✏
    'fa-comment-dollar': u('\xf0\x9f\x92\xac'),# 💬
    'fa-money-bill-wave': u('\xf0\x9f\x92\xb5'),# 💵
    'fa-wallet': u('\xf0\x9f\x91\x9b'),        # 👛
    'fa-hourglass-half': u('\xe2\x8f\xb3'),    # ⏳
    'fa-bicycle': u('\xf0\x9f\x9a\xb2'),       # 🚲
    'fa-check-circle': u('\xe2\x9c\x85'),      # ✅
    'fa-heart': u('\xe2\x9d\xa4'),              # ❤️ (red heart)
    'fa-heart-o': u('\xe2\x99\xa1'),           # ♡ (empty heart)
    'fa-apple': u('\xf0\x9f\x8d\x8e'),         # 🍎
    'fa-desktop': u('\xf0\x9f\x96\xa5'),       # 🖥
}

BASE = r'D:\work\项目\food_wx\floor'

def fix_js_icon_text(filepath, mapping):
    """Add iconText field to JS data objects."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for fa_icon, emoji in mapping.items():
        # Match 'icon': 'fa-xxx' patterns (with or without trailing comma)
        pattern = r"('icon':\s*'" + re.escape(fa_icon) + "')"
        replacement = r"\1, 'iconText': '" + emoji + "'"
        content = re.sub(pattern, replacement, content)
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'FIXED JS: {filepath}')
        return True
    return False

def fix_wxml_icon(filepath, icon_expr, emoji_fallback):
    """Replace fa-xxx class bindings with emoji text."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    # Replace class="fa {{...}}" pattern with just the iconText
    # Pattern 1: <text class="fa {{...}} ..."></text> → <text>{{...}}</text>
    p1 = re.compile(r'<text\s+class="fa\s+\{\{[^}]+\}\}([^"]*)">[^<]*</text>')
    content = p1.sub(lambda m: '<text' + m.group(1) + '>{{iconText || "' + emoji_fallback + '"}}</text>', content)
    # Pattern 2: <text class="fa {{...}} ..."></text> with inner {{}}
    p2 = re.compile(r'<text\s+class="fa\s+\{\{([^}]+)\}\}([^"]*)">\{\{[^}]+\}\}</text>')
    content = p2.sub(lambda m: '<text' + m.group(2) + '>{{' + m.group(1) + '}}</text>', content)
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'FIXED WXML: {filepath}')
        return True
    return False

# JS files to fix
js_fixes = {
    os.path.join(BASE, 'pages', 'about', 'about.js'): {
        'fa-utensils': ICON_MAP['fa-utensils'],
        'fa-rocket': ICON_MAP['fa-rocket'],
        'fa-credit-card': ICON_MAP['fa-credit-card'],
        'fa-star': ICON_MAP['fa-star'],
    },
    os.path.join(BASE, 'pages', 'topic', 'topic.js'): {
        'fa-star': ICON_MAP['fa-star'],
        'fa-book': ICON_MAP['fa-book'],
        'fa-map-marker': ICON_MAP['fa-map-marker'],
    },
    os.path.join(BASE, 'pages', 'help', 'help.js'): {
        'fa-question-circle': ICON_MAP['fa-question-circle'],
        'fa-user': ICON_MAP['fa-user'],
        'fa-credit-card': ICON_MAP['fa-credit-card'],
        'fa-truck': ICON_MAP['fa-truck'],
    },
    os.path.join(BASE, 'pages', 'feedback', 'feedback.js'): {
        'fa-lightbulb': ICON_MAP['fa-lightbulb'],
        'fa-bug': ICON_MAP['fa-bug'],
        'fa-mobile-alt': ICON_MAP['fa-mobile-alt'],
        'fa-pen': ICON_MAP['fa-pen'],
    },
    os.path.join(BASE, 'pages', 'payment', 'payment.js'): {
        'fa-comment-dollar': ICON_MAP['fa-comment-dollar'],
        'fa-money-bill-wave': ICON_MAP['fa-money-bill-wave'],
        'fa-credit-card': ICON_MAP['fa-credit-card'],
        'fa-wallet': ICON_MAP['fa-wallet'],
    },
    os.path.join(BASE, 'pages', 'payment-add', 'payment-add.js'): {
        'fa-comment-dollar': ICON_MAP['fa-comment-dollar'],
        'fa-money-bill-wave': ICON_MAP['fa-money-bill-wave'],
        'fa-credit-card': ICON_MAP['fa-credit-card'],
        'fa-wallet': ICON_MAP['fa-wallet'],
    },
    os.path.join(BASE, 'pages', 'order-detail', 'order-detail.js'): {
        'fa-hourglass-half': ICON_MAP['fa-hourglass-half'],
        'fa-utensils': ICON_MAP['fa-utensils'],
        'fa-bicycle': ICON_MAP['fa-bicycle'],
        'fa-check-circle': ICON_MAP['fa-check-circle'],
    },
}

for fp, mapping in js_fixes.items():
    if not os.path.exists(fp):
        print(f'NOT FOUND: {fp}')
        continue
    fix_js_icon_text(fp, mapping)

# Fix store-detail.js: add iconText for hearts (no data, just wxml)
store_detail_js = os.path.join(BASE, 'pages', 'store-detail', 'store-detail.js')
if os.path.exists(store_detail_js):
    with open(store_detail_js, 'r', encoding='utf-8') as f:
        content = f.read()
    if "'isCollected'" in content or 'isCollected' in content:
        # The isCollected flag is set dynamically, so we just need to fix WXML
        print('store-detail.js: dynamic isCollected - WXML fix only')

# Fix user-reviews.js: isLiked is dynamic
user_reviews_js = os.path.join(BASE, 'pages', 'user-reviews', 'user-reviews.js')
if os.path.exists(user_reviews_js):
    with open(user_reviews_js, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'isLiked' in content:
        print('user-reviews.js: dynamic isLiked - WXML fix only')

# Fix device-management.js: platform is dynamic
dm_js = os.path.join(BASE, 'pages', 'device-management', 'device-management.js')
if os.path.exists(dm_js):
    with open(dm_js, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'platform' in content:
        print('device-management.js: dynamic platform - WXML fix only')

# Fix WXML files
wxml_fixes = [
    (os.path.join(BASE, 'pages', 'about', 'about.wxml'), u'\U0001f374'),
    (os.path.join(BASE, 'pages', 'topic', 'topic.wxml'), u'\U00002b50'),
    (os.path.join(BASE, 'pages', 'help', 'help.wxml'), u'\U00002753'),
    (os.path.join(BASE, 'pages', 'feedback', 'feedback.wxml'), u'\U0001f4a1'),
    (os.path.join(BASE, 'pages', 'payment', 'payment.wxml'), u'\U0001f4ac'),
    (os.path.join(BASE, 'pages', 'payment-add', 'payment-add.wxml'), u'\U0001f4ac'),
]

for fp, fallback in wxml_fixes:
    if not os.path.exists(fp):
        print(f'NOT FOUND: {fp}')
        continue
    fix_wxml_icon(fp, None, fallback)

# Special WXML fixes for dynamic icons
special_wxml_fixes = [
    (os.path.join(BASE, 'pages', 'user-reviews', 'user-reviews.wxml'),
     [(r"class=\"fa\s+\{\{item\.isLiked\s*\?\s*'fa-heart'\s*:\s*'fa-heart-o'\}\}\"", u'\U00002764\ufe0f'),
      (r"class=\"action-icon\s+\{\{item\.isLiked\s*\?\s*'liked'\s*:\s*''\}\}\"", u'')]),
    (os.path.join(BASE, 'pages', 'store-detail', 'store-detail.wxml'),
     [(r"class=\"fa\s+\{\{isCollected\s*\?\s*'fa-heart'\s*:\s*'fa-heart'\}\}\"", u'\U00002764\ufe0f')]),
    (os.path.join(BASE, 'pages', 'device-management', 'device-management.wxml'),
     [(r"class=\"fa\s+\{\{item\.platform\s*===\s*'iOS'\s*\|\|\s*item\.platform\s*===\s*'iPadOS'\s*\?\s*'fa-apple'\s*:\s*'fa-desktop'\}\}\"", u'\U0001f5a5\ufe0f')]),
]

for fp, replacements in special_wxml_fixes:
    if not os.path.exists(fp):
        print(f'NOT FOUND: {fp}')
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for pattern_str, emoji in replacements:
        content = re.sub(pattern_str, 'class=""', content)
    if content != original:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'FIXED SPECIAL WXML: {fp}')

# Also fix order-detail.wxml - statusIcon is dynamic
od_wxml = os.path.join(BASE, 'pages', 'order-detail', 'order-detail.wxml')
if os.path.exists(od_wxml):
    with open(od_wxml, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    # Replace <text class="fa {{statusIcon}} ..."></text> with emoji based on statusIcon
    content = re.sub(r'<text\s+class="fa\s+\{\{statusIcon\}\}([^"]*)">[^<]*</text>',
                     r'<text\1>{{statusIconText || "⏳"}}</text>', content)
    if content != original:
        with open(od_wxml, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'FIXED order-detail.wxml')

print('\nAll done!')
