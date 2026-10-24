# -*- coding: utf-8 -*-
"""wxml 标签配对检查器：栈式校验所有 wxml 的开/闭标签是否匹配。
自闭合（<tag ... />）与 wxml 不需要闭合的标签会跳过。"""
import io
import os
import re
import sys

VOID_OK = {'input', 'image', 'import', 'include', 'icon', 'switch', 'slider', 'progress', 'checkbox', 'radio'}
TAG_RE = re.compile(r'<(/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|\'[^\']*\'|[^>"\'])*?)(/?)>')

bad = []
checked = 0
for root, dirs, files in os.walk('pages'):
    for f in files:
        if not f.endswith('.wxml'):
            continue
        p = os.path.join(root, f)
        s = io.open(p, encoding='utf-8').read()
        # 去掉注释，防止注释里的残缺标签干扰
        s = re.sub(r'<!--[\s\S]*?-->', '', s)
        stack = []
        errors = []
        for m in TAG_RE.finditer(s):
            closing, name, attrs, selfclose = m.groups()
            name = name.lower()
            if name == 'wxs' and not closing:
                # <wxs src=... /> 通常自闭合，按属性判断
                if selfclose:
                    continue
            if selfclose:
                continue
            if closing:
                if name in VOID_OK:
                    continue  # image 等空元素允许显式闭合
                if not stack:
                    errors.append('多余的 </%s>' % name)
                elif stack[-1][0] != name:
                    errors.append('期望 </%s> 实际 </%s>' % (stack[-1][0], name))
                    # 弹到匹配处（容错继续检查后续）
                    found = False
                    for k in range(len(stack) - 1, -1, -1):
                        if stack[k][0] == name:
                            del stack[k:]
                            found = True
                            break
                    if not found:
                        stack = stack
                else:
                    stack.pop()
            else:
                if name in VOID_OK:
                    continue
                stack.append((name, s[:m.start()].count('\n') + 1))
        for name, line in stack:
            errors.append('未闭合 <%s> (约第 %d 行)' % (name, line))
        checked += 1
        if errors:
            bad.append((p, errors))

for p, errs in bad:
    print('BROKEN:', p)
    for e in errs[:4]:
        print('   ', e)
print('checked %d wxml files, broken: %d' % (checked, len(bad)))
sys.exit(1 if bad else 0)
