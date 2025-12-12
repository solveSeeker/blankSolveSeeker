import { GraphQLClient } from 'graphql-request'
import { createClient } from '@/shared/lib/supabase/client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const GRAPHQL_ENDPOINT = `${SUPABASE_URL}/graphql/v1`

export async function getGraphQLClient() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
    },
  })

  return client
}
