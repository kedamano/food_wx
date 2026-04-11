# -*- coding: utf-8 -*-
"""
批量将 WXML 中 FontAwesome class 替换为 emoji/Unicode 字符
规则：
1. <text class="fa fa-xxx ..."> → <text ...> 并在内容中插入对应 emoji
2. 纯静态 fa-xxx → 直接替换为 emoji 文字节点
3. 动态绑定 ({{...}}) → 替换为 emoji data 属性
"""

import os, re

# FontAwesome icon → emoji/Unicode 映射表
FA_EMOJI = {
    'fa-utensils': '🍴',
    'fa-store': '🏪',
    'fa-search': '🔍',
    'fa-user': '👤',
    'fa-lock': '🔒',
    'fa-eye': '👁',
    'fa-eye-slash': '🙈',
    'fa-mobile-alt': '📱',
    'fa-hashtag': '#',
    'fa-camera': '📷',
    'fa-map-marker-alt': '📍',
    'fa-fire': '🔥',
    'fa-heart': '❤️',
    'fa-heart-o': '🤍',
    'fa-share-alt': '↗',
    'fa-sync-alt': '🔄',
    'fa-edit': '✏️',
    'fa-times': '✕',
    'fa-check': '✓',
    'fa-shopping-cart': '🛒',
    'fa-arrow-left': '‹',
    'fa-comment': '💬',
    'fa-comments': '💬',
    'fa-phone': '📞',
    'fa-pen': '✏️',
    'fa-info-circle': 'ℹ',
    'fa-bullseye': '🎯',
    'fa-clipboard': '📋',
    'fa-clipboard-list': '📋',
    'fa-gift': '🎁',
    'fa-ticket-alt': '🎫',
    'fa-comment-dollar': '💳',
    'fa-shield-alt': '🛡',
    'fa-envelope': '✉️',
    'fa-star': '⭐',
    'fa-trash-can': '🗑',
    'fa-circle-xmark': '✕',
    'fa-apple': '',
    'fa-desktop': '🖥',
    'fa-hand-pointer': '👆',
    'fa-ice-cream': '🍦',
    'fa-burger': '🍔',
    'fa-bowl-rice': '🍚',
    'fa-drumstick-bite': '🍗',
    'fa-plate-wheat': '🍽️',
    'fa-carrot': '🥕',
    'fa-ranking-star': '🏆',
    'fa-th-large': '☰',
    'fa-qrcode': '⊡',
    'fa-angle-right': '›',
    'fa-angle-down': '▾',
}

def fa_to_emoji(fa_name):
    return FA_EMOJI.get(fa_name, '●')

# 匹配 <text class="...fa fa-xxx...">内容</text> 或自闭合形式
# 策略：找到含 fa 类名的 text 标签，替换 class 并在标签内容里加 emoji

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content

    # 1. 替换静态 fa 类名的 text 标签
    # 匹配形如: class="... fa fa-xxx ..."  (纯静态，无 {{)
    def replace_static_fa_text(m):
        full_tag = m.group(0)
        class_attr = m.group(1)
        
        # 提取 fa-xxx 名字
        fa_match = re.search(r'\bfa-([\w-]+)\b', class_attr)
        if not fa_match:
            return full_tag
        
        fa_name = 'fa-' + fa_match.group(1)
        emoji = fa_to_emoji(fa_name)
        
        # 移除 fa 相关 class，保留其他 class
        new_class = re.sub(r'\bfa\b', '', class_attr)
        new_class = re.sub(r'\bfa-[\w-]+\b', '', new_class)
        new_class = re.sub(r'\s+', ' ', new_class).strip()
        
        # 重建标签
        if new_class:
            # 替换 class 属性内容，并在标签中插入 emoji 作为文本
            new_tag = re.sub(r'class="[^"]*"', 'class="' + new_class + '"', full_tag)
        else:
            new_tag = re.sub(r'\s*class="[^"]*"', '', full_tag)
        
        # 如果是空文本节点 <text ...></text> 或 <text .../>，插入 emoji
        if re.search(r'>\s*<', new_tag) or new_tag.endswith('/>'):
            new_tag = re.sub(r'>\s*<\/text>', '>' + emoji + '</text>', new_tag)
            new_tag = re.sub(r'\s*/>', '>' + emoji + '</text>', new_tag)
        
        return new_tag
    
    # 只处理不含 {{ 的静态 class
    content = re.sub(
        r'<text\s[^>]*class="([^"]*\bfa\b[^"]*)"[^>]*>(?!</text>)',
        lambda m: replace_static_fa_text(m) if '{{' not in m.group(1) else m.group(0),
        content
    )

    # 2. 更精确地处理：直接匹配 <text class="fa fa-xxx [extra]"></text>
    def replace_fa_tag(m):
        before_class = m.group(1)  # class 前面的属性
        fa_class = m.group(2)      # 完整 class 值
        after_class = m.group(3)   # class 后面的属性/内容
        inner = m.group(4)         # 标签内文本

        if '{{' in fa_class:
            return m.group(0)  # 动态类名跳过

        fa_match = re.search(r'\bfa-([\w-]+)\b', fa_class)
        if not fa_match:
            return m.group(0)

        fa_name = 'fa-' + fa_match.group(1)
        emoji = fa_to_emoji(fa_name)

        # 清理 class
        new_class = re.sub(r'\bfa\b', '', fa_class)
        new_class = re.sub(r'\bfa-[\w-]+\b', '', new_class)
        new_class = re.sub(r'\s+', ' ', new_class).strip()

        if new_class:
            return '<text' + before_class + ' class="' + new_class + '"' + after_class + '>' + emoji + '</text>'
        else:
            return '<text' + before_class + after_class + '>' + emoji + '</text>'

    content = re.sub(
        r'<text([^>]*?)\s+class="([^"]*\bfa\b[^"]*)"([^>]*)>(.*?)</text>',
        replace_fa_tag,
        content,
        flags=re.DOTALL
    )

    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


wxml_dir = r'd:\work\项目\food_wx\floor'
changed = []
for root, dirs, files in os.walk(wxml_dir):
    for f in files:
        if f.endswith('.wxml'):
            path = os.path.join(root, f)
            if process_file(path):
                changed.append(os.path.relpath(path, wxml_dir))

print('已修改 %d 个文件：' % len(changed))
for p in changed:
    print('  ' + p)
