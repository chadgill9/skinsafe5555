/**
 * SkinSafe Compliance Copy Checker
 *
 * Scans src/ for banned phrases that could be interpreted as medical claims.
 * Run with: npm run check:copy
 *
 * Exit code 0: No banned phrases found
 * Exit code 1: Banned phrases found (blocks deployment)
 */

import * as fs from 'fs';
import * as path from 'path';

// Banned phrases - case insensitive matching
// These phrases could be interpreted as medical claims
const BANNED_PHRASES = [
  'safe',           // implies safety guarantees we can't make
  'unsafe',         // implies medical judgment
  'treat',          // implies treatment capability
  'cure',           // implies cure capability
  'diagnose',       // implies diagnostic capability
  'medical advice', // we don't provide this
  'prescription',   // implies medical authority
  'dermatologist approved', // implies professional endorsement
];

// Allowed exceptions - phrases that contain banned words but are acceptable
const ALLOWED_EXCEPTIONS = [
  'skinsafe',       // app name contains "safe"
  'for informational purposes',
  'not medical advice',
  'consult a healthcare professional',
  'may be a concern based on your',
  'react-native-safe-area',
  'safeareaview',
  'safeareacontext',
  'safe-area',
  // Test file assertions that check we DON'T use banned words
  'should not use',
  'includes(\'unsafe',
  'includes("unsafe',
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

interface Violation {
  file: string;
  line: number;
  phrase: string;
  content: string;
}

function isAllowedException(line: string): boolean {
  const lowerLine = line.toLowerCase();
  return ALLOWED_EXCEPTIONS.some(exception =>
    lowerLine.includes(exception.toLowerCase())
  );
}

function scanFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip if line contains an allowed exception
    if (isAllowedException(line)) {
      return;
    }

    const lowerLine = line.toLowerCase();

    for (const phrase of BANNED_PHRASES) {
      // Use word boundary matching to avoid false positives
      // e.g., "unsafeArea" shouldn't match "unsafe"
      const regex = new RegExp(`\\b${phrase}\\b`, 'i');
      if (regex.test(lowerLine)) {
        violations.push({
          file: filePath,
          line: index + 1,
          phrase,
          content: line.trim().substring(0, 100),
        });
      }
    }
  });

  return violations;
}

function walkDirectory(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDirectory(filePath, fileList);
      }
    } else if (SCAN_EXTENSIONS.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function main() {
  console.log('\nSkinSafe Compliance Copy Checker\n');
  console.log('═'.repeat(50));
  console.log('\nBanned phrases:', BANNED_PHRASES.join(', '));
  console.log('');

  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('Error: src/ directory not found');
    process.exit(1);
  }

  const files = walkDirectory(srcDir);
  console.log(`Scanning ${files.length} files in src/...\n`);

  let allViolations: Violation[] = [];

  for (const file of files) {
    const violations = scanFile(file);
    allViolations = allViolations.concat(violations);
  }

  if (allViolations.length === 0) {
    console.log('✓ No banned phrases found\n');
    console.log('Compliance check passed!\n');
    process.exit(0);
  } else {
    console.log(`✗ Found ${allViolations.length} violation(s):\n`);

    for (const v of allViolations) {
      const relativePath = path.relative(process.cwd(), v.file);
      console.log(`  ${relativePath}:${v.line}`);
      console.log(`    Banned phrase: "${v.phrase}"`);
      console.log(`    Content: ${v.content}`);
      console.log('');
    }

    console.log('═'.repeat(50));
    console.log('\nCompliance check FAILED\n');
    console.log('Fix the violations above before deploying.');
    console.log('If a phrase is intentionally used in a compliant way,');
    console.log('add it to ALLOWED_EXCEPTIONS in scripts/check_copy.ts\n');
    process.exit(1);
  }
}

main();
