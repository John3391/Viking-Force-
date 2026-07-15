import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                          {sess.note && (
                            <div className="mt-3 p-2 rounded bg-black/40 border-l-2 border-viking-gold text-xs text-viking-silver italic">
                              "{sess.note}"
                            </div>
                          )}
                        </div>
                      ))
                    )}`;

const replacement = `                          {sess.note && (
                            <div className="mt-3 p-2 rounded bg-black/40 border-l-2 border-viking-gold text-xs text-viking-silver italic">
                              "{sess.note}"
                            </div>
                          )}
                        </div>
                      ))
                    )
                  )}`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("Fixed part 2");
} else {
    console.error("Part 2 not found!");
}
