import logger from '../../lib/logger.js'
import getDatabase from '../../lib/database.js'

export default async function UsersPage() {
  logger.info('rendering users page')
  const db = await getDatabase()
  const users = db.allUsers()

  const listItems = users.map(u => <li key={u.id}>
    {u.firstName} {u.lastName}&nbsp;
    <a href={"/user/view/" + u.id}>View</a>&nbsp;
    <a href={"/user/edit/" + u.id}>Edit</a>
  </li>)

  return <ul>{listItems}</ul>
}
