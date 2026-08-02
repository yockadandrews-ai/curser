import fs from 'fs';
import path from 'path';
import { OUTPUT_ROOT } from './generator.js';
import { THEME_CLUSTERS, FACTORY_THEMES } from './themes.js';
import { generateLongFormSingleProposal, generateLongFormSuiteProposal } from './longFormProposals.js';

const GLASS = 'Liquid Glass UI — frosted panels, smooth micro-interactions, mobile-first';

export function expandProposalsInFolder(folderName = '2026-07-31_Five_Themes'): {
  folder: string;
  expandedSingles: number;
  expandedSuites: number;
  paths: string[];
} {
  const basePath = path.join(OUTPUT_ROOT, folderName);
  const paths: string[] = [];
  let expandedSingles = 0;
  let expandedSuites = 0;

  for (const theme of FACTORY_THEMES) {
    const cluster = THEME_CLUSTERS[theme];
    const themePath = path.join(basePath, cluster.folderSlug);
    if (!fs.existsSync(themePath)) continue;

    const fullDir = path.join(themePath, 'Proposals_Full');
    fs.mkdirSync(fullDir, { recursive: true });

    for (const app of cluster.apps) {
      const appDef = { ...app, liquidGlassNote: GLASS };
      const md = generateLongFormSingleProposal(appDef, theme, cluster);
      const filename = `Full_${app.appName.replace(/[\s-]+/g, '')}.md`;
      const filePath = path.join(fullDir, filename);
      fs.writeFileSync(filePath, md);
      paths.push(filePath);
      expandedSingles++;
    }

    const apps = cluster.apps.map(a => ({ ...a, liquidGlassNote: GLASS }));
    const suiteMd = generateLongFormSuiteProposal(apps, theme, cluster);
    const suitePath = path.join(themePath, 'Suite_Proposal_Full.md');
    fs.writeFileSync(suitePath, suiteMd);
    paths.push(suitePath);
    expandedSuites++;
  }

  const indexPath = path.join(basePath, 'PROPOSALS_FULL_INDEX.md');
  fs.writeFileSync(indexPath, `# Long-Form Proposals Index

**Generated:** ${new Date().toISOString().split('T')[0]}
**Singles expanded:** ${expandedSingles}
**Suites expanded:** ${expandedSuites}

## Location
Each theme folder contains:
- \`Proposals_Full/Full_[AppName].md\` — long-form single-app proposal
- \`Suite_Proposal_Full.md\` — long-form suite proposal

## Themes
${FACTORY_THEMES.map(t => `- **${t}** → \`${THEME_CLUSTERS[t].folderSlug}/\``).join('\n')}

Use these for email outreach, LinkedIn DMs, and sales calls.
`);
  paths.push(indexPath);

  return { folder: folderName, expandedSingles, expandedSuites, paths };
}

export function expandThreeThemeFolder(): ReturnType<typeof expandProposalsInFolder> {
  return expandProposalsInFolder('2026-07-31_Three_Themes');
}

export function expandFiveThemeFolder(): ReturnType<typeof expandProposalsInFolder> {
  return expandProposalsInFolder('2026-07-31_Five_Themes');
}

export function expandAllOutputFolders(): ReturnType<typeof expandProposalsInFolder>[] {
  const results: ReturnType<typeof expandProposalsInFolder>[] = [];
  if (fs.existsSync(path.join(OUTPUT_ROOT, '2026-07-31_Three_Themes'))) {
    results.push(expandThreeThemeFolder());
  }
  if (fs.existsSync(path.join(OUTPUT_ROOT, '2026-07-31_Five_Themes'))) {
    results.push(expandFiveThemeFolder());
  }
  return results;
}
