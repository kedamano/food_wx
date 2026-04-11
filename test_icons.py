# -*- coding: utf-8 -*-
import re

# Test: check what icon patterns exist in each JS file
files = [
    r'D:\work\项目\food_wx\floor\pages\about\about.js',
    r'D:\work\项目\food_wx\floor\pages\topic\topic.js',
    r'D:\work\项目\food_wx\floor\pages\help\help.js',
    r'D:\work\项目\food_wx\floor\pages\feedback\feedback.js',
    r'D:\work\项目\food_wx\floor\pages\payment\payment.js',
    r'D:\work\项目\food_wx\floor\pages\payment-add\payment-add.js',
    r'D:\work\项目\food_wx\floor\pages\order-detail\order-detail.js',
]

for fp in files:
    try:
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
        # Find all icon-related patterns
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'icon' in line.lower() and 'fa-' in line:
                print(f'{fp} line {i+1}: {repr(line.strip())}')
    except Exception as e:
        print(f'ERROR {fp}: {e}')
