# -*- coding: utf-8 -*-
import os, re

def u(s):
    return s.decode('utf-8') if isinstance(s, bytes) else s

ICON_MAP = {
    'fa-utensils': u('\xf0\x9f\x8d\xb4'),
    'fa-rocket': u('\xf0\x9f\x9a\x80'),
    'fa-credit-card': u('\xf0\x9f\x92\xb3'),
    'fa-star': u('\xe2\xad\x90'),
    'fa-book': u('\xf0\x9f\x93\x9a'),
    'fa-map-marker': u('\xf0\x9f\x93\x8d'),
    'fa-question-circle': u('\xe2\x9d\x93'),
    'fa-user': u('\xf0\x9f\x91\xa4'),
    'fa-truck': u('\xf0\x9f\x9a\x9a'),
    'fa-lightbulb': u('\xf0\x9f\x92\xa1'),
    'fa-bug': u('\xf0\x9f\x90\x9b'),
    'fa-mobile-alt': u('\xf0\x9f\x93\xb1'),
    'fa-pen': u('\xe2\x9c\x8f'),
    'fa-comment-dollar': u('\xf0\x9f\x92\xac'),
    'fa-money-bill-wave': u('\xf0\x9f\x92\xb5'),
    'fa-wallet': u('\xf0\x9f\x91\x9b'),
    'fa-hourglass-half': u('\xe2\x8f\xb3'),
    'fa-bicycle': u('\xf0\x9f\x9a\xb2'),
    'fa-check-circle': u('\xe2\x9c\x85'),
    'fa-heart': u('\xe2\x9d\xa4'),
    'fa-heart-o': u('\xe2\x99\xa1'),
    'fa-apple': u('\xf0\x9f\x8d\x8e'),
    'fa-desktop': u('\xf0\x9f\x96\xa5'),
}

BASE = r'D:\work\项目\food_wx\floor'

def fix_js_icon_text(filepath, mapping):
    """Add iconText field to JS data objects."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for fa_icon, emoji in mapping.items():
        # Pattern 1: icon: 'fa-xxx', (no quotes around key)
        pattern = r"(icon):\s*('" + re.escape(fa_icon) + "')"
        replacement = r"\1: \2, iconText: '" + emoji + "'"
        content = re.sub(pattern, replacement, content)
        # Pattern 2: statusIcon: 'fa-xxx',
        pattern2 = r"(statusIcon):\s*('" + re.escape(fa_icon) + "')"
        replacement2 = r"\1: \2, statusIconText: '" + emoji + "'"
        content = re.sub(pattern2, replacement2, content)
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'FIXED JS: {os.path.basename(filepath)}')
        return True
    else:
        print(f'NO MATCH: {os.path.basename(filepath)}')
    return False

# JS files to fix
js_files = [
    (os.path.join(BASE, 'pages', 'about', 'about.js'), ['fa-utensils', 'fa-rocket', 'fa-credit-card', 'fa-star']),
    (os.path.join(BASE, 'pages', 'topic', 'topic.js'), ['fa-star', 'fa-book', 'fa-map-marker']),
    (os.path.join(BASE, 'pages', 'help', 'help.js'), ['fa-question-circle', 'fa-user', 'fa-credit-card', 'fa-truck']),
    (os.path.join(BASE, 'pages', 'feedback', 'feedback.js'), ['fa-lightbulb', 'fa-bug', 'fa-mobile-alt', 'fa-pen']),
    (os.path.join(BASE, 'pages', 'payment', 'payment.js'), ['fa-comment-dollar', 'fa-money-bill-wave', 'fa-credit-card', 'fa-wallet']),
    (os.path.join(BASE, 'pages', 'payment-add', 'payment-add.js'), ['fa-comment-dollar', 'fa-money-bill-wave', 'fa-credit-card', 'fa-wallet']),
    (os.path.join(BASE, 'pages', 'order-detail', 'order-detail.js'), ['fa-hourglass-half', 'fa-utensils', 'fa-bicycle', 'fa-check-circle']),
]

for fp, icons in js_files:
    mapping = {k: ICON_MAP[k] for k in icons}
    fix_js_icon_text(fp, mapping)

# Fix WXML files
def fix_wxml(fp, fallback_emoji):
    if not os.path.exists(fp):
        print(f'NOT FOUND: {fp}')
        return
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    # Replace <text class="fa {{...}} ...">...</text> patterns
    # Pattern 1: <text class="fa {{...}}" ...>...</text> where inner text is empty or fa class
    content = re.sub(
        r'<text\s+class="fa\s+\{\{[^}]+\}\}([^"]*)">[^<]*</text>',
        r'<text\1>{{iconText || "' + fallback_emoji + '"}}</text>',
        content
    )
    if content != original:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'FIXED WXML: {os.path.basename(fp)}')

# Fix user-reviews.js - isLiked is dynamic, add helper method
ur_js = os.path.join(BASE, 'pages', 'user-reviews', 'user-reviews.js')
if os.path.exists(ur_js):
    with open(ur_js, 'r', encoding='utf-8') as f:
        content = f.read()
    # Check if there's an onLoad or data section we can add a helper to
    if 'iconText' not in content and 'isLiked' in content:
        # We need to add a helper function. For now, just add iconText after isLiked in wxml
        print('user-reviews.js: needs dynamic fix - will handle in wxml')

# Fix store-detail.js - isCollected dynamic
sd_js = os.path.join(BASE, 'pages', 'store-detail', 'store-detail.js')
if os.path.exists(sd_js):
    with open(sd_js, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'isCollected' in content:
        print('store-detail.js: dynamic isCollected - will handle in wxml')

# Fix device-management.js - platform dynamic
dm_js = os.path.join(BASE, 'pages', 'device-management', 'device-management.js')
if os.path.exists(dm_js):
    with open(dm_js, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'platform' in content:
        print('device-management.js: dynamic platform - will handle in wxml')

# Special WXML fixes for dynamic icons
special_wxml_fixes = [
    (os.path.join(BASE, 'pages', 'user-reviews', 'user-reviews.wxml'),
     [('fa-heart', 'fa-heart-o', u('\xe2\x9d\xa4'), u('\xe2\x99\xa1'))]),
    (os.path.join(BASE, 'pages', 'store-detail', 'store-detail.wxml'),
     [('fa-heart', None, u('\xe2\x9d\xa4'), None)]),
    (os.path.join(BASE, 'pages', 'device-management', 'device-management.wxml'),
     [('fa-apple', 'fa-desktop', u('\xf0\x9f\x8d\x8e'), u('\xf0\x9f\x96\xa5'))]),
]

for fp, heart_fixes in special_wxml_fixes:
    if not os.path.exists(fp):
        print(f'NOT FOUND: {fp}')
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for filled, empty, filled_emoji, empty_emoji in heart_fixes:
        # Handle conditional: item.isLiked ? 'fa-heart' : 'fa-heart-o'
        # or: isCollected ? 'fa-heart' : 'fa-heart'
        # Replace class="fa {{... ? 'fa-heart' : 'fa-heart-o'}}"
        cond_pat = r"class=\"fa\s+\{\{[^}]*\?'" + re.escape(filled) + r"[^}]*:[^}]*'" + re.escape(empty if empty else filled) + r"'[^}]*\}\}"
        content = re.sub(cond_pat, 'class=""', content)
        # Also handle simple: class="fa {{icon}}" patterns
        content = re.sub(
            r'<text\s+class="fa\s+\{\{[^}]+\}\}([^"]*)">[^<]*</text>',
            r'<text\1>{{iconText || "' + (filled_emoji or '') + '"}}</text>',
            content
        )
    if content != original:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'FIXED SPECIAL WXML: {os.path.basename(fp)}')

# order-detail.wxml - statusIcon dynamic
od_wxml = os.path.join(BASE, 'pages', 'order-detail', 'order-detail.wxml')
if os.path.exists(od_wxml):
    with open(od_wxml, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    # Replace <text class="fa {{statusIcon}} ...">...</text>
    content = re.sub(
        r'<text\s+class="fa\s+\{\{statusIcon\}\}([^"]*)">[^<]*</text>',
        r'<text\1>{{statusIconText || "?"}}</text>',
        content
    )
    if content != original:
        with open(od_wxml, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'FIXED: order-detail.wxml')

print('\nDone!')
