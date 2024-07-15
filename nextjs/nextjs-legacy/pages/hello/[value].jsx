// This file shows a static page that is generated at compile time utilizing
// static data. Requests to pages such as this one will show up with the
// correct paths in the New Relic dashboard.

export async function getStaticProps({ params }) {
  return {
    props: { value: params.value }
  }
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { value: 'world' } }],
    fallback: false
  }
}

export default function Page({ value }) {
  return <p>Hello {value}!</p>
}
