# -*- coding: utf-8 -*-
fp = r'D:\work\项目\food_wx\floor\pages\order-detail\order-detail.js'

with open(fp, 'rb') as f:
    raw = f.read()

# Find pending config
idx = raw.find(b'pending: {')
if idx >= 0:
    chunk = raw[idx:idx+80]
    print('Hex dump of iconText area:')
    hex_str = chunk.hex()
    print('Hex:', hex_str)
    print()
    # Also decode as utf-8
    try:
        decoded = chunk.decode('utf-8')
        print('UTF-8 decoded:', repr(decoded))
    except Exception as e:
        print('UTF-8 decode error:', e)
