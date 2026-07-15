import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const [authLoading, setAuthLoading] = useState<boolean>(false);`;
const replacement = `  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [historyTab, setHistoryTab] = useState<'list' | 'comparison'>('list');`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("State added!");
} else {
    console.error("Target not found!");
}
