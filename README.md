okam-plugin-tinyimg
======

tiny img plugin for okam (small program framework)


## use

```
npm install okam-plugin-tinyimg --save-dev
```

```
// your.config.js

rules: [
    {
        match: /\.(png|jpe?g|gif)(\?.*)?$/,
        processors: {
            tinyimg: {
                // boolean 是否替换源文件, 默认为 false
                replaceRaw: true,

                // 若 replaceRaw 为 true, 源文件存放的位置，默认为 'doc/img' (相对于项目根文件)
                releaseSourcePath: 'doc/img',

                // 忽略不压缩的文件 ignore(path):boolean
                // ignore(path) {//... return true/false;}
            }
        }
    }
]
```

## example

```
okam [INFO] src/common/img/game.png compressed [1482->1421](4.12%)
okam [INFO] source file src/common/img/game.png has been move to doc/img/src/common/img
okam [INFO] src/common/img/game.png has been replaced
okam [INFO] src/common/img/game.png has been cached

okam [INFO] src/common/img/go_arrow.png compressed by cache /Users/xxx/.okam
okam [INFO] source file src/common/img/go_arrow.png has been move to doc/img/src/common/img
okam [INFO] src/common/img/go_arrow.png has been replaced

okam [INFO] process src/common/img/game.png 415 ms
okam [INFO] src/common/img/go_arrow.png has already been compressed

```
