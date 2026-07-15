import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                    {historyTab === 'list' && activeStudentProfile.sessions.length === 0 ? (
                      <div className="text-center py-12 text-viking-silver">
                        <History className="w-12 h-12 text-viking-gold/30 mx-auto mb-3" />
                        <p className="font-bold">Nenhum treino realizado ainda.</p>
                        <p className="text-xs mt-1">Conclua sua primeira prova em "Treino Hoje" para iniciar seu histórico.</p>
                      </div>
                    ) : (
                      activeStudentProfile.sessions.map((sess, idx) => (`;

const replacement = `                    {historyTab === 'list' && (
                      activeStudentProfile.sessions.length === 0 ? (
                        <div className="text-center py-12 text-viking-silver">
                          <History className="w-12 h-12 text-viking-gold/30 mx-auto mb-3" />
                          <p className="font-bold">Nenhum treino realizado ainda.</p>
                          <p className="text-xs mt-1">Conclua sua primeira prova em "Treino Hoje" para iniciar seu histórico.</p>
                        </div>
                      ) : (
                        activeStudentProfile.sessions.map((sess, idx) => (`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("Fixed part 1");
} else {
    console.error("Part 1 not found!");
}
