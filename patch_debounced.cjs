const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const debouncedComponents = `
function DebouncedInput({ value, onChange, ...props }: any) {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onChange(localValue);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

function DebouncedTextarea({ value, onChange, ...props }: any) {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <textarea
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={(e) => onChange(e.target.value)}
    />
  );
}
`;

// Insert after imports
code = code.replace(
  /(import \{ DEFAULT_PROGRAM, DEFAULT_STUDENTS \} from '\.\/data';)/,
  `$1\n\n${debouncedComponents}`
);

fs.writeFileSync('src/App.tsx', code);
