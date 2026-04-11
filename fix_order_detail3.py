# -*- coding: utf-8 -*-
fp = r'D:\work\项目\food_wx\floor\pages\order-detail\order-detail.js'
with open(fp, 'r', encoding='utf-8') as f:
    content = f.read()

# The file has literal \xXX sequences as text (not actual bytes)
# Replace them with actual Unicode characters
import re

def fix_escapes(text):
    def replacer(m):
        seq = m.group(1)
        try:
            # Convert hex string to int and then to chr
            return chr(int(seq, 16))
        except:
            return m.group(0)
    return re.sub(r'\\x([0-9a-fA-F]{2})', replacer, text)

content = fix_escapes(content)

with open(fp, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed!')

# Verify
with open(fp, 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'iconText' in line or 'statusIconText' in line:
        print(i+1, repr(line.strip()[:100]))
