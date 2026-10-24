# -*- coding: utf-8 -*-
"""一次性脚本：JS 数据 emoji -> 图标名；对应 wxml 改为 i-{{item.icon}} 类绑定。"""
import io
import re

# ---------- index.js 分类宫格 ----------
p = 'pages/index/index.js'
s = io.open(p, encoding='utf-8').read()
cat_map = [
    ("icon: '🍜'", "icon: 'store'"), ("icon: '🍰'", "icon: 'gift'"),
    ("icon: '🍔'", "icon: 'bag'"), ("icon: '🔥'", "icon: 'hot'"),
    ("icon: '🍝'", "icon: 'store'"), ("icon: '🍗'", "icon: 'hot'"),
    ("icon: '🍽️'", "icon: 'store'"), ("icon: '🥕'", "icon: 'list'"),
    ("icon: '🏆'", "icon: 'star-fill'"), ("icon: '☰'", "icon: 'grid'"),
]
for old, new in cat_map:
    s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

# index.wxml 渲染点
p = 'pages/index/index.wxml'
s = io.open(p, encoding='utf-8').read()
s = s.replace('<text class="grid-icon-emoji" style="color: {{item.iconColor}}">{{item.icon}}</text>',
              '<text class="grid-icon-emoji i i-{{item.icon}}" style="color: {{item.iconColor}}"></text>')
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

# ---------- help.js ----------
p = 'pages/help/help.js'
s = io.open(p, encoding='utf-8').read()
help_map = [
    ("icon: 'question', iconText: '❓',", "icon: 'help',"),
    ("icon: 'user', iconText: '👤',", "icon: 'user',"),
    ("icon: 'credit-card', iconText: '💳',", "icon: 'card',"),
    ("icon: 'truck', iconText: '🚚',", "icon: 'bag',"),
]
for old, new in help_map:
    assert old in s, old
    s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

# help.wxml 渲染点
p = 'pages/help/help.wxml'
s = io.open(p, encoding='utf-8').read()
s = s.replace('<view class="s-icon s-icon-orange"><text>{{item.iconText}}</text></view>',
              '<view class="s-icon s-icon-orange"><text class="i i-{{item.icon}}"></text></view>')
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

# ---------- about.js ----------
p = 'pages/about/about.js'
s = io.open(p, encoding='utf-8').read()
about_map = [
    ("icon: 'utensils', iconText: '🍴',", "icon: 'store',"),
    ("icon: 'rocket', iconText: '🚀',", "icon: 'clock',"),
    ("icon: 'credit-card', iconText: '💳',", "icon: 'card',"),
    ("icon: 'star', iconText: '⭐',", "icon: 'star-fill',"),
]
for old, new in about_map:
    assert old in s, old
    s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

# about.wxml 渲染点
p = 'pages/about/about.wxml'
s = io.open(p, encoding='utf-8').read()
s = s.replace('<text class="feature-emoji">{{item.iconText}}</text>',
              '<text class="feature-emoji i i-{{item.icon}}"></text>')
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

# ---------- feedback.js 类型 ----------
p = 'pages/feedback/feedback.js'
s = io.open(p, encoding='utf-8').read()
fb_map = [
    ("iconText: '💡'", "icon: 'edit'"),
    ("iconText: '🐛'", "icon: 'help'"),
    ("iconText: '📱'", "icon: 'phone'"),
    ("iconText: '✏️'", "icon: 'edit'"),
]
for old, new in fb_map:
    assert old in s, old
    s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

# feedback.wxml 渲染点
p = 'pages/feedback/feedback.wxml'
s = io.open(p, encoding='utf-8').read()
s = s.replace('<text class="type-chip-icon">{{item.iconText}}</text>',
              '<text class="type-chip-icon i i-{{item.icon}}"></text>')
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

# ---------- points.wxml 积分商城兜底 emoji ----------
p = 'pages/points/points.wxml'
s = io.open(p, encoding='utf-8').read()
s = s.replace('<text class="product-icon" wx:if="{{!item.image}}" style="font-size:64rpx;">{{item.iconText || \'\\uD83C\\uDFAB\'}}</text>',
              '<text class="product-icon i i-ticket" wx:if="{{!item.image}}"></text>')
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

print('data-driven icons fixed')
