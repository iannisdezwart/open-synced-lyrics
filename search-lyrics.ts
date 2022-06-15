import { JSDOM } from 'jsdom'
import { decodeLyrics } from './lyrics-file-format'

/**
 * Represents a lyrics search result.
 */
class LyricsEntry
{
	// The title of the song.
	title: string

	// The artist of the song.
	artist: string

	// A link to the lyrics page.
	link: string

	constructor(title: string, artist: string, link: string)
	{
		this.title = title
		this.artist = artist
		this.link = link
	}

	/**
	 * Downloads the lyrics file and parses the .LRC file to JSON.
	 */
	async download()
	{
		const dom = await JSDOM.fromURL(this.link)
		const { document } = dom.window

		const lrc = document.querySelector('#entry').textContent

		return decodeLyrics(lrc)
	}
}

/**
 * Searches for synced lyrics on https://lyricsify.com.
 *
 * @param artist The artist of the song.
 * @param title The title of the song. May also include additional information
 *              like featuring artists.
 */
export const searchLyrics = async (artist: string, title: string) =>
{
	const searchQuery = encodeURIComponent(artist.replace(/ /g, '+')) + '+'
		+ encodeURIComponent(title.replace(/ /g, '+'))
	const url = `https://lyricsify.com/search?q=${ searchQuery }`

	const dom = await JSDOM.fromURL(url)
	const { document } = dom.window

	const entries = document.querySelectorAll('.li')
	return parseLyricsEntries(entries)
}

/**
 * Parses the HTML entries from the search results.
 *
 * @param entries The HTML entries from the search results.
 */
const parseLyricsEntries = (entries: NodeListOf<Element>) =>
{
	// Parse each entry and put them in an array.

	return Array.from(entries).map(parseLyricsEntry)
}

/**
 * Parses an HTML entry from the search results.
 *
 * @param entry The HTML entry from the search results.
 */
const parseLyricsEntry = (entry: HTMLElement) =>
{
	// Each entry looks like this:
	/*
	<div class="li">
		1.
		<a href="/lyrics/test/test/YlB0NA" class="title">
			test - test.lrc
		</a>
		<span>1.27 KB · 5 years ago</span>
	</div>
	*/

	const titleArtist = entry.querySelector('a.title') as HTMLAnchorElement
	const title = titleArtist.textContent.substring(
		0, titleArtist.textContent.indexOf('-')).trim()
	const artist = titleArtist.textContent.substring(
		titleArtist.textContent.indexOf('-') + 1).trim()
	const link = new URL(titleArtist.href, 'https://lyricsify.com').href

	return new LyricsEntry(title, artist, link)
}