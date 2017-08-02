// 函数自执行  让代码模块化，防止变量冲突
// 分号是为了防止代码合并带来的报错
;(function(){

	// 需求：滚动的时候动态去改变topbar的透明度


	// 思路：
	// （1）基本的代码都应该在scroll事件里面完成
	// （2）通过不断变化的scrollTop去影响透明度 --- 比例：不断变化的scroll/自己设的最大滚动的值 = 不断变化的透明度/最大透明度

	// 自己设定的最大的滚动值
	var maxTop = 300;
	var topBar = document.querySelector('.jd-header');

	window.addEventListener('scroll', function(){
		// 获取不断变化的scrollTop值
		var scrollTop = document.body.scrollTop;
		// 极值判断
		if(scrollTop >= maxTop){
			topBar.style.background = 'rgba(201, 21, 35,0.8)';
		}else{
			topBar.style.background = 'rgba(201, 21, 35,'+ scrollTop/maxTop*0.8 +')';
		}
	})

	// 动态求出ul的宽度
	var ul = document.querySelector('.jd-sec-b > ul');
	var lis = ul.querySelectorAll('li');
	ul.style.width = lis[0].offsetWidth * lis.length + 'px';
})()

// 京东快报的轮播图
;(function(){

	//思路：
	//（1）复制一个临时工，追加到最后一个
	//（2）一旦看到了最后一个临时工，立马跳到第一个

	var scroll = document.querySelector('.jd-new-scroll');
	var  lis = scroll.querySelectorAll('li');
	// 复制临时工 然后追加
	scroll.appendChild(lis[0].cloneNode(true));
	// 信号量
	var index = 0;
	var timer = null;

	timer = setInterval(function(){
		// 信号量累加
		index++;
		var dx = -index*lis[0].offsetHeight;
		// 细节：过渡的时候不要大于定时器的时间
		scroll.style.transition  = 'transform .5s';
		scroll.style.transform  = 'translateY('+ dx +'px)';

	}, 1000);

	// 如何判断看到的是最后一个临时工，过渡结束的时候去瞅一瞅index的值
	scroll.addEventListener('transitionend',function(){
		// console.log(index);
		// lis.length是没有算克隆的 所以这里不需要-1
		if(index >= lis.length){
			index = 0;
			// 干掉过渡
			scroll.style.transition  = 'none';
			scroll.style.transform  = 'translateY(0px)';
		}
	})
})()

// 倒计时
;(function(){

	// 倒计时的当前时间来源一定是来源于服务器的时间

	//　我们目前只能用本地的时间去模拟

	// 倒计时需要两个时间  一个是当前时间 一个是未来时间

	// 获取当前时间
	var nowDate = new Date();
	//　获取未来时间
	var furDate = new Date('Jun 23 2017 17:30:00');
	// 得到相差的时间并且转换成秒数
	var dTime = parseInt((furDate - nowDate)/1000);

	var spans = document.querySelectorAll('.jd-sec-time span');

	var timer = null;

	timer = setInterval(function(){
		// 得到的秒数自减一
		dTime--;
		// 极值判断
		if(dTime < 0){
			clearInterval(timer);
			return false;
		}
		// 转换成时分秒
		// 转换的是 天 时 分 秒 d = Math.floor(dTime/86400) h = Math.floor(dTime%86400/3600) m = Math.floor(dTime%3600/60) Math.floor(dTime%60)

		var h = Math.floor(dTime/3600);
		var m = Math.floor(dTime%3600/60);
		var s = Math.floor(dTime%60);

		// 将得到是时间放到对应的容器里面去
		/*spans[0].innerHTML = Math.floor(h/10);
		spans[1].innerHTML = Math.floor(h%10);
		spans[3].innerHTML = Math.floor(m/10);
		spans[4].innerHTML = Math.floor(m%10);
		spans[6].innerHTML = Math.floor(s/10);
		spans[7].innerHTML = Math.floor(s%10);*/

		var str = toTwo(h) + ':' + toTwo(m) + ':' + toTwo(s);
		// 遍历str 将str的每一项放到对应的span里面
		for(var i = 0; i < str.length; i++){
			spans[i].innerHTML = str[i];
		}

	}, 1000);

	function toTwo(n){
		return n > 9 ? n : '0' + n;
	}
})()

// 轮播图
;(function(){

	//　css的准备工作
	//　（1）将所有的li进行定位
	//　（2）一旦li定位，那么ul就没有了高度，所以需要写一个最小高撑开，后续到JS里面动态求ul的高
	//　（3）小圆点 ：未知宽度水平居中
	//　（4）移动所有的li到屏幕外边去 不要用left去移
	
	// JS准备工作
	// （1）动态获取UL的高度
	// （2）动态设置了小圆点
	
	// 轮播图的滚动核心逻辑
	// （1）设置三个基本变量，存放三个基本的下标 （最后一个li的下标 0 1），归位
	// （2）开定时器 轮转下标，极值判断，设置过渡，重新归位
	// （3）设置小圆点 （center里面的装的值就是当前小圆点的下标）
	
	//　手滑控制轮播图
	//　（１）绑定三个ｔｏｕｃｈ事件，在ｓｔａｒｔ的时候，清除定时器，记录手指落点，设置时间
	//　（２）在ｍｏｖｅ的时候获取差值（距离），干掉过渡，执行归位（＋ｄｘ）
	//　（３）在ｅｎｄ的时候判断滑动是否成功（依据：距离是否超过屏幕的１/3，或者滑动的时候小于300毫秒同时长度超度30）
	//　（4）滑动失败，添加过渡，归位
	//　（5）滑动成功，判断方向，执行下一张还是上一张

	// js的准备工作
	var carousel = document.querySelector('.carousel');
	var ul = carousel.querySelector('ul');
	var lis = ul.querySelectorAll('li');
	var points = carousel.querySelector('ol');
	var timer = null;
	// 获取的屏幕的宽度
	var screenWidth = document.documentElement.offsetWidth;
	// 动态设置ul的高度
	ul.style.height = lis[0].offsetHeight + 'px';
	// resize 是当屏幕窗口在变化的时候实时触发
	window.addEventListener('resize',function(){
		ul.style.height = lis[0].offsetHeight + 'px';
		screenWidth = document.documentElement.offsetWidth;
	})
	// 动态设置小圆点
	for(var i = 0; i < lis.length; i++){
		var li = document.createElement('li');
		if(i == 0){
			li.classList.add('active');
		}
		points.appendChild(li);
	}
	var left = lis.length -1;
	var center = 0;
	var right = 1;
	// 归位
	setTranslate();
	timer = setInterval(showNext, 1000);
	// 记录最开始的手指落点
	var startX = 0;
	var startTime = null;
	ul.addEventListener('touchstart',touchstartHandler);
	ul.addEventListener('touchmove',touchmoveHandler);
	ul.addEventListener('touchend',touchendHandler);
	
	function touchstartHandler(e){
		// 清除定时器
		clearInterval(timer);
		// 记录一下开始滑动的时候的时间
		startTime = Date.now();
		// 开始的时候手指落点
		startX = e.changedTouches[0].clientX;
	}
	function touchmoveHandler(e){
		// 差值 （绝对值）从一个小的值到大的值 自带正负
		var dx = e.changedTouches[0].clientX - startX;

		// 在move事件里面，一律干掉过渡
		// 干掉过渡
		setTransition(0,0,0);
		// 归位
		setTranslate(dx);
	}
	function touchendHandler(e){
		// 判断用户是否滑动成功
		// 依据是 滑动的距离大于屏幕的1/3 
		// 或者是滑动的时间小于300毫秒同时距离大于30
		var dx = e.changedTouches[0].clientX - startX;
		var dTime = Date.now() - startTime;
		console.log(dTime);
		if(Math.abs(dx) > screenWidth/3 || (Math.abs(dx) > 30 && dTime < 300)){
			// 滑动成功
			if(dx > 0){
				// 往右滑 看到上一张
				showPrev();
			}else{
				// 往左滑 看到下一张
				showNext();
			}
		}else{
			// 滑动失败
			// 反弹回去 添加过渡  并且归位
			// 添加过渡
			setTransition(1,1,1);
			// 归位
			setTranslate();
		}

		// 重启定时器
		// 清除定时器
		clearInterval(timer);
		timer = setInterval(showNext, 1000);
	}
	function setTransition(a,b,c){
		if(a){
			lis[left].style.transition = 'transform .5s';
		}else{
			lis[left].style.transition = 'none';
		}
		if(b){
			lis[center].style.transition = 'transform .5s';
		}else{
			lis[center].style.transition = 'none';
		}
		if(c){
			lis[right].style.transition = 'transform .5s';
		}else{
			lis[right].style.transition = 'none';
		}
	}
	function setTranslate(dx){
		dx = dx || 0;
		// 归位
		lis[left].style.transform = 'translateX('+ (-screenWidth+dx) +'px)';
		lis[center].style.transform = 'translateX('+ dx +'px)';
		lis[right].style.transform = 'translateX('+ (screenWidth+dx) +'px)';
	}
	// 动态设置小圆点
	var positsLi = points.querySelectorAll('li');
	function setPoint(){
		for(var i = 0; i < positsLi.length; i++){
			positsLi[i].classList.remove('active');
		}
		positsLi[center].classList.add('active');
	}
	// 看到下一张
	function showNext(){
		// 轮转下标
		left = center;
		center = right;
		right++;
		//　极值判断
		if(right > lis.length -1){
			right = 0;
		}
		setTransition(1,1,0);
		// 归位
		setTranslate();

		setPoint();
	}
	// 看到上一张
	function showPrev(){
		// 轮转下标
		right = center;
		center = left;
		left--;
		//　极值判断
		if(left < 0){
			left = lis.length -1;
		}
		// 添加过渡
		// 左边的图片永远是替补的，所以压根儿不需要过渡
		setTransition(0,1,1);
		// 归位
		setTranslate();
		setPoint();
	}

})()


