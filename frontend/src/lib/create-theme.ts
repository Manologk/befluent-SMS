export function createTheme(name: string, colors: Record<string, string>) {
    return `/* Theme: ${name} */\n` + Object.entries(colors).map(([key, value]) => {
      return `--${name}-${key}: ${value};`
    }).join('\n')
  }