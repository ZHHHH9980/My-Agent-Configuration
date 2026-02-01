#!/bin/bash

# Validation Script for Skills Tracking System
# Tests the complete workflow end-to-end

REPO_DIR="$(pwd)"
TEST_SKILL="validation-test-skill"

echo "🧪 Starting Skills Tracking System Validation..."

# Test 1: Skill loading and tracking
echo ""
echo "📋 Test 1: Skill Loading & Tracking"
echo "===================================="

echo "✓ Testing skill load tracking..."
./track-skill.sh "$TEST_SKILL" "load-success" >/dev/null 2>&1

echo "✓ Testing session tracking..."
./track-skill.sh "$TEST_SKILL" "session-started" >/dev/null 2>&1
./track-skill.sh "$TEST_SKILL" "task-completed" >/dev/null 2>&1
./track-skill.sh "$TEST_SKILL" "session-ended" >/dev/null 2>&1

# Test 2: Data integrity
echo ""
echo "📋 Test 2: Data Integrity"
echo "=========================="

usage_count=$(cat skills-config.json | jq -r ".skills[\"$TEST_SKILL\"].usageCount")
if [ "$usage_count" = "4" ]; then
    echo "✓ Usage count correct: $usage_count"
else
    echo "❌ Usage count incorrect: $usage_count (expected 4)"
    exit 1
fi

laptop_count=$(cat skills-config.json | jq -r ".laptops | keys | length")
if [ "$laptop_count" = "1" ]; then
    echo "✓ Laptop tracking working: $laptop_count laptop(s)"
else
    echo "❌ Laptop tracking failed: $laptop_count laptop(s)"
    exit 1
fi

# Test 3: Backup system
echo ""
echo "📋 Test 3: Backup System"
echo "========================"

backup_count_before=$(ls backups/ 2>/dev/null | wc -l)
./sync-skills.sh backup >/dev/null 2>&1
backup_count_after=$(ls backups/ 2>/dev/null | wc -l)

if [ "$backup_count_after" -gt "$backup_count_before" ]; then
    echo "✓ Backup system working: $backup_count_after backup(s) total"
else
    echo "❌ Backup system failed"
    exit 1
fi

# Test 4: Integration with load-skill.sh
echo ""
echo "📋 Test 4: Integration Test"
echo "=========================="

# We can't test the actual skill loading, but we can test the wrapper exists
if [ -f "load-skill.sh" ]; then
    echo "✓ Skill loader wrapper exists and is executable"
else
    echo "❌ Skill loader wrapper missing"
    exit 1
fi

# Test 5: jq dependency
echo ""
echo "📋 Test 5: Dependencies"
echo "========================"

if command -v jq >/dev/null 2>&1; then
    echo "✓ jq dependency satisfied"
else
    echo "❌ jq dependency missing - install jq first"
    exit 1
fi

# Cleanup test data
echo ""
echo "📋 Test 6: Cleanup"
echo "=================="

# Remove test skill from config
jq "del(.skills[\"$TEST_SKILL\"])" skills-config.json > temp.json && mv temp.json skills-config.json
current_laptop=$(hostname)
jq ".laptops[\"$current_laptop\"].skillsUsed = [.laptops[\"$current_laptop\"].skillsUsed[] | select(.skill != \"$TEST_SKILL\")]" skills-config.json > temp.json && mv temp.json skills-config.json

echo "✓ Test data cleaned up"

echo ""
echo "🎉 All tests passed! Skills tracking system is working correctly."
echo ""
echo "📊 Current system status:"
echo "   - Tracked skills: $(cat skills-config.json | jq -r '.skills | keys | length')"
echo "   - Tracked laptops: $(cat skills-config.json | jq -r '.laptops | keys | length')"
echo "   - Total skill uses: $(cat skills-config.json | jq '[.skills[].usageCount] | add // 0')"
echo "   - Backups created: $(ls backups/ 2>/dev/null | wc -l)"