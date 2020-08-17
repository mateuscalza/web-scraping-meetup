import type { Page, ResourceType } from 'puppeteer'

export default async function filterRequests(page: Page, resourceTypes: ResourceType[]) {
  await page.setRequestInterception(true)
  page.on('request', request => {
    const resourceType = request.resourceType()
    if (!resourceTypes.includes(resourceType)) {
      request.abort()
    } else {
      request.continue()
    }
  })
}
