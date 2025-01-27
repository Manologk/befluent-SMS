export function createTheme(colors: Record<string, string>) {
    return Object.entries(colors).map(([key, value]) => {
      return `--${key}: ${value};`
    }).join('\n')
  }