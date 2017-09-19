# tractor.js

移动端下拉加载（刷新）和滚动加载，无依赖，支持现代浏览器。

## Example

[Demo](https://monine.github.io/tractor/example/)

## Usage

`npm install --save tractor`

```
// ES6
import Tractor from 'tractor'
new Tractor(options)

// or

<script src="node_modules/tractor/dist/tractor.js"></script>
<script>
  new Tractor(options)
</script>
```

## options

- **`scroller`** *{String} @require* - 容器

  使用 `document.querySelector(scroller)` 获取 HTMLElement

- **`enableDragLoading`** *{Boolean} @default = false* - 启用下拉加载（刷新）功能

- **`enableScrollLoading`** - 启用滚动加载功能

  *{Boolean} @default = false*

- **`avoidHorizontalSliding`** *{Boolean} @default = false* - 避免横向滑屏

  防止误操作，比如手指横向滑动的同时也有一些距离的竖向滑动（下拉）

- **`dragThreshold`** *{Number} @default = 40* - 下拉加载（刷新）阈值

  手指离开屏幕时触发下拉加载（刷新）行为的临界值

- **`scrollThreshold`** *{Number} @default = 40* - 滚动加载阈值

  容器滚动到底部时触发滚动加载行为的临界值

- **`onDragStart`** *{Function} @default = null* - 下拉开始 hook

  手指触碰屏幕时触发

- **`onDragLessThreshold`** *{Function} @default = null* - 下拉距离小于阈值 hook

  手指触碰屏幕然后滑动时触发；下拉距离从大于阈值到小于阈值时触发

- **`onDragGreaterThreshold`** *{Function} @default = null* - 下拉距离大于阈值 hook

  下拉距离从小于阈值到大于阈值时触发

- **`onDragDone`** *{Function} @default = null* - 下拉加载（刷新） hook

  手指离开屏幕并且下拉距离大于阈值时触发

- **`onScrollToThreshold`** *{Function} @default = null* - 滚动到阈值 hook

  容器滚动到离底部还有阈值距离时触发

### example

``` javascript
new Tractor({
  scroller: '.scroller',
  enableDragLoading: true,
  enableScrollLoading: true,
  dragThreshold: 50,
  scrollThreshold: 50,
  onDragStart: function () {
    console.log('onDragStart')
  },
  onDragLessThreshold: function () {
    console.log('onDragLessThreshold')
  },
  onDragGreaterThreshold: function () {
    console.log('onDragGreaterThreshold')
  },
  onDragDone: function () {
    console.log('onDragDone')
    // 加载新内容或刷新内容
  },
  onScrollToThreshold: function () {
    console.log('onScrollToThreshold')
    // 加载新内容
  }
})
```

## LICENSE

MIT
