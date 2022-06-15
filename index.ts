import { readFileSync, writeFileSync } from 'fs'
import { searchLyrics } from './search-lyrics'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const main = async () =>
{
	const search = await searchLyrics('Flight Facilities', 'Foreign Language')
	const lyrics = await search[0].download()

	for (let i = 5; i > 0; i--)
	{
		console.log(`${ i }...`)
		await sleep(1000)
	}

	for (const line of lyrics)
	{
		setTimeout(() => {
			console.log(line.text)
		}, line.time)
	}
}

main()