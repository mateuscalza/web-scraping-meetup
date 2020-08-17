import puppeteer from 'puppeteer'
import fse from 'fs-extra'
import pMap from 'p-map'

const filePath = 'news.csv'

async function append(title: string) {
  await fse.appendFile(filePath, `${title}\n`)
}

async function main() {
  await fse.unlink(filePath)
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
  })
  const page = await browser.newPage()
  await page.goto('https://www.amazon.com.br/s?i=stripbooks&s=price-asc-rank&page=1')
  const titles = await page.evaluate(() => {
    const titleElements = Array.from(document.querySelectorAll('h2 a'))
    return titleElements.map(titleElement => titleElement.textContent.trim())
  })
  console.table(titles)

  await pMap(titles, append, {
    concurrency: 4,
  })

  await browser.close()
}
main().catch(error => console.error(error))
