# -*- coding: utf-8 -*-
fp = r'D:\work\项目\food_wx\floor\pages\order-detail\order-detail.js'

# Read file as binary
with open(fp, 'rb') as f:
    content = f.read()

# The file has LITERAL backslash sequences like '\xc3' (backslash + x + c + 3)
# These are 4 separate bytes. The emoji should be:
# pending '⏳' -> should be b'\xe2\x8f\xb3' (3 bytes: 0xE2 0x8F 0xB3)
# preparing '🍴' -> should be b'\xf0\x9f\x8d\xb4' (4 bytes)
# delivering '🚲' -> should be b'\xf0\x9f\x9a\xb2' (4 bytes)
# completed '✅' -> should be b'\xe2\x9c\x85' (3 bytes)

# Replace the LITERAL strings (not actual bytes)
replacements = [
    # pending emoji
    (b"iconText: '\\xc3\\xa2\\xc2\\x8f\\xc2\\xb3'",
     b"iconText: '\\xe2\\x8f\\xb3'"),
    # preparing emoji  
    (b"iconText: '\\xc3\\xb0\\xc2\\x9f\\xc2\\x8d\\xc2\\xb4'",
     b"iconText: '\\xf0\\x9f\\x8d\\xb4'"),
    # delivering emoji
    (b"iconText: '\\xc3\\xb0\\xc2\\x9f\\xc2\\x9a\\xc2\\xb2'",
     b"iconText: '\\xf0\\x9f\\x9a\\xb2'"),
    # completed emoji
    (b"iconText: '\\xc3\\xa2\\xc2\\x9c\\xc2\\x85'",
     b"iconText: '\\xe2\\x9c\\x85'"),
    # statusIconText at line 39
    (b"statusIconText: '\\xc3\\xa2\\xc2\\x8f\\xc2\\xb3'",
     b"statusIconText: '\\xe2\\x8f\\xb3'"),
]

changed = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        changed += 1
        print('Fixed:', old[:40])
    else:
        print('Not found:', old[:40])

# Fix the duplicate statusIconText in setData
if b'statusIconText: statusConfig.iconText, statusIconText: statusConfig.iconText' in content:
    content = content.replace(
        b'statusIconText: statusConfig.iconText, statusIconText: statusConfig.iconText',
        b'statusIconText: statusConfig.iconText'
    )
    print('Fixed duplicate statusIconText')

with open(fp, 'wb') as f:
    f.write(content)

print('Done, changed:', changed)
