const TRACTOR_TOUCHING = 'tractor-touching'
const TRACTOR_LESS = 'tractor-less'
const TRACTOR_GREATER = 'tractor-greater'
const TRACTOR_REFRESHING = 'tractor-refreshing'

class Tractor {
  constructor (options) {
    Object.assign(this, {
      scroller: 'body', // 滚动容器
      enableDragLoading: false, // 开启下拉加载
      enableScrollLoading: false, // 开启滚动加载
      avoidHorizontalSliding: false, // 开启避免横向滑屏
      dragThreshold: 40, // 下拉加载阈值
      scrollThreshold: 40, // 滚动加载阈值
      onDragStart: null, // 下拉开始
      onDragLessThreshold: null, // 下拉中，但还没到刷新阀阈值
      onDragGreaterThreshold: null, // 下拉中，已经达到刷新阈值
      onDragDone: null, // 下拉结束
      onScrollToThreshold: null // 滚动到阈值
    }, options)

    this.translate = 0 // 下拉容器偏移值
    this.scrollerLoading = false // 是否已经触发滚动加载状态
    this.scroller = document.querySelector(this.scroller)

    if (this.enableDragLoading) Tractor._initDrag.call(this)
    if (this.enableScrollLoading) Tractor._initScroll.call(this)
  }

  static _initDrag () {
    let isTouchStart = false // 是否已经触发下拉条件
    let isDragStart = false // 是否已经开始下拉
    let thresholdState = false // 是否下拉到阈值，用来触发 hook 的标识
    let startX = 0 // 下拉 touchstart 时的点坐标 x
    let startY = 0 // 下拉 touchstart 时的点坐标 y

    // 监听下拉
    this.scroller.addEventListener('touchstart', touchStart.bind(this), false)
    this.scroller.addEventListener('touchmove', touchMove.bind(this), false)
    this.scroller.addEventListener('touchend', touchEnd.bind(this), false)

    function touchStart (event) {
      // 只有当容器视图处于最顶部的时候才能触发下拉事件
      if (this.scroller.scrollTop <= 0) {
        isTouchStart = true
        startX = event.changedTouches[0].pageX
        startY = event.changedTouches[0].pageY
      }
    }

    function touchMove (event) {
      // return false 会阻止默认事件
      if (!isTouchStart) return

      // 手指在屏幕移动的距离
      const distance = event.changedTouches[0].pageY - startY
      if (distance > 0) {
        // 下拉时容器偏移的距离
        this.translate = Math.pow(distance, 0.85)
      } else {
        // 为了避免多次给元素设置样式属性
        if (this.translate !== 0) {
          this.translate = 0
          elTransform(this.scroller, `translate3d(0, ${this.translate}px, 0)`)
        }
      }

      // 避免横向滑屏
      if (this.avoidHorizontalSliding) {
        var diffDistance = Math.abs(event.touches[0].pageX - startX) - Math.abs(event.touches[0].pageY - startY)
        if (diffDistance > 0) return false
      }

      if (distance > 0) {
        event.preventDefault()
        this.scroller.classList.add(TRACTOR_TOUCHING)

        // 触发下拉开始 hook
        if (!isDragStart) {
          isDragStart = true
          if (this.onDragStart) this.onDragStart()
        }

        if (this.translate <= this.dragThreshold) {
          // 容器偏移值未达到下拉加载（刷新）阈值

          if (this.scroller.classList.contains(TRACTOR_GREATER)) this.scroller.classList.remove(TRACTOR_GREATER)
          if (!this.scroller.classList.contains(TRACTOR_LESS)) this.scroller.classList.add(TRACTOR_LESS)

          // 触发下拉未达到阈值状态 hook
          if (!thresholdState) {
            thresholdState = !thresholdState
            if (this.onDragLessThreshold) this.onDragLessThreshold()
          }
        } else {
          // 容器偏移值已达到下拉加载（刷新）阈值

          if (this.scroller.classList.contains(TRACTOR_LESS)) this.scroller.classList.remove(TRACTOR_LESS)
          if (!this.scroller.classList.contains(TRACTOR_GREATER)) this.scroller.classList.add(TRACTOR_GREATER)

          // 触发下拉已达到阈值状态 hook
          if (thresholdState) {
            thresholdState = !thresholdState
            this.onDragGreaterThreshold()
          }
        }

        elTransform(this.scroller, `translate3d(0, ${this.translate}px, 0)`)
      }
    }

    function touchEnd (event) {
      if (!isTouchStart) return

      // 下拉结束还原状态
      isDragStart = false
      isTouchStart = false

      this.scroller.classList.remove(TRACTOR_TOUCHING)

      if (this.translate <= this.dragThreshold) {
        this.scroller.classList.remove(TRACTOR_LESS)
        translateScroller.apply(this, [300, 0])
      } else {
        this.scroller.classList.remove(TRACTOR_GREATER)
        this.scroller.classList.add(TRACTOR_REFRESHING)
        translateScroller.apply(this, [100, this.dragThreshold])

        // 触发下拉加载（刷新）完成 hook
        this.onDragDone()
      }
    }
  }

  static _initScroll () {
    this.scroller.addEventListener('scroll', scrolling.bind(this), false)

    function scrolling () {
      if (this.scrollerLoading) return

      const { scrollHeight, scrollTop } = this.scroller
      const scrollerHeight = this.scroller.getBoundingClientRect().height
      const scrollThreshold = scrollHeight - scrollerHeight - scrollTop

      // 达到滚动加载阈值
      if (scrollThreshold <= this.scrollThreshold) {
        this.scrollerLoading = true
        if (this.onScrollToThreshold) this.onScrollToThreshold() // hook
      }
    }
  }
}

Object.assign(Tractor.prototype, {
  dragLoadingDone () {
    this.scroller.classList.remove(TRACTOR_REFRESHING)
    translateScroller.apply(this, [300, 0])
  },
  scrollLoadingDone () {
    this.scrollerLoading = false
  }
})

function translateScroller (consuming, threshold) {
  window.requestAnimationFrame(translateRAF.bind(this))

  let time = 0
  function translateRAF (timestamp) {
    if (!time) time = timestamp
    let remain = this.translate - this.translate * (timestamp - time) / consuming
    if (remain < threshold) remain = this.translate = threshold

    elTransform(this.scroller, 'translate3d(0, ' + remain + 'px, 0)')

    if (remain > threshold) window.requestAnimationFrame(translateRAF.bind(this))
  }
}

function elTransform (el, transform) {
  const elStyle = el.style
  elStyle.webkitTransform = elStyle.MozTransform = elStyle.transform = transform
}

module.exports = Tractor
