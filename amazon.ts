import puppeteer from 'puppeteer'
import pMap from 'p-map'
import { initialDelete, append } from './csv'
import { Book } from './book'
import filterRequests from './filterRequests'

async function main() {
  await initialDelete()

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
  })

  const page = await browser.newPage()
  const startedAt = +new Date()
  await filterRequests(page, ['document'])

  let pageNumber = 1
  let newBooks: Book[] = []
  do {
    await page.goto(`https://www.amazon.com.br/s?i=stripbooks&s=price-asc-rank&page=${pageNumber}`)
    newBooks = await page.evaluate(() => {
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

    await pMap(newBooks, append, {
      concurrency: 4,
    })

    console.table(newBooks)
    console.log(((+new Date() - startedAt) / 1000).toFixed(3), 'seconds')

    pageNumber++
  } while (newBooks.length)

  await browser.close()
}
main().catch(error => console.error(error))
