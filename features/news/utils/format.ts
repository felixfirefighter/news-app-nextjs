export const formatHostname = (link: string) => {
  const url = new URL(link)
  return url.hostname
}

export const getInitials = (name: string, maxInitials = 2) => {
  return name
    .split(' ')
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}
