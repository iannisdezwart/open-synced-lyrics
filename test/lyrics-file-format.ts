import * as assert from 'assert'
import { readFileSync } from 'fs'
import { decodeLyrics, decodeLyricsLine } from '../lyrics-file-format.js'

describe('lyrics-file-format-test', () =>
{
	describe('decodeLyricsLine', () =>
	{
		it('should work when the line is in correct format', () =>
		{
			assert.doesNotThrow(() =>
			{
				decodeLyricsLine('[00:00.00]Hello World')
				decodeLyricsLine('[00:00.50]Bye World')
				decodeLyricsLine('[00:01.00]Hello World')
				decodeLyricsLine('[100:01.50]Bye World')
				decodeLyricsLine('[88:45.59]]]Bye [W]o][rld')
				decodeLyricsLine('[00:00.01]')
			})
		})

		it('should return the correct time and text', () =>
		{
			assert.deepEqual(
				decodeLyricsLine('[00:00.00]Hello World'),
				{ time: 0, text: 'Hello World' })

			assert.deepEqual(
				decodeLyricsLine('[00:00.50]Bye World'),
				{ time: 500, text: 'Bye World' })

			assert.deepEqual(
				decodeLyricsLine('[00:01.00]Hello World'),
				{ time: 1000, text: 'Hello World' })

			assert.deepEqual(
				decodeLyricsLine('[100:01.50]Bye World'),
				{ time: 6001500, text: 'Bye World' })

			assert.deepEqual(
				decodeLyricsLine('[88:45.59]]]Bye [W]o][rld'),
				{ time: 88 * 60 * 1000 + 45 * 1000 + 59 * 10, text: ']]Bye [W]o][rld' })

			assert.deepEqual(
				decodeLyricsLine('[00:00.01]'),
				{ time: 10, text: '' })
		})

		it('should throw if the line is not in the correct format', () =>
		{
			assert.throws(() =>
			{
				decodeLyricsLine('Hello World')
				decodeLyricsLine('[00:00.00')
				decodeLyricsLine('00:00.00: Hello')
				decodeLyricsLine('[00:00.00]Hello World')
				decodeLyricsLine('[00/00.00]Hello World')
				decodeLyricsLine('[00:00/00]Hello World')
			})
		})

		it('should throw if the number of seconds is invalid', () =>
		{
			assert.throws(() =>
			{
				decodeLyricsLine('[99:99.99]Hello World')
			})
		})
	})

	describe('decodeLyrics', () =>
	{
		it('should work when the file is in correct format', () =>
		{
			const exampleLyricsFile = readFileSync(
				'./test/sample-lyrics-file.lrc', 'utf8')
			const exampleLyricsDecode = JSON.parse(readFileSync(
				'./test/sample-lyrics-file.json', 'utf8'))

			const lyrics = decodeLyrics(exampleLyricsFile)

			assert.deepEqual(lyrics, exampleLyricsDecode)
		})
	})
})