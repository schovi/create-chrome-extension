Hot middleware


**package.json**

```
"webpack-dev-middleware": "^1.5.1",
"webpack-hot-middleware": "2.6.4",
```


**dev-env/manifest/plugin.js**

```
item = [
  'webpack-hot-middleware/client'
  'webpack/hot/only-dev-server',
  script
]
```


**dev-env/webpack/server.js**

```
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require('webpack-hot-middleware')


var app = express();

app.use(webpackDevMiddleware(compiler, webpackDevServerOptions));

app.use(webpackHotMiddleware(compiler));

app.listen(port, host, function(err) {
  if (err) {
    console.log(err)
  } else {
    console.log('Listening at https://' + host + ':' + port);
  }
});
```
