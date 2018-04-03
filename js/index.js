

//-----------------------------------------------

let loadingRender=(function($){
    let $loadingBox=$('.loadingBox');
    let $run=$loadingBox.find('.run');
    
    //我们需要处理的图片
    let imgList=["img/icon.png","img/zf_concatAddress.png","img/zf_concatInfo.png","img/zf_concatPhone.png","img/zf_course.png","img/zf_course1.png","img/zf_course2.png","img/zf_course3.png","img/zf_course4.png","img/zf_course5.png","img/zf_course6.png","img/zf_cube1.png","img/zf_cube2.png","img/zf_cube3.png","img/zf_cube4.png","img/zf_cube5.png","img/zf_cube6.png","img/zf_cubeBg.jpg","img/zf_cubeTip.png","img/zf_emploment.png","img/zf_messageArrow1.png","img/zf_messageArrow2.png","img/zf_messageChat.png","img/zf_messageKeyboard.png","img/zf_messageLogo.png","img/zf_messageStudent.png","img/zf_outline.png","img/zf_phoneBg.jpg","img/zf_phoneDetail.png","img/zf_phoneListen.png","img/zf_phoneLogo.png","img/zf_return.png","img/zf_style1.jpg","img/zf_style2.jpg","img/zf_style3.jpg","img/zf_styleTip1.png","img/zf_styleTip2.png","img/zf_teacher1.png","img/zf_teacher2.png","img/zf_teacher3.jpg","img/zf_teacher4.png","img/zf_teacher5.png","img/zf_teacher6.png","img/zf_teacherTip.png"]
     
   
    //控制图片加载进度，计算滚动条加载长度
    let total=imgList.length,
    	cur=0;
    let computed=function(){
    	     imgList.forEach(function(item){
    	     	let tempImg=new Image;
    	     	tempImg.src=item;
    	     	tempImg.onload=function(){
    	     		tempImg=null;
    	     		cur++;
    	     		runFn(cur);
    	     		
    	     	}
    	     	
    	     });
    };
    
    //计算滚动条加载长度
    let runFn=function(cur){
        $run.css('width',cur/total*100+'%');        
        if(cur>=total){
        	//需要延迟的图片都加载成功了：进入到下一个区域(设置一个缓冲等待时间，当加载完成， 让用户看到加载完成的效果，在进入到下一个区域)
        	let delayTimer=setTimeout(()=>{
        		$loadingBox.remove();
        		phoneRender.init();
        		clearTimeout(defaultstatus);
        	},1000);
        }
    };
    

    return{
        	init:function(){
        	 $loadingBox.css('display','block');
        	 computed();
        }
    }
       	
        	
})(Zepto);
      
//loadingRender.init();
 
 
let phoneRender=(function($){	
	let $phoneBox=$('.phoneBox'),
	    $time=$phoneBox.find('.time'),
	    $listen=$phoneBox.find('.listen'),
	    $listeTouch=$phoneBox.find('.touch'),
	    $detail=$phoneBox.find('.detail'),
	    $detailTouch=$phoneBox.find('.touch');
	    
	    
	let audioBell=$('#audioBell')[0],
	    audioSay=$('#audioSay')[0];  //转化成原生的JS
	    
	let $phonePlan=$.Callbacks(); //发布订阅模式
	   
	   //控制盒子的显示隐藏
        $phonePlan.add(function(){
        	$listen.remove();
        	$detail.css('transform','translateY(0)');
        });
	    
	    //控制SAY播放
	    $phonePlan.add(function(){
	    	audioBell.pause();
	    	audioSay.play();
	    	$time.css('display','block');
	    	
	    	let sayTimer=setInterval(()=>{
	    		//总时间和已经播放的时间：单位秒
	    	    let duration=audioSay.duration,
	    	        current=audioSay.currentTime;
	    	    
	    	    let minute=Math.floor(current/60),
	    	        second=Math.floor(current-minute*60);

		    	    minute<10?minute='0'+minute:null;
		    	    second<10?second='0'+second:null;
	    	    
	    	         $time.html(`${minute}:${second}`);
	    	   
	    	    //播放结束
	    	    if(current>=duration){
	    	    	clearInterval(sayTimer);
	    	    	enterNext();
	    	    }
	    	},1000);	    	
	    });
	
	//detail-touch
	  $phonePlan.add(function(){
	  	$detailTouch.tap(enterNext);
	  });
	
	//进入下一个区域
	let enterNext=function(){
		audioSay.pause();
		$phoneBox.remove();
		
		messageRender.init();
		
	};
	
	return{
		init:function(){
	        $phoneBox.css('display','block');
	        //控制BELL播放
	        audioBell.play();
	        audioBell.volume=0.8;//控制音量
	        //audioBell.pause();//暂停
	        
	        //LISTEN-TOUCH
	        $listeTouch.tap($phonePlan.fire); //点击事件
		}
	}
})(Zepto);

//phoneRender.init();



/*-------message--------*/

let messageRender=(function(){
	let $messageBox=$('.messageBox'),
	    $talkBox=$messageBox.find('.talkBox'),
	    $talkList=$talkBox.find('li'),
	    $keyBord=$messageBox.find('.keyBord'),
	    $keyBordText=$keyBord.find('span'),
	    $submit=$keyBord.find('.submit'),
	    musicAudio=$('#musicAudio')[0];
	   
    let $plan=$.Callbacks();    
	    
	    //控制消息逐条显示
	    let step=-1,
	        autoTimer=null,
	        interval=1500,
	        offset=0;
	        
	    $plan.add(()=>{
	    	autoTimer=setInterval(()=>{
	    		step++;
	    		let $cur=$talkList.eq(step);
	    		$cur.css({
	    			opacity:1,
	    			transform:'translateY(0)'
	    		});
	    		
	    		//当第三条完全展示后立即调取出键盘（step===2&&当前LI显示的动画已经完成）
	    		
	    		if(step===2){
	    			//transitionend:当前元素正在运行的css3过渡动画已经完成，就回触发这个事件（有几个元素样式需要改变，就会被触发执行几次）
	    			//one:jq中的事件绑定方法，主要想要实现当前事件只绑定一次，触发一次后，给事件绑定的方法自动移除
	    			
	    			$cur.one('transitionend',()=>{
	    				
	    				$keyBord.css('transform','translateY(0)').one('transitionend',textMove);
	    				
	    			});
	    			clearInterval(autoTimer);
	    			return;
	    		}
	    		
	    		//从第五条完全展示后立即调取出键盘（step===2&&当前Li显示的动画已经完成）
	    		if(step>=4){
	    			offset+=-$cur[0].offsetHeight;
	    			$talkBox.css('transform',`translateY(${offset}px)`);
	    			
	    		}
	    		//已经把LI都显示了：结束动画，进入到下一个区域即可
	    		if(step>=$talkList.length-1){
	    			clearInterval(autoTimer);
                     let delayTimer=setTimeout(()=>{
                     	musicAudio.pause();
		    			$messageBox.remove();
		    			cubeRender.init();
		    			clearTimeout(delayTimer);
                     },interval);
	    			
	    		}
	    		
	    	},interval);
	    });
	    
	    //控制文字打印机效果
	    let textMove=function(){
	    	let text=$keyBordText.html();
	    	$keyBordText.css('display','block').html('');
	    	
	    	let timer=null,
	    	    n=-1;
	    	timer=setInterval(()=>{
	    		if(n>=text.length){
	    			//打印机效果完成，让发送按钮显示(并且给其绑定点击事件)
	    			$submit.css('display','block').tap(()=>{
	    				$keyBordText.css('display','none');
	    				$keyBord.css('transform','translateY(3.7rem)');
	    				
	    				$plan.fire();//因为此时计划表中只有一个方法，重新通知计划中的这个方法执行
	    			});
	    			clearInterval(timer);
	    			return;
	    		}
	    		n++;
	    		$keyBordText[0].innerHTML+=text.charAt(n);
	    	},100);
	    	
	    	
	    };
	    
	    
	return{
		init:function(){
			$messageBox.css('display','block');
			musicAudio.play();
			$plan.fire();
		}
	}
})(Zepto);
//messageRender.init();

/*-----cube-----*/
//只要以后在移动端浏览器中实现滑动操作，都需要把浏览器默认的滑动行为（例如也可切换）禁止掉
$(document).on('touchstart touchmove touchend',function(e){
	e.preventDefault();
});
let cubeRender=(function(){
	let $cubeBox=$('.cubeBox'),
	    $box=$cubeBox.find('.box');
	   
	let touchBegin=function(e){
		//this:box
		let point=e.changedTouches[0]; 
		$(this).attr({ //attr自定义属性是字符串的。float是为了转换成数字
			strX:point.clientX,
			strY:point.clientY,
			isMove:false,
			changeX:0,
			changeY:0
		});
	};
	let touching=function(e){
		let point=e.changedTouches[0],
		    $this=$(this);
		let changeX=point.clientX-parseFloat($this.attr('strX')),
		    changeY=point.clientY-parseFloat($this.attr('strY'));
		    
		    if(Math.abs(changeX)>10||Math.abs(changeY)>10){
		    	$this.attr({
		    		isMove:true,
		    		changeX:changeX,
		    		changeY:changeY
		    	});
		    }
	};
	
	let touchEnd=function(e){
		let point=e.changedTouches[0],
		    $this=$(this);
		let isMove=$this.attr('isMove'),
		    changeX=parseFloat($this.attr('changeX')),
		    changeY=parseFloat($this.attr('changeY')),
		    rotateX=parseFloat($this.attr('rotateX')),
		    rotateY=parseFloat($this.attr('rotateY'));
		    
		 if(isMove==='false') return;
		  rotateX=rotateX-changeY/3;
		  rotateY=rotateY+changeX/3;
		  $this.css(`transform`,`scale(0.4) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`).attr({
		  	rotateX:rotateX,
		  	rotateY:rotateY
		  });
		  
		
	};
	

	return{
		init:function(){
			$cubeBox.css('display','block');
			
			$box.attr({
				rotateX:-30,
				rotateY:45
			}).on({
			    touchstart:touchBegin,
			    touchmove:touching,
			    touchend:touchEnd
			});
			$box.find('li').tap(function(){
				$cubeBox.css('display','none');
				let index=$(this).index();
				detailRender.init(index);
				
			});
			
		}
	}
})(Zepto);

//cubeRender.init();

/*detail*/

let detailRender=(function(){
	
	let $detailBox=$('.detailBox'),
		$cubeBox=$('.cubeBox'),
		$return=$detailBox.find('.return'),
	    swipeExample=null;
	let $makisuBox=$('#makisuBox');
	
	let change=function(example){
		//example.activeIndex//当前活动块的索引
		//example.slides //数组，存储了当前所有活动块
		//example.slides[example.activeIndex] //当前活动块
		
		let{slides:slideAry,activeIndex}=example;
		
		//PAGE1单独处理
		if(activeIndex===0){
			$makisuBox.makisu({
				selector:'dd',
				overlap:0.6,
				speed:0.5
			   });
			 $makisuBox.makisu('open');
		   }else{
				$makisuBox.makisu({
					selector:'dd',
					overlap:0,
					speed:0
				});
				$makisuBox.makisu('close');
		}
		   
		//给当前活动块设置ID，其他块移除ID  slideAry是类数组
		[].forEach.call(slideAry,(item,index)=>{
			if(index===activeIndex){
				item.id='page'+(activeIndex+1);
				return;
			}
			item.id=null;
		})
		
	}

	
	return{
		init:function(index=0){
			$detailBox.css('display','block');
			
			
			//INIT SWIPER
			if(!swipeExample){
				
				$return.tap(()=>{
					$detailBox.css('display','none');
					$cubeBox.css('display','block');
				});
				
				//不存在实例的情况下我们初始化，如果已经初始化了，下一次直接运动到具体的位置即可，不需要重新的初始化
				swipeExample=new Swiper('.swiper-container',{
				//loop:true,//如果我们采用的切换效果是3D的，最好不要设置无缝衔接循环切换。在部分安卓机中，swiper的处理有一些bug
				effect:'coverflow',
				onInit:change,
				onTransitionEnd:change
			    });
			}

			index=index>5?5:index;
			swipeExample.slideTo(index,0); //运动到指定索引的slide位置，第二个参数是speed，我们设置零是让其立即运动到指定位置
			
		}
	}
})();

detailRender.init(1);

//loadingRender.init(); //从头开始运行

/*
 * 基于SWIPER首先每一个页面的动画
 * 1、滑到某一个页面的时候，给当前这个页面设置一个ID，例如：滑动到第二个页面，我们给其设置ID=PAGE2
 * 2、当滑出这个页面的时候，我们把之前设置的ID移除掉
 * 3、我们把当前页面中元素需要的动画效果全部写在指定的ID下
 * 
 * 细节处理
 *   1、我们是基于ANIMATE.CSS帧动画库完成的动画
 *   2、我们让需要运动的元素初始样式：OPACITY=0（开始是隐藏的）
 *   3、当设置ID让其运动的时候，我们自己在动画公式完成的时候，让其透明度为1
 * 
 */
