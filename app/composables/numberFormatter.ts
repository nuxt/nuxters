const { format } = Intl.NumberFormat('en-GB', {})

export function useNumberFormatter() {
  return format
}
