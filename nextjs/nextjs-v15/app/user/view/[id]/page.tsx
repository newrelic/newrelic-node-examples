// See https://nextjs.org/docs/pages/building-your-application/data-fetching/forms-and-mutations

import logger from '../../../../lib/logger.js'
import getDatabase from '../../../../lib/database.js'

// See https://nextjs.org/docs/app/api-reference/functions/not-found
import { notFound } from 'next/navigation'

// Define the type of `params` prop passed to this route component
interface PageProps {
  params: {
    id: string
  }
}

export default async function Page({ params }: PageProps) {
  logger.info('rendering user page')
  const db = await getDatabase()
  const user = db.userById(params.id)

  if (user === undefined) {
    logger.error('cannot find user with id: %s', params.id)
    return notFound()
  }

  return (
    <pre>{JSON.stringify(user, null, 2)}</pre>
  )
}
