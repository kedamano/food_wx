import os, re

root = r'd:\work\项目\food_wx\floor'

results = {}
for dirpath, dirs, files in os.walk(root):
    dirs[:] = [d for d in dirs if d != 'node_modules']
    for fname in files:
        if not fname.endswith('.js'):
            continue
        fpath = os.path.join(dirpath, fname)
        rel = os.path.relpath(fpath, root)
        try:
            content = open(fpath, encoding='utf-8', errors='ignore').read()
        except:
            continue

        lines = content.split('\n')
        found = {}
        for lineno, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped.startswith('//') or stripped.startswith('*'):
                continue

            # const/let
            if re.search(r'(?<![a-zA-Z_$0-9])(const|let)\s+[a-zA-Z_${[]', line):
                if 'const_let' not in found: found['const_let'] = []
                found['const_let'].append((lineno, line.rstrip()[:100]))

            # arrow function
            if re.search(r'\)\s*=>\s*[{(a-zA-Z_$0-9!"\']', line):
                if 'arrow' not in found: found['arrow'] = []
                found['arrow'].append((lineno, line.rstrip()[:100]))

            # template string (backtick)
            if '`' in line:
                if 'template' not in found: found['template'] = []
                found['template'].append((lineno, line.rstrip()[:100]))

            # async/await
            if re.search(r'\b(async|await)\b', line):
                if 'async_await' not in found: found['async_await'] = []
                found['async_await'].append((lineno, line.rstrip()[:100]))

            # object/array spread
            if re.search(r'[{[,]\s*\.\.\.[a-zA-Z_$]', line):
                if 'spread' not in found: found['spread'] = []
                found['spread'].append((lineno, line.rstrip()[:100]))

            # shorthand method in Page/Component obj (2-space indent)
            m = re.match(r'^  ([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\(([^)]*)\)\s*{', line)
            if m:
                kw = {'if','for','while','switch','function','catch','try','else','return',
                      'setTimeout','setInterval','describe','it','test','require','define'}
                if m.group(1) not in kw:
                    if 'shorthand' not in found: found['shorthand'] = []
                    found['shorthand'].append((lineno, line.rstrip()[:100]))

            # class keyword
            if re.search(r'\bclass\s+[A-Z]', line):
                if 'class' not in found: found['class'] = []
                found['class'].append((lineno, line.rstrip()[:100]))

            # import/export
            if re.search(r'^(import|export)\s+', stripped):
                if 'import_export' not in found: found['import_export'] = []
                found['import_export'].append((lineno, line.rstrip()[:100]))

        if found:
            results[rel] = found

print(f'Files with ES6+ issues: {len(results)}')
print()
for f, hits in sorted(results.items()):
    print(f'=== {f} ===')
    for pname, locs in hits.items():
        print(f'  [{pname}] {len(locs)} occurrences')
        for lineno, line in locs[:5]:
            print(f'    L{lineno}: {line}')
    print()
