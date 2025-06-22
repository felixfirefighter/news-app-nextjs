export const formatHostname = (link: string) => {
  const url = new URL(link)
  return url.hostname
}
