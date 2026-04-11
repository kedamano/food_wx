# -*- coding: utf-8 -*-
fp = r'D:\work\项目\food_wx\floor\pages\order-detail\order-detail.js'
with open(fp, 'rb') as f:
    content = f.read()

# Replace double-encoded emoji bytes with correct ones
replacements = [
    (b"statusIconText: '\\xc3\\xa2\\xc2\\x8f\\xc2\\xb3'",
     b"statusIconText: '\\xe2\\x8f\\xb3'"),
    # pending iconText
    (b"iconText: '\\xc3\\xa2\\xc2\\x8f\\xc2\\xb3'",
     b"iconText: '\\xe2\\x8f\\xb3'"),
    # preparing iconText
    (b"iconText: '\\xc3\\xb0\\xc2\\x9f\\xc2\\x8d\\xc2\\xb4'",
     b"iconText: '\\xf0\\x9f\\x8d\\xb4'"),
    # delivering iconText
    (b"iconText: '\\xc3\\xb0\\xc2\\x9f\\xc2\\x9a\\xc2\\xb2'",
     b"iconText: '\\xf0\\x9f\\x9a\\xb2'"),
    # completed iconText
    (b"iconText: '\\xc3\\xa2\\xc2\\x9c\\xc2\\x85'",
     b"iconText: '\\xe2\\x9c\\x85'"),
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print('Replaced:', old[:30])

with open(fp, 'wb') as f:
    f.write(content)

print('Done')
