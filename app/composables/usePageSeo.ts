interface PageSeoInput {
  title: string
  description: string
  path: string
}

export function usePageSeo({ title, description, path }: PageSeoInput): void {
  useSeoMeta({ title, description })
  useHead({ link: [{ rel: 'canonical', href: `${SITE_URL}${path}` }] })
}
