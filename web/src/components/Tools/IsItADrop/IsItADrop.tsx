import { useEffect, useState } from 'react'

const IsItADrop = () => {
  const [roomDimensions, setRoomDimensions] = useState({
    widthFt: 12,
    widthIn: 4,
    lengthFt: 13,
    lengthIn: 6,
  })
  const [rollWidth, setRollWidth] = useState(12)
  const [roomHasSeam, setRoomHasSeam] = useState(false)

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    let value = e.currentTarget.value.trim()
    value = value.replace(/\D/g, '')
    if (value !== '0' || '') {
      value = value.replace(/^0+/, '')
    }
    e.currentTarget.value = value !== '' ? value : '0'
  }

  const handleRoomDimensionChange = (dimension: string, value: number) => {
    if (value < 0) value = 0
    if (dimension === 'widthIn' || dimension === 'lengthIn') {
      if (value > 11) value = 11
    } else if (value > 150) {
      value = 150
    }
    setRoomDimensions((prevDimensions) => ({
      ...prevDimensions,
      [dimension]: value,
    }))
  }

  useEffect(() => {
    const minSeamRequirement = rollWidth - 1 / 12
    const roomWidth = roomDimensions.widthFt + roomDimensions.widthIn / 12

    if (roomWidth > minSeamRequirement) {
      setRoomHasSeam(true)
    } else {
      setRoomHasSeam(false)
    }
  }, [roomDimensions, rollWidth])

  const blockquoteColor = roomHasSeam ? 'bg-red-500' : 'bg-green-500'

  return (
    <div className="container mx-auto mt-8 text-center">
      <section className="mb-4">
        <h2 className="grenze-gotisch mb-3 text-4xl font-semibold">
          Room Width
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex w-1/2 flex-col">
            <label className="mt-1 text-sm">
              <input
                name="roomWidthFt"
                className="input w-full max-w-24 p-3 text-center text-2xl"
                type="number"
                min="0"
                max="150"
                step={1}
                value={roomDimensions.widthFt}
                onChange={(e) =>
                  handleRoomDimensionChange('widthFt', parseInt(e.target.value))
                }
                onKeyUp={handleKeyUp}
              />
              Feet
            </label>
          </div>
          <div className="ml-4 flex w-1/2 flex-col">
            <label className="mt-1 text-sm">
              <input
                name="roomWidthIn"
                className="input w-full max-w-24 p-3 text-center text-2xl"
                type="number"
                min="0"
                max="11"
                step={1}
                value={roomDimensions.widthIn}
                onChange={(e) =>
                  handleRoomDimensionChange('widthIn', parseInt(e.target.value))
                }
                onKeyUp={handleKeyUp}
              />
              Inches
            </label>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <h2 className="grenze-gotisch mb-3 text-4xl font-semibold">
          Room Length
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex w-1/2 flex-col">
            <label className="mt-1 text-sm">
              <input
                name="roomLengthFt"
                className="input w-full max-w-24 p-3 text-center text-2xl"
                type="number"
                min="0"
                max="150"
                step={1}
                value={roomDimensions.lengthFt}
                onChange={(e) =>
                  handleRoomDimensionChange(
                    'lengthFt',
                    parseInt(e.target.value)
                  )
                }
                onKeyUp={handleKeyUp}
              />
              Feet
            </label>
          </div>
          <div className="ml-4 flex w-1/2 flex-col">
            <label className="mt-1 text-sm">
              <input
                name="roomLengthIn"
                className="input w-full max-w-24 p-3 text-center text-2xl"
                type="number"
                min="0"
                max="11"
                step={1}
                value={roomDimensions.lengthIn}
                onChange={(e) =>
                  handleRoomDimensionChange(
                    'lengthIn',
                    parseInt(e.target.value)
                  )
                }
                onKeyUp={handleKeyUp}
              />
              Inches
            </label>
          </div>
        </div>
      </section>

      <section>
        <div className="mt-4">
          <blockquote
            className={`grenze-gotisch p-4 text-5xl ${blockquoteColor}`}
          >
            {roomHasSeam ? 'Bring a Seaming Iron!' : "It's a Drop!"}
          </blockquote>
        </div>
      </section>

      <section className="mt-4">
        <div className="flex items-center justify-between">
          <label className="text-sm">
            Change Roll Width
            <select
              name="forRollWidth"
              value={rollWidth}
              onChange={(e) => setRollWidth(parseInt(e.target.value))}
              className="input w-124 w-16 text-center"
            >
              <option value="12">{"12'"}</option>
              <option value="15">{"15'"}</option>
            </select>
          </label>
        </div>
      </section>
    </div>
  )
}

export default IsItADrop
