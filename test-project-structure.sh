#!/bin/bash

# Test script for Issue #25: プロジェクト基本構造
# Red Phase - テストケース実装（失敗テスト作成）

echo "=== Issue #25: プロジェクト基本構造テスト ==="
echo ""

# テスト結果カウンター
PASSED=0
FAILED=0

# テスト関数
test_directory_exists() {
    local dir=$1
    local test_name=$2
    
    if [ -d "$dir" ]; then
        echo "✅ PASS: $test_name"
        ((PASSED++))
    else
        echo "❌ FAIL: $test_name - ディレクトリが存在しません: $dir"
        ((FAILED++))
    fi
}

test_file_exists() {
    local file=$1
    local test_name=$2
    
    if [ -f "$file" ]; then
        echo "✅ PASS: $test_name"
        ((PASSED++))
    else
        echo "❌ FAIL: $test_name - ファイルが存在しません: $file"
        ((FAILED++))
    fi
}

test_file_contains() {
    local file=$1
    local pattern=$2
    local test_name=$3
    
    if [ -f "$file" ] && grep -q "$pattern" "$file"; then
        echo "✅ PASS: $test_name"
        ((PASSED++))
    else
        echo "❌ FAIL: $test_name - ファイルに必要な内容が含まれていません"
        ((FAILED++))
    fi
}

# テスト実行
echo "1. ディレクトリ構造のテスト"
test_directory_exists "frontend" "frontendディレクトリが存在する"
test_directory_exists "backend" "backendディレクトリが存在する"

echo ""
echo "2. 共通設定ファイルのテスト"
test_file_exists ".gitignore" ".gitignoreファイルが存在する"
test_file_exists ".editorconfig" ".editorconfigファイルが存在する"

echo ""
echo "3. .gitignoreの内容テスト"
test_file_contains ".gitignore" "node_modules" ".gitignoreにnode_modulesが含まれている"
test_file_contains ".gitignore" "dist" ".gitignoreにdistが含まれている"
test_file_contains ".gitignore" ".env" ".gitignoreに.envが含まれている"

echo ""
echo "4. .editorconfigの内容テスト"
test_file_contains ".editorconfig" "indent_style" ".editorconfigにindent_styleが設定されている"
test_file_contains ".editorconfig" "charset" ".editorconfigにcharsetが設定されている"

echo ""
echo "5. README.mdのテスト"
test_file_exists "README.md" "README.mdファイルが存在する"
test_file_contains "README.md" "# 家系図アプリケーション" "README.mdにプロジェクトタイトルが含まれている"

echo ""
echo "=== テスト結果 ==="
echo "PASSED: $PASSED"
echo "FAILED: $FAILED"

# 失敗があった場合は終了コード1を返す
if [ $FAILED -gt 0 ]; then
    exit 1
fi

exit 0