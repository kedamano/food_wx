#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美食微信小程序全面测试脚本
测试范围：所有页面功能、API接口、资源加载
"""

import os
import re
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum

class TestStatus(Enum):
    PASS = "通过"
    FAIL = "失败"
    WARNING = "警告"
    INFO = "信息"

@dataclass
class TestResult:
    category: str
    name: str
    status: TestStatus
    message: str
    details: List[str] = field(default_factory=list)

class WeappTester:
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.floor_path = self.project_path / "floor"
        self.backend_path = self.project_path / "backend"
        self.results: List[TestResult] = []
        self.errors: List[str] = []
        self.warnings: List[str] = []
        
    def run_all_tests(self):
        """运行所有测试"""
        print("=" * 80)
        print("美食微信小程序 - 全面功能测试")
        print("=" * 80)
        print()
        
        # 1. 项目结构测试
        self.test_project_structure()
        
        # 2. 页面配置测试
        self.test_pages_config()
        
        # 3. API接口测试
        self.test_api_integration()
        
        # 4. 图片资源测试
        self.test_image_resources()
        
        # 5. 代码规范测试
        self.test_code_standards()
        
        # 6. 功能逻辑测试
        self.test_functional_logic()
        
        # 7. 后端接口测试
        self.test_backend_apis()
        
        # 生成报告
        self.generate_report()
        
    def test_project_structure(self):
        """测试项目结构完整性"""
        print("【测试】项目结构完整性...")
        
        required_dirs = [
            "floor/pages",
            "floor/api",
            "floor/images",
            "floor/utils",
            "backend/src/main/java/com/food",
            "backend/src/main/resources",
        ]
        
        required_files = [
            "floor/app.js",
            "floor/app.json",
            "floor/app.wxss",
            "floor/project.config.json",
        ]
        
        missing_dirs = []
        missing_files = []
        
        for d in required_dirs:
            if not (self.project_path / d).exists():
                missing_dirs.append(d)
                
        for f in required_files:
            if not (self.project_path / f).exists():
                missing_files.append(f)
        
        if missing_dirs or missing_files:
            self.results.append(TestResult(
                category="项目结构",
                name="目录和文件完整性",
                status=TestStatus.FAIL if (missing_dirs or missing_files) else TestStatus.PASS,
                message=f"缺少 {len(missing_dirs)} 个目录, {len(missing_files)} 个文件",
                details=missing_dirs + missing_files
            ))
        else:
            self.results.append(TestResult(
                category="项目结构",
                name="目录和文件完整性",
                status=TestStatus.PASS,
                message="所有必需目录和文件都存在"
            ))
        
        # 统计文件数量
        pages_count = len(list((self.floor_path / "pages").rglob("*.js"))) if (self.floor_path / "pages").exists() else 0
        self.results.append(TestResult(
            category="项目结构",
            name="页面数量统计",
            status=TestStatus.INFO,
            message=f"共发现 {pages_count} 个页面"
        ))
        
    def test_pages_config(self):
        """测试页面配置"""
        print("【测试】页面配置检查...")
        
        app_json_path = self.floor_path / "app.json"
        if not app_json_path.exists():
            self.results.append(TestResult(
                category="页面配置",
                name="app.json",
                status=TestStatus.FAIL,
                message="app.json 不存在"
            ))
            return
            
        with open(app_json_path, 'r', encoding='utf-8') as f:
            app_config = json.load(f)
        
        pages = app_config.get('pages', [])
        tabbar = app_config.get('tabBar', {})
        
        # 检查页面文件是否存在
        missing_pages = []
        for page in pages:
            page_path = self.floor_path / f"{page}.js"
            wxml_path = self.floor_path / f"{page}.wxml"
            if not page_path.exists() or not wxml_path.exists():
                missing_pages.append(page)
        
        if missing_pages:
            self.results.append(TestResult(
                category="页面配置",
                name="页面文件存在性",
                status=TestStatus.FAIL,
                message=f"{len(missing_pages)} 个页面文件缺失",
                details=missing_pages
            ))
        else:
            self.results.append(TestResult(
                category="页面配置",
                name="页面文件存在性",
                status=TestStatus.PASS,
                message=f"所有 {len(pages)} 个页面文件都存在"
            ))
        
        # 检查tabBar配置
        tabbar_items = tabbar.get('list', [])
        self.results.append(TestResult(
            category="页面配置",
            name="TabBar配置",
            status=TestStatus.INFO,
            message=f"TabBar包含 {len(tabbar_items)} 个选项"
        ))
        
        # 检查tabBar图标
        missing_icons = []
        for item in tabbar_items:
            icon_path = self.floor_path / item.get('iconPath', '')
            selected_icon_path = self.floor_path / item.get('selectedIconPath', '')
            if not icon_path.exists():
                missing_icons.append(item.get('iconPath'))
            if not selected_icon_path.exists():
                missing_icons.append(item.get('selectedIconPath'))
        
        if missing_icons:
            self.results.append(TestResult(
                category="页面配置",
                name="TabBar图标",
                status=TestStatus.WARNING,
                message=f"{len(missing_icons)} 个TabBar图标缺失",
                details=missing_icons
            ))
        else:
            self.results.append(TestResult(
                category="页面配置",
                name="TabBar图标",
                status=TestStatus.PASS,
                message="所有TabBar图标都存在"
            ))
    
    def test_api_integration(self):
        """测试API接口集成"""
        print("【测试】API接口集成检查...")
        
        api_dir = self.floor_path / "api"
        if not api_dir.exists():
            self.results.append(TestResult(
                category="API集成",
                name="API目录",
                status=TestStatus.FAIL,
                message="API目录不存在"
            ))
            return
        
        api_files = list(api_dir.glob("*.js"))
        self.results.append(TestResult(
            category="API集成",
            name="API文件数量",
            status=TestStatus.INFO,
            message=f"发现 {len(api_files)} 个API文件"
        ))
        
        # 检查config.js
        config_path = api_dir / "config.js"
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                config_content = f.read()
            
            # 检查baseURL配置
            if 'localhost:8080' in config_content or '127.0.0.1:8080' in config_content:
                self.results.append(TestResult(
                    category="API集成",
                    name="后端地址配置",
                    status=TestStatus.PASS,
                    message="后端API地址配置正确 (localhost:8080)"
                ))
            else:
                self.results.append(TestResult(
                    category="API集成",
                    name="后端地址配置",
                    status=TestStatus.WARNING,
                    message="未找到localhost:8080配置，请检查API地址"
                ))
        
        # 检查request.js
        request_path = api_dir / "request.js"
        if request_path.exists():
            with open(request_path, 'r', encoding='utf-8') as f:
                request_content = f.read()
            
            # 检查拦截器
            if 'interceptors' in request_content or 'success' in request_content:
                self.results.append(TestResult(
                    category="API集成",
                    name="请求拦截器",
                    status=TestStatus.PASS,
                    message="请求拦截器已配置"
                ))
    
    def test_image_resources(self):
        """测试图片资源"""
        print("【测试】图片资源检查...")
        
        images_dir = self.floor_path / "images"
        if not images_dir.exists():
            self.results.append(TestResult(
                category="图片资源",
                name="图片目录",
                status=TestStatus.FAIL,
                message="images目录不存在"
            ))
            return
        
        # 统计图片
        all_images = list(images_dir.rglob("*.png")) + list(images_dir.rglob("*.jpg")) + list(images_dir.rglob("*.jpeg"))
        
        self.results.append(TestResult(
            category="图片资源",
            name="图片总数",
            status=TestStatus.INFO,
            message=f"共发现 {len(all_images)} 张图片"
        ))
        
        # 检查关键目录
        required_image_dirs = ['foods', 'stores', 'avatars', 'tabbar']
        for dir_name in required_image_dirs:
            dir_path = images_dir / dir_name
            if dir_path.exists():
                count = len(list(dir_path.glob("*.png")))
                self.results.append(TestResult(
                    category="图片资源",
                    name=f"{dir_name}图片",
                    status=TestStatus.INFO,
                    message=f"{dir_name}目录有 {count} 张图片"
                ))
    
    def test_code_standards(self):
        """测试代码规范"""
        print("【测试】代码规范检查...")
        
        js_files = list(self.floor_path.rglob("*.js"))
        
        es6_issues = []
        syntax_issues = []
        
        for js_file in js_files:
            try:
                with open(js_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 检查ES6语法（微信小程序需要ES5）
                if 'const ' in content or 'let ' in content:
                    es6_issues.append(f"{js_file.name}: 使用const/let")
                if '=>' in content:
                    es6_issues.append(f"{js_file.name}: 使用箭头函数")
                if '`' in content:
                    es6_issues.append(f"{js_file.name}: 使用模板字符串")
                if '...' in content:
                    es6_issues.append(f"{js_file.name}: 使用展开运算符")
                    
            except Exception as e:
                syntax_issues.append(f"{js_file.name}: {str(e)}")
        
        if es6_issues:
            self.results.append(TestResult(
                category="代码规范",
                name="ES6语法检查",
                status=TestStatus.WARNING,
                message=f"发现 {len(es6_issues)} 处ES6语法（微信小程序建议使用ES5）",
                details=es6_issues[:10]  # 只显示前10个
            ))
        else:
            self.results.append(TestResult(
                category="代码规范",
                name="ES6语法检查",
                status=TestStatus.PASS,
                message="未发现ES6语法问题"
            ))
        
        # 检查WXML中的HTML实体
        wxml_files = list(self.floor_path.rglob("*.wxml"))
        html_entity_issues = []
        
        for wxml_file in wxml_files:
            with open(wxml_file, 'r', encoding='utf-8') as f:
                content = f.read()
            if '&#' in content or '&amp;' in content or '&lt;' in content or '&gt;' in content:
                html_entity_issues.append(wxml_file.name)
        
        if html_entity_issues:
            self.results.append(TestResult(
                category="代码规范",
                name="WXML HTML实体",
                status=TestStatus.WARNING,
                message=f"{len(html_entity_issues)} 个文件使用HTML实体编码（小程序不支持）",
                details=html_entity_issues[:10]
            ))
    
    def test_functional_logic(self):
        """测试功能逻辑"""
        print("【测试】功能逻辑检查...")
        
        # 检查app.js中的关键功能
        app_js_path = self.floor_path / "app.js"
        if app_js_path.exists():
            with open(app_js_path, 'r', encoding='utf-8') as f:
                app_content = f.read()
            
            # 检查关键功能
            features = {
                "用户登录": "userLogin" in app_content,
                "购物车管理": "addToCart" in app_content,
                "全局请求": "authRequest" in app_content or "createAuthRequest" in app_content,
                "图片URL解析": "resolveImageUrl" in app_content,
                "错误处理": "globalErrorHandle" in app_content,
            }
            
            for feature, exists in features.items():
                self.results.append(TestResult(
                    category="功能逻辑",
                    name=feature,
                    status=TestStatus.PASS if exists else TestStatus.FAIL,
                    message=f"{'已实现' if exists else '未实现'}"
                ))
    
    def test_backend_apis(self):
        """测试后端API"""
        print("【测试】后端API检查...")
        
        controller_dir = self.backend_path / "src/main/java/com/food/controller"
        if not controller_dir.exists():
            self.results.append(TestResult(
                category="后端API",
                name="Controller目录",
                status=TestStatus.FAIL,
                message="Controller目录不存在"
            ))
            return
        
        controllers = list(controller_dir.glob("*Controller.java"))
        self.results.append(TestResult(
            category="后端API",
            name="Controller数量",
            status=TestStatus.INFO,
            message=f"发现 {len(controllers)} 个Controller"
        ))
        
        # 检查关键Controller
        required_controllers = [
            "UserController",
            "FoodController", 
            "StoreController",
            "OrderController",
            "CartController",
            "ReviewController"
        ]
        
        for controller_name in required_controllers:
            controller_file = controller_dir / f"{controller_name}.java"
            exists = controller_file.exists()
            self.results.append(TestResult(
                category="后端API",
                name=controller_name,
                status=TestStatus.PASS if exists else TestStatus.WARNING,
                message=f"{'存在' if exists else '不存在'}"
            ))
    
    def generate_report(self):
        """生成测试报告"""
        print()
        print("=" * 80)
        print("测试报告")
        print("=" * 80)
        print()
        
        # 按类别分组
        categories = {}
        for result in self.results:
            if result.category not in categories:
                categories[result.category] = []
            categories[result.category].append(result)
        
        # 统计
        pass_count = sum(1 for r in self.results if r.status == TestStatus.PASS)
        fail_count = sum(1 for r in self.results if r.status == TestStatus.FAIL)
        warning_count = sum(1 for r in self.results if r.status == TestStatus.WARNING)
        info_count = sum(1 for r in self.results if r.status == TestStatus.INFO)
        
        # 按类别输出
        for category, results in categories.items():
            print(f"\n【{category}】")
            print("-" * 60)
            for r in results:
                status_icon = {
                    TestStatus.PASS: "[PASS]",
                    TestStatus.FAIL: "[FAIL]",
                    TestStatus.WARNING: "[WARN]",
                    TestStatus.INFO: "[INFO]"
                }.get(r.status, "[?]")
                print(f"  {status_icon} {r.name}: {r.message}")
                if r.details:
                    for detail in r.details[:5]:  # 最多显示5个详情
                        print(f"      - {detail}")
        
        print()
        print("=" * 80)
        print("测试统计")
        print("=" * 80)
        print(f"  [PASS] 通过: {pass_count}")
        print(f"  [FAIL] 失败: {fail_count}")
        print(f"  [WARN] 警告: {warning_count}")
        print(f"  [INFO] 信息: {info_count}")
        print(f"  总计: {len(self.results)}")
        print()
        
        # 保存报告
        report_path = self.project_path / "test_report.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("# 美食微信小程序 - 全面测试报告\n\n")
            f.write(f"测试时间: {os.popen('date').read().strip() if os.name != 'nt' else 'N/A'}\n\n")
            
            f.write("## 测试统计\n\n")
            f.write(f"- [PASS] 通过: {pass_count}\n")
            f.write(f"- [FAIL] 失败: {fail_count}\n")
            f.write(f"- [WARN] 警告: {warning_count}\n")
            f.write(f"- [INFO] 信息: {info_count}\n")
            f.write(f"- **总计: {len(self.results)}**\n\n")
            
            f.write("## 详细结果\n\n")
            for category, results in categories.items():
                f.write(f"### {category}\n\n")
                for r in results:
                    status_str = r.status.value
                    f.write(f"- **{r.name}** ({status_str}): {r.message}\n")
                    if r.details:
                        for detail in r.details[:5]:
                            f.write(f"  - {detail}\n")
                f.write("\n")
        
        print(f"报告已保存至: {report_path}")
        
        # 返回总体状态
        if fail_count > 0:
            print(f"\n[FAIL] 测试未通过，发现 {fail_count} 个失败项")
            return False
        elif warning_count > 0:
            print(f"\n[WARN] 测试通过，但有 {warning_count} 个警告项需要关注")
            return True
        else:
            print("\n[PASS] 所有测试通过！")
            return True


if __name__ == "__main__":
    project_path = r"d:\work\项目\food_wx"
    tester = WeappTester(project_path)
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
