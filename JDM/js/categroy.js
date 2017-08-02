// 滑动滚动
;(function(){

	var myScroll =  new  IScroll('#right-scroll');

	scroll('#scroll-wrap');
	// scroll('#right-scroll');
	function scroll(id){
		// 需求：让ul跟随手指滑动，并且有反弹效果。。。。
		// （1）让ul跑起来
		// （2）在move的时候，限制滑动的区间  往下的区间 ： 50  往上的区间 -（ul的高 - left的高 + 50）
		// （3）
		// 最外围容器
		var scrollWrap = document.querySelector(id);
		var ul = scrollWrap.children[0];
		// 检测 如果一旦ul的高度小于外围容器的高度，直接返回
		if(ul.offsetHeight <= scrollWrap.offsetHeight){
			return;
		}
		// 记录最开始的手指落点
		var startY = 0;
		// 记录最终的落点的值
		var centerY = 0;
		// 滑动区间
		var maxDown = 50;
		var maxUp = -(ul.offsetHeight - scrollWrap.offsetHeight + maxDown);
		// 反弹区间
		var maxBounceDown = 0;
		var maxBounceUp = -(ul.offsetHeight - scrollWrap.offsetHeight);

		ul.addEventListener('touchstart', function(e){
			// 记录最开始的手指落点
			startY = e.changedTouches[0].clientY;
		});
		ul.addEventListener('touchmove', function(e){
			// 在move的时候干掉过渡
			ul.style.transition = 'none';
			// 获取差值 这个差值每一次都是从0 - 越来越大的数
			var dy = e.changedTouches[0].clientY - startY;
			// 临时的变量存储一下  
			var tempY = centerY + dy;
			//　在这里一定是centerY + dy作为最终判断的依据
			if( tempY > maxDown){
				tempY = maxDown;
			}else if(tempY < maxUp){
				tempY = maxUp;
			}
			ul.style.transform = 'translateY('+ tempY +'px)';
		});
		ul.addEventListener('touchend', function(e){
			// 在end的时候，将上一次滑动的最终位置重新赋值给center，以便下一次滑动的时候，基于这个值在去加上差值
			var dy = e.changedTouches[0].clientY - startY;
			centerY += dy;

			if( centerY > maxBounceDown){
				// 同步centerY 这里一定注意
				centerY = maxBounceDown;
				ul.style.transition = 'transform .5s';
				ul.style.transform = 'translateY('+ centerY +'px)';
			}else if(centerY < maxBounceUp){
				centerY = maxBounceUp;
				ul.style.transition = 'transform .5s';
				ul.style.transform = 'translateY('+ centerY +'px)';
			}

		});
	}

})()