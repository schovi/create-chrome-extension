export default function({webpackScript, bodyContent}) {
  const layout = `
<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />
  </head>
  <body>
    ${bodyContent}
    ${webpackScript}
  </body>
</html>
`

  return layout;
}
