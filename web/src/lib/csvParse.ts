// Simple RFC4180-compatible CSV parser that handles quoted fields and newlines inside quotes
export const parseCSV = (text: string): string[][] => {
  const rows: string[][] = []
  let i = 0
  const len = text.length
  let curField = ''
  let curRow: string[] = []
  let inQuotes = false

  while (i < len) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        // lookahead for escaped quote
        if (i + 1 < len && text[i + 1] === '"') {
          curField += '"'
          i += 2
          continue
        }
        // end of quoted field
        inQuotes = false
        i++
        continue
      }
      // regular char inside quotes (including newlines)
      curField += char
      i++
      continue
    }

    // Not in quotes
    if (char === '"') {
      inQuotes = true
      i++
      continue
    }

    if (char === ',') {
      curRow.push(curField)
      curField = ''
      i++
      continue
    }

    if (char === '\r') {
      // skip CR, handle LF after
      i++
      if (i < len && text[i] === '\n') i++
      curRow.push(curField)
      rows.push(curRow)
      curRow = []
      curField = ''
      continue
    }

    if (char === '\n') {
      i++
      curRow.push(curField)
      rows.push(curRow)
      curRow = []
      curField = ''
      continue
    }

    curField += char
    i++
  }

  // push remaining
  // If we're still in quotes, tolerate by closing field
  curRow.push(curField)
  if (curRow.length > 1 || curRow[0] !== '' || rows.length === 0) {
    rows.push(curRow)
  }

  return rows
}

export default parseCSV
