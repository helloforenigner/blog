import React, { useState, useEffect, useRef } from 'react';
import { useCallback } from 'react';
import resetSvg from "@/assets/refresh.svg";
import './index.scss';

const PuzzleVerification = ({
  canvasWidth = 350,
  canvasHeight = 200,
  show = false,
  puzzleScale = 1,
  sliderSize = 50,// 滑块的大小
  range = 10,//偏差值
  imgs = [],//背景图片
  successText = "验证通过！",
  failText = "验证失败，请重试",
  sliderText = "拖动滑块完成拼图验证",
  shoWData = false
}) => {
  // 验证是否成功的状态
  const [verSuccess, setVerSuccess] = useState(false);
  // 滑块是否显示的状态
  const [isShow, setIsShow] = useState(false);
  // 鼠标是否按下的状态
  const [mouseDown, setMouseDown] = useState(false);
  // 滑块起始宽度
  const [startWidth, setStartWidth] = useState(50);
  // 鼠标按下时的初始 X 坐标
  const [startX, setStartX] = useState(0);
  // 鼠标当前的 X 坐标
  const [newX, setNewX] = useState(0);
  // 拼图块的 X 坐标
  const [pinX, setPinX] = useState(0);
  // 拼图块的 Y 坐标
  const [pinY, setPinY] = useState(0);
  // 是否正在加载的状态
  const [loading, setLoading] = useState(false);
  // 是否可以滑动滑块的状态
  const [isCanSlide, setIsCanSlide] = useState(false);
  // 是否出错的状态
  const [error, setError] = useState(false);
  // 提示信息框是否显示的状态
  const [infoBoxShow, setInfoBoxShow] = useState(false);
  // 提示信息框中的文本内容
  const [infoText, setInfoText] = useState("");
  // 提示信息框是否显示失败状态的标志
  const [infoBoxFail, setInfoBoxFail] = useState(false);
  // 定时器引用
  const [timer1, setTimer1] = useState(null);
  // 关闭按钮是否按下的状态
  const [closeDown, setCloseDown] = useState(false);
  // 验证是否成功的状态
  const [isSuccess, setIsSuccess] = useState(false);
  // 当前使用的图片索引
  const [imgIndex, setImgIndex] = useState(-1);
  // 是否正在进行验证提交的状态
  const [isSubmting, setIsSubmting] = useState(false);

  // 主画布的引用
  const canvas1Ref = useRef(null);
  // 小画布的引用
  const canvas2Ref = useRef(null);
  // 成功后显示的完整图画布的引用
  const canvas3Ref = useRef(null);
  // 滑块轨道的引用
  const rangeSliderRef = useRef(null);







  useEffect(() => {
    // console.log('添加事件监听器');
    // const handleMouseMove = (e) => onRangeMouseMove(e);
    // const handleMouseUp = () => onRangeMouseUp();
    // const handleTouchMove = (e) => onRangeMouseMove(e);
    // const handleTouchEnd = () => onRangeMouseUp();

    // document.addEventListener("mousemove", handleMouseMove, { passive: false });
    // document.addEventListener("mouseup", handleMouseUp, { passive: false });
    // document.addEventListener("touchmove", handleTouchMove, { passive: false });
    // document.addEventListener("touchend", handleTouchEnd, { passive: false });

    // document.addEventListener("mousemove", onRangeMouseMove, { passive: false });
    // document.addEventListener("mouseup", onRangeMouseUp, { passive: false });
    // document.addEventListener("touchmove", onRangeMouseMove, { passive: false });
    // document.addEventListener("touchend", onRangeMouseUp, { passive: false });

    if (show) {
      document.body.classList.add("vue-puzzle-overflow");
      reset();
    }

    return () => {
      console.log('移除事件监听器');
      clearTimeout(timer1);
      // document.removeEventListener("mousemove", handleMouseMove, { passive: false });
      // document.removeEventListener("mouseup", handleMouseUp, { passive: false });
      // document.removeEventListener("touchmove", handleTouchMove, { passive: false });
      // document.removeEventListener("touchend", handleTouchEnd, { passive: false });

      // document.removeEventListener("mousemove", onRangeMouseMove, { passive: false });
      // document.removeEventListener("mouseup", onRangeMouseUp, { passive: false });
      // document.removeEventListener("touchmove", onRangeMouseMove, { passive: false });
      // document.removeEventListener("touchend", onRangeMouseUp, { passive: false });
      // document.body.classList.remove("vue-puzzle-overflow");
    };
  }, [show, timer1]);

  useEffect(() => {
    if (show) {
      document.body.classList.add("vue-puzzle-overflow");
      reset();
    } else {
      setIsSubmting(false);
      setIsSuccess(false);
      setInfoBoxShow(false);
      document.body.classList.remove("vue-puzzle-overflow");
    }
  }, [show]);
  // styleWidth是底部用户操作的滑块的父级，就是轨道在鼠标的作用下应该具有的宽度
  const styleWidth = () => {
    const w = startWidth + newX - startX;
    return w < sliderBaseSize()
      ? sliderBaseSize()
      : w > canvasWidth
        ? canvasWidth
        : w;
  };
  //返回拼图块的尺寸
  const puzzleBaseSize = () => {
    return Math.round(
      Math.max(Math.min(puzzleScale, 2), 0.2) * 52.5 + 6
    );
  };
  //返回滑块的尺寸，弄成整数，以免计算有偏差
  const sliderBaseSize = () => {
    return Math.max(
      Math.min(
        Math.round(sliderSize),
        Math.round(canvasWidth * 0.5)
      ),
      10
    );
  };

  const changeBtn = () => {
    setIsShow(true);
    console.log("显示了");
  };

  const onClose = () => {
    if (!mouseDown && !isSubmting) {
      clearTimeout(timer1);
    }
  };

  const onCloseMouseDown = () => {
    setCloseDown(true);
    setIsShow(false);
    init(true);
    console.log("全屏鼠标按下了");
    // 给父组件传一个状态
    // 这里假设父组件传递了一个 onSubmit 函数
    // props.onSubmit('F');
  };

  const onCloseMouseUp = () => {
    if (closeDown) {
      onClose();
    }
    setCloseDown(false);
    console.log("全屏鼠标松开了");
  };
  // 鼠标按下准备拖动
  const onRangeMouseDown = (e) => {
    if (isCanSlide) {
      console.log("鼠标按下了,可以滑动了");
      setMouseDown(true);
      console.log(mouseDown)
      //setStartWidth(rangeSliderRef.current.clientWidth);
      const clientX = e.clientX || e.changedTouches[0].clientX;
      setNewX(clientX);
      setStartX(clientX);
      rangeSliderRef.current.onmousemove = (e) => {
        const clientX = e.clientX || e.changedTouches[0].clientX;
        setNewX(clientX);
        //console.log(clientX);
        //rangeSliderRef.current.style.width = styleWidth() + "px";
      }

      rangeSliderRef.current.onmouseup = () => {
        setMouseDown(false);
        console.log("鼠标抬起了");
        submit();
      }

    }
  };

  // 鼠标移动
  const onRangeMouseMove = (e) => {
    console.log('mouseDown 的值为', mouseDown);
    console.log('isCanSlide 的值为', isCanSlide);
    if (mouseDown) {
      const clientX = e.clientX || e.changedTouches[0].clientX;
      setNewX(clientX);
      //rangeSliderRef.current.style.width = styleWidth() + "px";
      console.log("鼠标移动了");
    }
  };

  // 鼠标抬起
  const onRangeMouseUp = () => {
    if (mouseDown) {
      setMouseDown(false);
      submit();
      console.log("鼠标抬起了");
    }
  };



  /**
     * 开始进行
     * @param withCanvas 是否强制使用canvas随机作图
     */
  const init = (withCanvas) => {
    // 防止重复加载导致的渲染错误
    if (loading && !withCanvas) {
      return;
    }
    setLoading(true);
    setIsCanSlide(false);

    const c = canvas1Ref.current;//有缺块的主画布
    const c2 = canvas2Ref.current;//左侧小画布
    const c3 = canvas3Ref.current;//成功后显示的完整图
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const ctx2 = c2.getContext("2d", { willReadFrequently: true });
    const ctx3 = c3.getContext("2d", { willReadFrequently: true });
    const isFirefox = navigator.userAgent.indexOf("Firefox") >= 0 && navigator.userAgent.indexOf("Windows") >= 0;
    const img = new Image();
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx3.fillStyle = "rgba(255,255,255,1)";
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx2.clearRect(0, 0, canvasWidth, canvasHeight);
    // 取一个随机坐标，作为拼图块的位置
    const pinXValue = getRandom(puzzleBaseSize(), canvasWidth - puzzleBaseSize() - 20);//随机生成拼图块的X坐标
    const pinYValue = getRandom(20, canvasHeight - puzzleBaseSize() - 20);//随机生成拼图块的Y坐标
    setPinX(pinXValue);
    setPinY(pinYValue);

    img.crossOrigin = "anonymous";
    img.onload = () => {
      const [x, y, w, h] = makeImgSize(img);
      ctx.save();
      // 先画小图
      paintBrick(ctx);
      ctx.closePath();
      if (!isFirefox) {
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.clip();
      } else {
        ctx.clip();
        ctx.save();
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.restore();
      }

      ctx.drawImage(img, x, y, w, h);
      ctx3.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx3.drawImage(img, x, y, w, h);
      // 设置小图的内阴影
      ctx.globalCompositeOperation = "source-atop";
      paintBrick(ctx);
      ctx.arc(
        pinXValue + Math.ceil(puzzleBaseSize() / 2),
        pinYValue + Math.ceil(puzzleBaseSize() / 2),
        puzzleBaseSize() * 1.2,
        0,
        Math.PI * 2,
        true
      );
      ctx.closePath();
      ctx.shadowColor = "rgba(255, 255, 255, .8)";
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur = Math.min(Math.ceil(8 * puzzleScale), 12);
      ctx.fillStyle = "#ffffaa";
      ctx.fill();
      // 将小图赋值给ctx2
      const imgData = ctx.getImageData(
        pinXValue - 3,
        pinYValue - 20,
        pinXValue + puzzleBaseSize() + 5,
        pinYValue + puzzleBaseSize() + 5
      );
      ctx2.putImageData(imgData, 0, pinYValue - 20);
      // 清理
      ctx.restore();
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      // 画缺口
      ctx.save();
      paintBrick(ctx);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
      // 画缺口的内阴影
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      paintBrick(ctx);
      ctx.arc(
        pinXValue + Math.ceil(puzzleBaseSize() / 2),
        pinYValue + Math.ceil(puzzleBaseSize() / 2),
        puzzleBaseSize() * 1.2,
        0,
        Math.PI * 2,
        true
      );
      ctx.shadowColor = "#ffffff";
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.restore();
      // 画整体背景图
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.drawImage(img, x, y, w, h);
      ctx.restore();

      setLoading(false);
      setIsCanSlide(true);
      console.log("图片加载完成");
    };
    img.onerror = () => {
      init(true);// 如果图片加载错误就重新来，并强制用canvas随机作图
    };
    //根据条件选择图片源
    if (!withCanvas && imgs.length) {
      let randomNum = getRandom(0, imgs.length - 1);
      if (randomNum === imgIndex) {
        if (randomNum === imgs.length - 1) {
          randomNum = 0;
        } else {
          randomNum++;
        }
      }
      setImgIndex(randomNum);
      img.src = imgs[randomNum];
    } else {
      img.src = makeImgWithCanvas();
    }
  };
  //  范围随机数生成器
  const getRandom = (min, max) => {
    return Math.ceil(Math.random() * (max - min) + min);
  };
  //确保图片在画布上的显示效果最佳
  const makeImgSize = (img) => {
    const imgScale = img.width / img.height;
    const canvasScale = canvasWidth / canvasHeight;
    let x = 0, y = 0, w = 0, h = 0;
    if (imgScale > canvasScale) {
      h = canvasHeight;
      w = imgScale * h;
      y = 0;
      x = (canvasWidth - w) / 2;
    } else {
      w = canvasWidth;
      h = w / imgScale;
      x = 0;
      y = (canvasHeight - h) / 2;
    }
    return [x, y, w, h];
  };
  //在画布上绘制出一个不规则的拼图块路径
  const paintBrick = (ctx) => {
    const moveL = Math.ceil(15 * puzzleScale);
    ctx.beginPath();
    ctx.moveTo(pinX, pinY);
    ctx.lineTo(pinX + moveL, pinY);
    ctx.arcTo(
      pinX + moveL,
      pinY - moveL / 2,
      pinX + moveL + moveL / 2,
      pinY - moveL / 2,
      moveL / 2
    );
    ctx.arcTo(
      pinX + moveL + moveL,
      pinY - moveL / 2,
      pinX + moveL + moveL,
      pinY,
      moveL / 2
    );
    ctx.lineTo(pinX + moveL + moveL + moveL, pinY);
    ctx.lineTo(pinX + moveL + moveL + moveL, pinY + moveL);
    ctx.arcTo(
      pinX + moveL + moveL + moveL + moveL / 2,
      pinY + moveL,
      pinX + moveL + moveL + moveL + moveL / 2,
      pinY + moveL + moveL / 2,
      moveL / 2
    );
    ctx.arcTo(
      pinX + moveL + moveL + moveL + moveL / 2,
      pinY + moveL + moveL,
      pinX + moveL + moveL + moveL,
      pinY + moveL + moveL,
      moveL / 2
    );
    ctx.lineTo(
      pinX + moveL + moveL + moveL,
      pinY + moveL + moveL + moveL
    );
    ctx.lineTo(pinX, pinY + moveL + moveL + moveL);
    ctx.lineTo(pinX, pinY + moveL + moveL);

    ctx.arcTo(
      pinX + moveL / 2,
      pinY + moveL + moveL,
      pinX + moveL / 2,
      pinY + moveL + moveL / 2,
      moveL / 2
    );
    ctx.arcTo(
      pinX + moveL / 2,
      pinY + moveL,
      pinX,
      pinY + moveL,
      moveL / 2
    );
    ctx.lineTo(pinX, pinY);
  };
  //随机绘制图片
  const makeImgWithCanvas = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillStyle = `rgb(${getRandom(100, 255)}, ${getRandom(100, 255)}, ${getRandom(100, 255)})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = `rgb(${getRandom(100, 255)}, ${getRandom(100, 255)}, ${getRandom(100, 255)})`;
      ctx.strokeStyle = `rgb(${getRandom(100, 255)}, ${getRandom(100, 255)}, ${getRandom(100, 255)})`;

      if (getRandom(0, 2) > 1) {
        ctx.save();
        ctx.rotate((getRandom(-90, 90) * Math.PI) / 180);
        ctx.fillRect(
          getRandom(-20, canvas.width - 20),
          getRandom(-20, canvas.height - 20),
          getRandom(10, canvas.width / 2 + 10),
          getRandom(10, canvas.height / 2 + 10)
        );
        ctx.restore();
      } else {
        ctx.beginPath();
        const ran = getRandom(-Math.PI, Math.PI);
        ctx.arc(
          getRandom(0, canvas.width),
          getRandom(0, canvas.height),
          getRandom(10, canvas.height / 2 + 10),
          ran,
          ran + Math.PI * 1.5
        );
        ctx.closePath();
        ctx.fill();
      }
    }
    return canvas.toDataURL("image/png");
  };
  //开始判定
  const submit = () => {
    setIsSubmting(true);
    const x = Math.abs(
      pinX -
      (styleWidth() - sliderBaseSize()) +
      (puzzleBaseSize() - sliderBaseSize()) *
      ((styleWidth() - sliderBaseSize()) /
        (canvasWidth - sliderBaseSize())) -
      3
    );
    if (x < range) {
      // 成功
      setInfoText(successText);
      setInfoBoxFail(false);
      setInfoBoxShow(true);
      setIsCanSlide(false);
      setIsSuccess(false);
      clearTimeout(timer1);
      // 成功后准备关闭
      const newTimer = setTimeout(() => {
        setIsSubmting(false);
        setIsShow(false);
        setVerSuccess(true);
        // 给父组件传状态
        // props.onSubmit('F', verSuccess);
        reset();
      }, 800);
      setTimer1(newTimer);
    } else {
      // 失败
      setInfoText(failText);
      setInfoBoxFail(true);
      setInfoBoxShow(true);
      setIsCanSlide(false);
      clearTimeout(timer1);
      // 失败的回调
      const newTimer = setTimeout(() => {
        setIsSubmting(false);
        reset();
      }, 800);
      setTimer1(newTimer);
    }
  };
  // 重置 - 重新设置初始状态
  const resetState = () => {
    setInfoBoxFail(false);
    setInfoBoxShow(false);
    setIsCanSlide(false);
    setIsSuccess(false);
    setStartWidth(sliderBaseSize());
    setStartX(0);
    setNewX(0);
  };
  // 重置
  const reset = () => {
    // if (isSubmting) {
    //   debugger;
    //   return;
    // }
    console.log("重置状态")
    resetState();
    init();
  };


  return (
    <div>
      <div onClick={changeBtn} className="btn">开始验证</div>
      <div></div>
      {/* 本体部分 */}
      <div style={{ display: shoWData ? 'block' : 'none' }} className={`vue-puzzle-vcode ${show ? 'show_' : ''}`}
        onMouseDown={onCloseMouseDown} onMouseUp={onCloseMouseUp}
        onTouchStart={onCloseMouseDown} onTouchEnd={onCloseMouseUp}>
        <div className="vue-auth-box_" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
          <div className="auth-body_" style={{ height: `${canvasHeight}px` }}>
            {/* 主图，有缺口 */}
            <canvas
              style={{
                borderRadius: '10px',
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`
              }}
              ref={canvas1Ref}
              width={canvasWidth}
              height={canvasHeight}
            />
            {/* 成功后显示的完整图 */}
            <canvas ref={canvas3Ref} className={`auth-canvas3_ ${isSuccess ? 'show' : ''}`} width={canvasWidth}
              height={canvasHeight} style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }} />
            {/* 小图 */}
            <canvas width={puzzleBaseSize()} className="auth-canvas2_" height={canvasHeight} ref={canvas2Ref}
              style={{
                width: `${puzzleBaseSize()}px`,
                height: `${canvasHeight}px`,
                transform: `translateX(${styleWidth() -
                  sliderBaseSize() -
                  (puzzleBaseSize() - sliderBaseSize()) *
                  ((styleWidth() - sliderBaseSize()) /
                    (canvasWidth - sliderBaseSize()))}px)`
              }} />

            <div className={`info-box_ ${infoBoxShow ? 'show' : ''} ${infoBoxFail ? 'fail' : ''}`}>
              {infoText}
            </div>
            <div className={`flash_ ${!isSuccess ? 'show' : ''}`}
              style={{
                transform: `translateX(${isSuccess
                  ? `${canvasWidth + canvasHeight * 0.578}px`
                  : `-${canvasHeight * 0.578}px`
                  }) skew(-30deg, 0);`
              }}></div>
            <img className="reset_" onClick={reset} src={resetSvg} />
          </div>
          <div className="auth-control_">
            <div className="range-box" style={{ height: `${sliderBaseSize()}px` }}>
              <div className="range-text">{sliderText}</div>
              <div className="range-slider" ref={rangeSliderRef} style={{ width: `${styleWidth()}px` }}>
                <div className={`range-btn ${mouseDown ? 'isDown' : ''}`} style={{ width: `${sliderBaseSize()}px` }}
                  onMouseDown={onRangeMouseDown} onTouchStart={onRangeMouseDown}>
                  {/* 按钮内部样式 */}
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleVerification;