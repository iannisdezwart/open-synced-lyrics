interface LyricLine
{
	// Time of the lyric line in milliseconds.
	time: number

	// The text of the line.
	text: string
}

/**
 * Decodes a .LRC (lyrics file format) encoded string into an array of lyrics.
 *
 * Example input:
 * [00:00.00]Hello World
 * [00:00.50]Bye World
 * [00:01.00]Hello World
 *
 * Example output:
 * [
 *     { time: 0, text: "Hello World" }
 *     { time: 500, text: "Bye World" }
 *     { time: 1000, text: "Hello World" }
 * ]
 *
 * @param str The string of lyrics to decode.
 */
export const decodeLyrics = (str: string) =>
{
	const lyrics: LyricLine[] = []
	const lines = str.split('\n')

	for (let i = 0; i < lines.length; i++)
	{
		const line = lines[i]

		// Ignore non-lyrics lines.

		if (line == '' || isMetadata(line))
		{
			continue
		}

		// Decode the next line.

		try
		{
			lyrics.push(decodeLyricsLine(line))
		}
		catch (err)
		{
			throw new Error(`At line ${ i + 1 }:\n`
				+ err.message)
		}
	}

	return lyrics
}

/**
 * Returns true if this line contains metadata about the lyrics.
 * These lines should be ignored when decoding lyrics.
 */
const isMetadata = (line: string) =>
{
	// Metadata lines are of the form "[XX:YYYYY...]".
	// For example: "[ar:Artist]", "[ti:Title]", "[al:Album]".

	if (line.match(/^\[[a-z]+:.*\]/))
	{
		return true
	}
}

/**
 * Converts a single line of .LRC (lyrics file format) into a LyricLine object.
 *
 * Example input:
 * [00:00.00]Hello World
 *
 * Example output:
 * { time: 0, text: "Hello World" }
 *
 * @param line The line of lyrics to decode.
 * @throws If the line is not in the correct format.
 */
export const decodeLyricsLine = (line: string) =>
{
	// Check format of line.
	// "[00:00.00]Hello World".
	//  ^        ^

	if (!line.startsWith('['))
	{
		throw new Error(`Invalid line: "${ line }".\n`
			+ `Does not start with '['`)
	}

	if (!line.includes(']'))
	{
		throw new Error(`Invalid line: "${ line }".\n`
			+`Does not contain ']'`)
	}

	const timeStr = line.substring(1, line.indexOf(']'))

	// Check format of time.
	// "MM:SS.mm".

	const minutesStr = timeStr.substring(0, timeStr.indexOf(':'))

	if (!minutesStr.match(/\b[0-9][0-9]+\b/))
	{
		throw new Error(`Invalid line: "${ line }".\n`
			+ `Unexpected non-digit character in time segment.\n`
			+ `Expected: "[XX:XX.XX]", where Xs are numbers.\n`)
	}

	const minutes = parseInt(minutesStr)

	const secondsStr = timeStr.substring(timeStr.indexOf(':') + 1,
	timeStr.indexOf('.'))

	if (!secondsStr.match(/\b[0-9][0-9]\b/))
	{
		throw new Error(`Invalid line: "${ line }".\n`
			+ `Unexpected non-digit character in time segment.\n`
			+ `Expected: "[XX:XX.XX]", where Xs are numbers.\n`)
	}

	const seconds = parseInt(secondsStr)

	if (seconds < 0 || seconds >= 60)
	{
		throw new Error(`Invalid line: "${ line }".\n`
			+ `Seconds out of range [0-60].\n`
			+ `Found ${ seconds }.\n`)
	}

	const centisecondsStr = timeStr.substring(timeStr.indexOf('.') + 1)

	if (!centisecondsStr.match(/\b[0-9][0-9]\b/))
	{
		throw new Error(`Invalid line: "${ line }".\n`
			+ `Unexpected non-digit character in time segment.\n`
			+ `Expected: "[XX:XX.XX]", where Xs are numbers.\n`)
	}

	const centiseconds = parseInt(centisecondsStr)

	// Compute the time in milliseconds when the lyrics should appear. 

	const time = centiseconds * 10 + seconds * 1000 + minutes * 60 * 1000

	// Read text segment.

	const text = line.substring(line.indexOf(']') + 1).trim()

	return { time, text }
}