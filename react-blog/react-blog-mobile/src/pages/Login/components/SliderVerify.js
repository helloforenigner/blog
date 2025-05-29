import React, { useRef, useState, useEffect } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './index.scss';

const Slider = (props) => {
    const { showSlider } = props;
    const leftRef = useRef();
    const rootRef = useRef();
    const rightRef = useRef();
    const centerRef = useRef();
    const [successText, setSuccessText] = useState('');
    const [textTitle, setTextTitle] = useState('请移动滑块至最右边');
    const [loading, setLoading] = useState(false);
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    const lashen = (event) => {
        // 阻止默认触摸行为，防止页面滚动
        event.preventDefault();
        const touchDownX = event.touches[0].clientX;
        const initialLeftWidth = leftRef.current.clientWidth;
        leftRef.current.style.backgroundColor = '#4BA7FE';
        rootRef.current.style.borderColor = '#4BA7FE';
        setSuccessText('');

        const handleTouchMove = (moveEvent) => {
            moveEvent.preventDefault();
            setTextTitle('');
            const touchMoveX = moveEvent.touches[0].clientX;
            const deltaX = touchMoveX - touchDownX;
            const newLeftWidth = initialLeftWidth + deltaX;
            const maxWidth = rootRef.current.offsetWidth - centerRef.current.offsetWidth - 2;

            // 边界检查，确保宽度不越界
            const clampedLeftWidth = Math.min(Math.max(newLeftWidth, 0), maxWidth);
            leftRef.current.style.width = `${clampedLeftWidth}px`;
            rightRef.current.style.width = `${maxWidth - clampedLeftWidth}px`;

            if (clampedLeftWidth >= maxWidth) {
                handleVerificationSuccess();
            }
        };

        const handleTouchEnd = () => {
            rootRef.current.removeEventListener('touchmove', handleTouchMove);
            rootRef.current.removeEventListener('touchend', handleTouchEnd);

            const maxWidth = rootRef.current.offsetWidth - centerRef.current.offsetWidth - 2;
            if (leftRef.current.offsetWidth < maxWidth) {
                handleVerificationFailure();
            }
        };

        const handleVerificationSuccess = () => {
            setLoading(true);
            leftRef.current.style.width = `${rootRef.current.offsetWidth - centerRef.current.offsetWidth - 2}px`;
            rightRef.current.style.width = '0px';
            leftRef.current.style.backgroundColor = '#76CD4B';
            rootRef.current.style.borderColor = '#76CD4B';
            setSuccessText('验证成功');
            props.resultClick(0);
            setTimeout(() => {
                setLoading(false);
            }, 500);
        };

        const handleVerificationFailure = () => {
            setLoading(true);
            leftRef.current.style.backgroundColor = '#F6535B';
            rootRef.current.style.borderColor = '#F6535B';
            props.resultClick(1);
            setTimeout(() => {
                rootRef.current.style.borderColor = '#d9d9d9';
                setTextTitle('请移动滑块至最右边');
                leftRef.current.style.width = '0px';
                rightRef.current.style.width = `${rootRef.current.offsetWidth - centerRef.current.offsetWidth - 2}px`;
                setLoading(false);
            }, 500);
        };

        rootRef.current.addEventListener('touchmove', handleTouchMove);
        rootRef.current.addEventListener('touchend', handleTouchEnd);
    };

    useEffect(() => {
        if (!showSlider) {
            setSuccessText('');
            setLoading(false);
            setTextTitle('请移动滑块至最右边');
        }
    }, [showSlider]);

    return (
        <div className="simple-wrap">
            <Spin indicator={antIcon} spinning={loading}>
                {showSlider ? (
                    <div ref={rootRef} className="simple-verify">
                        <div ref={leftRef} className="simple-left">
                            {successText}
                        </div>
                        <div onTouchStart={lashen} ref={centerRef} className="simple-slider">
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
};

export default Slider;