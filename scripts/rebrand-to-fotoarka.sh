#!/bin/bash
# Replace fotoarka branding with fotoarka in all source files
# Run from project root: bash scripts/rebrand-to-fotoarka.sh

set -e

FILES=$(grep -rl "fotoarka\|Fotoarka\|fotoarka_krsk\|FOTOARKA" \
  --include="*.tsx" --include="*.ts" --include="*.json" \
  --include="*.prisma" --include="*.md" --include="*.sh" \
  --include="*.svg" --include="*.webmanifest" \
  . 2>/dev/null | grep -v node_modules | grep -v .next | grep -v agent-ctx | grep -v skills | grep -v .clawhub)

for FILE in $FILES; do
  echo "Updating: $FILE"
  sed -i \
    -e 's/fotoarka\.ru/fotoarka.ru/g' \
    -e 's/fotoarka_krsk/fotoarka_krsk/g' \
    -e 's/admin@fotoarka\.ru/admin@fotoarka.ru/g' \
    -e 's/order@fotoarka\.ru/order@fotoarka.ru/g' \
    -e 's/Fotoarka/Fotoarka/g' \
    -e 's/FOTOARKA/FOTOARKA/g' \
    -e 's/fotoarka/fotoarka/g' \
    "$FILE"
done

echo ""
echo "Done. Files updated:"
echo "$FILES" | wc -l
echo "files"
