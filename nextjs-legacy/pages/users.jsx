import logger from '../lib/logger.js'
import getDatabase from '../lib/database.js'

export default function Page({ users }) {
  const listItems = users.map(u => <li key={u.id}>
    <a href={"/user/" + u.id}>{u.firstName} {u.lastName}</a>
  </li>)

  return <ul>{listItems}</ul>
}

export async function getServerSideProps() {
  logger.info('rendering users page')
  const db = await getDatabase()

  return {
    props: {
      users: db.allUsers()
    }
  }
}
