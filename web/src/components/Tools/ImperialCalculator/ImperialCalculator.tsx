import { useEffect, useState } from 'react'

const parse = (meas) => {
  if (!/^\d+'?\d*$/.test(meas)) return NaN
  const [f = '0', i = '0'] = meas.endsWith("'")
    ? [meas.slice(0, -1), '0']
    : meas.split("'")
  return parseInt(f || '0') * 12 + parseInt(i || '0')
}

const toNotation = (inches) => {
  const f = Math.floor(inches / 12)
  const i = Math.round(inches % 12)
  return `${f}'${i}`
}

export default function ImperialCalculator() {
  const [m1, setM1] = useState("11'11")
  const [m2, setM2] = useState("3'6")
  const [op, setOp] = useState('subtract')
  const [output, setOutput] = useState('')

  const calculate = (val1 = m1, val2 = m2, operator = op) => {
    const a = parse(val1)
    const b = parse(val2)
    if (isNaN(a) || isNaN(b)) return setOutput('Check inputs')

    const result = operator === 'add' ? a + b : a - b
    setOutput(toNotation(result))
  }

  const handleInput = (setter, which) => (e) => {
    const val = e.target.value
    if (/^[0-9']*$/.test(val)) {
      setter(val)
      const updatedM1 = which === 'm1' ? val : m1
      const updatedM2 = which === 'm2' ? val : m2
      calculate(updatedM1, updatedM2, op)
    }
  }

  const handleOpChange = (e) => {
    const newOp = e.target.value
    setOp(newOp)
    calculate(m1, m2, newOp)
  }

  useEffect(() => {
    calculate(m1, m2, op)
  }, [])

  return (
    <div className="max-w-md space-y-4 rounded-xl border bg-white p-4 shadow">
      <div className="flex gap-2">
        <input
          value={m1}
          onChange={handleInput(setM1, 'm1')}
          placeholder="e.g. 12'6"
          className="w-1/2 rounded border px-3 py-2 text-2xl focus:outline-none focus:ring"
        />
        <input
          value={m2}
          onChange={handleInput(setM2, 'm2')}
          placeholder="e.g. 7'4"
          className="w-1/2 rounded border px-3 py-2 text-2xl focus:outline-none focus:ring"
        />
      </div>
      <select
        value={op}
        onChange={handleOpChange}
        className="w-full rounded border px-2 py-1 focus:outline-none focus:ring"
      >
        <option value="add">Add</option>
        <option value="subtract">Subtract</option>
      </select>
      <h3 className="text-xxl font-semibold text-gray-800">{output}</h3>
    </div>
  )
}
