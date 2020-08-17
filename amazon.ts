import puppeteer from 'puppeteer'
import pMap from 'p-map'
import { initialDelete, append } from './csv'
import { Book } from './book'

async function main() {
  await initialDelete()

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
  })
  const page = await browser.newPage()
  await page.goto('https://www.amazon.com.br/s?i=stripbooks&s=price-asc-rank&page=1')
  const books: Book[] = await page.evaluate(() => {
    const infoLineRegExp = /por\s([a-zA-Z\u00C0-\u00ff,\.\s]+)\s?\|\s?([0-9a-z\s]+)/

    function extractBookContent(bookElement: Element) {
      const title = bookElement.querySelector('h2').textContent.trim()
      const infoLine = bookElement.querySelector('h2 + div')?.textContent.trim() ?? ''

      const [, rawAuthor, publishedAt] = infoLineRegExp.exec(infoLine) ?? []

      const author = rawAuthor?.trim()

      return {
        title,
        author,
        publishedAt,
      }
    }

    const bookElements = Array.from(document.querySelectorAll('[data-asin]:not([data-asin=""])'))
    return bookElements.map(extractBookContent)
  })

  console.table(books)

  await pMap(books, append, {
    concurrency: 4,
  })

  await browser.close()
}
main().catch(error => console.error(error))
