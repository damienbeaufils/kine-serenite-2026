interface PageSeoInput {
  title: string
  description: string
  path: string
}

export function usePageSeo({ title, description, path }: PageSeoInput): void {
  const url = `${SITE_URL}${path}`
  useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogUrl: url })
  useHead({ link: [{ rel: 'canonical', href: url }] })
}
