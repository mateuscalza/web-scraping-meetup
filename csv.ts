import fse from 'fs-extra'
import { Book } from './book'

export const filePath = 'news.csv'

export async function append(book: Book) {
  await fse.appendFile(filePath, `"${book.title}";"${book.author}";"${book.publishedAt}"\n`)
}

export async function initialDelete() {
  if (await fse.pathExists(filePath)) {
    await fse.unlink(filePath)
  }
}
