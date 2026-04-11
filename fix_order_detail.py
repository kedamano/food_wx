# -*- coding: utf-8 -*-
fp = r'D:\work\项目\food_wx\floor\pages\order-detail\order-detail.js'
import re

with open(fp, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the iconText in getStatusConfig
text = re.sub(r"iconText:\s*'[^']*hourglass[^']*'", "iconText: '\xe2\x8f\xb3'", text)
text = re.sub(r"iconText:\s*'[^']*utensils[^']*'", "iconText: '\xf0\x9f\x8d\xb4'", text)
text = re.sub(r"iconText:\s*'[^']*bicycle[^']*'", "iconText: '\xf0\x9f\x9a\xb2'", text)
text = re.sub(r"iconText:\s*'[^']*check-circle[^']*'", "iconText: '\xe2\x9c\x85'", text)

# Fix the statusIconText at line 39
text = re.sub(r"statusIconText:\s*'[^']*'", "statusIconText: '\xe2\x8f\xb3'", text)

# Fix the setData that sets statusIcon - also add statusIconText
old_setdata = "statusIcon: statusConfig.icon,"
new_setdata = "statusIcon: statusConfig.icon, statusIconText: statusConfig.iconText,"
text = text.replace(old_setdata, new_setdata)

with open(fp, 'w', encoding='utf-8') as f:
    f.write(text)

print('Fixed order-detail.js')

# Verify
with open(fp, 'r', encoding='utf-8') as f:
    content = f.read()
for line in content.split('\n'):
    if 'iconText' in line or 'statusIconText' in line:
        print('  Found:', repr(line.strip()))
