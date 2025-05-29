import React, { useRef, useState, useEffect } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './index.scss'
const Slider = (props) => {
    const { showSlider } = props;
    // 显示隐藏
    const leftRef = useRef();
    const rootRef = useRef();
    const rightRef = useRef();
    const centerRef = useRef();
    const [successText, setSuccessText] = useState('');
    const [textTitle, setTextTitle] = useState('请移动滑块至最右边');
    const [loading, setLoading] = useState(false);
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
    const lashen = (events) => {
        var mouseDownX = events.clientX; // 左边位置
        var Wl = leftRef.current.clientWidth;//是 DOM 元素的属性，代表元素的内部宽度，包含内边距但不包含边框、外边距和滚动条。
        leftRef.current.style.backgroundColor = '#4BA7FE';
        rootRef.current.style.borderColor = '#4BA7FE';
        setSuccessText('');
        // 定义鼠标移动事件
        rootRef.current.onmousemove = (event) => {
            setTextTitle('');
            if (
                //offsetWidth 返回元素的宽度，包括边框（border）和内边距（padding），但不包含外边距（margin）
                rootRef.current.offsetWidth -
                leftRef.current.offsetWidth -
                centerRef.current.offsetWidth -
                2 <
                1
            ) {
                setLoading(true);
                leftRef.current.style.width = 263 + 'px';
                rightRef.current.style.width = 0;
                leftRef.current.style.backgroundColor = '#76CD4B';
                rootRef.current.style.borderColor = '#76CD4B';
                setSuccessText('验证成功');
                props.resultClick(0);
                setTimeout(() => {
                    setLoading(false);
                }, 500);
            } else {
                leftRef.current.style.width = event.clientX - mouseDownX + Wl + 'px';
                rightRef.current.style.width =
                    rootRef.current.offsetWidth -
                    leftRef.current.offsetWidth -
                    centerRef.current.offsetWidth -
                    2 +
                    'px';
            }
        };
        rootRef.current.onmouseup = () => {
            if (
                rootRef.current.offsetWidth -
                leftRef.current.offsetWidth -
                centerRef.current.offsetWidth -
                2 >
                0
            ) {
                setLoading(true);
                leftRef.current.style.backgroundColor = '#F6535B';
                rootRef.current.style.borderColor = '#F6535B';
                props.resultClick(1);
                setTimeout(() => {
                    rootRef.current.style.borderColor = '#d9d9d9';
                    setTextTitle('请移动滑块至最右边');
                    leftRef.current.style.width = 0;
                    rightRef.current.style.width = 263 + 'px';
                    setLoading(false);
                }, 500);
            }
            rootRef.current.onmousemove = null;
        };
    };

    useEffect(() => {
        if (!showSlider) {
            setSuccessText('');
            setLoading(false);
            setTextTitle('请移动滑块至最右边');
        }
    });
    return (
        <div className="simple-wrap">
            <Spin indicator={antIcon} spinning={loading}>
                {showSlider ? (
                    <div ref={rootRef} className="simple-verify">
                        <div ref={leftRef} className="simple-left">
                            {successText}
                        </div>
                        <div onMouseDown={lashen} ref={centerRef} className="simple-slider">
                            {'>>>'}
                        </div>
                        <div ref={rightRef} className="simple-right">
                            {textTitle}
                        </div>
                    </div>
                ) : null}
            </Spin>
        </div>
    );
}

export default Slider;