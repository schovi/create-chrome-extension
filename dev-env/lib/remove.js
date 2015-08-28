export function extension(filepath) {
  return filepath.split(".").slice(0,-1).join(".")
}

export function path(filepath) {
  const split = filepath.split("/")

  return split[split.length - 1]
}

export function all(filepath) {
  return extension(path(filepath))
}

export function file(filepath) {
  return filepath.split("/").slice(0,-1).join("/")
}
