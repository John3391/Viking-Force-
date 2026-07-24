with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { VikingWeatherWidget } from "./components/VikingWeatherWidget";\n', '')
content = content.replace('                        <VikingWeatherWidget />\n', '')

with open('src/App.tsx', 'w') as f:
    f.write(content)
