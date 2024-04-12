import logger from '../lib/logger.js'
import getDatabase from '../lib/database.js'

export default function Page({ users }) {
  const listItems = users.map(u => <li key={u.id}>
    {u.firstName} {u.lastName}&nbsp;
    <a href={"/user/view/" + u.id}>View</a>&nbsp;
    <a href={"/user/edit/" + u.id}>Edit</a>
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
