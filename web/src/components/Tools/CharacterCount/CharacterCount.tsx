import { useState } from 'react'

const CharacterCount = () => {
  const [inputString, setInputString] = useState<string>('')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputString(event.target.value)
  }

  const output =
    inputString.length > 0
      ? `Character Count: [${inputString.length}] "${inputString}"`
      : 'Enter a string to see the character count'

  return (
    <div className="max-w-xl p-4 text-center">
      <h3 className="grenze-gotisch my-4 text-3xl">String Character Count</h3>
      <textarea
        className="mx-auto my-4 p-2 text-xl text-zinc-900"
        placeholder="So many possibilities here!"
        onChange={handleInputChange}
        rows={4}
      />
      <p className="mt-2">{output}</p>
    </div>
  )
}

export default CharacterCount
