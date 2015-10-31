import path from 'path'

export const root = path.normalize(path.join(__dirname, ".."))

export const packageJson = path.normalize(path.join(root, "package.json"))

export const src = path.normalize(path.join(root, "src"))

// TODO should build and releaseBuild be same property with condition on environment?
export const build = path.normalize(path.join(root, "build"))

export const release = path.normalize(path.join(root, "release"))

export const releaseBuild = path.normalize(path.join(release, "build"))

export const manifest = path.normalize(path.join(src, "manifest.json"))
