import os, re

wxml_dir = r'd:\work\项目\food_wx\floor'
fa_pattern = re.compile(r'class="[^"]*\bfa\b[^"]*"')

results = []
for root, dirs, files in os.walk(wxml_dir):
    for f in files:
        if f.endswith('.wxml'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
            matches = fa_pattern.findall(content)
            if matches:
                rel = os.path.relpath(path, wxml_dir)
                results.append((rel, len(matches), matches[:3]))

print('含 FontAwesome class 的 WXML 文件：')
for rel, cnt, samples in results:
    print('  [%d处] %s' % (cnt, rel))
    for s in samples:
        print('    ' + s)
print('\n共 %d 个文件' % len(results))
