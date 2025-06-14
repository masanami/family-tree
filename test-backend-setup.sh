#!/bin/bash

# Test script for Issue #26: バックエンド初期設定
# Red Phase - テストケース実装（失敗テスト作成）

echo "=== Issue #26: バックエンド初期設定テスト ==="
echo ""

# テスト結果カウンター
PASSED=0
FAILED=0

# テスト関数
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

test_json_field() {
    local file=$1
    local field=$2
    local test_name=$3
    
    if [ -f "$file" ] && node -e "const pkg=require('./$file'); if(!pkg.$field) process.exit(1);" 2>/dev/null; then
        echo "✅ PASS: $test_name"
        ((PASSED++))
    else
        echo "❌ FAIL: $test_name - JSONフィールドが存在しません: $field"
        ((FAILED++))
    fi
}

test_command_exists() {
    local command=$1
    local test_name=$2
    
    if [ -f "backend/package.json" ] && grep -q "\"$command\":" "backend/package.json"; then
        echo "✅ PASS: $test_name"
        ((PASSED++))
    else
        echo "❌ FAIL: $test_name - スクリプトが定義されていません: $command"
        ((FAILED++))
    fi
}

# テスト実行
echo "1. package.jsonのテスト"
test_file_exists "backend/package.json" "backend/package.jsonが存在する"
test_json_field "backend/package.json" "name" "package.jsonにnameフィールドが存在する"
test_json_field "backend/package.json" "version" "package.jsonにversionフィールドが存在する"
test_json_field "backend/package.json" "scripts" "package.jsonにscriptsフィールドが存在する"

echo ""
echo "2. TypeScript設定のテスト"
test_file_exists "backend/tsconfig.json" "backend/tsconfig.jsonが存在する"
test_file_contains "backend/tsconfig.json" "compilerOptions" "tsconfig.jsonにcompilerOptionsが含まれている"
test_file_contains "backend/tsconfig.json" "target" "tsconfig.jsonにtargetが設定されている"
test_file_contains "backend/tsconfig.json" "module" "tsconfig.jsonにmoduleが設定されている"
test_file_contains "backend/tsconfig.json" "outDir" "tsconfig.jsonにoutDirが設定されている"

echo ""
echo "3. Express基本設定のテスト"
test_file_exists "backend/src/app.ts" "backend/src/app.tsが存在する"
test_file_contains "backend/src/app.ts" "express" "app.tsにexpressのインポートが含まれている"
test_file_contains "backend/src/app.ts" "app.listen" "app.tsにサーバー起動処理が含まれている"

echo ""
echo "4. 開発用スクリプトのテスト"
if [ -f "backend/package.json" ]; then
    test_command_exists "dev" "devスクリプトが定義されている"
    test_command_exists "build" "buildスクリプトが定義されている"
    test_command_exists "start" "startスクリプトが定義されている"
fi

echo ""
echo "=== テスト結果 ==="
echo "PASSED: $PASSED"
echo "FAILED: $FAILED"

# 失敗があった場合は終了コード1を返す
if [ $FAILED -gt 0 ]; then
    exit 1
fi

exit 0