import { Button } from 'antd';
import React, { useState, useEffect } from 'react';
/****
 * 使用步骤：
 * 1.引入 import CountdownTimer from '@/components/CountdownTimer';
 * 
 * 
 * endTimerFinish = () => {
        console.log('倒计时结束！');
    }
    startTimerFinish = () => {
        console.log('倒计时开始');
    }
 * 2.使用<CountdownTimer startTimerFinish={this.startTimerFinish} endTimerFinish={this.endTimerFinish} initialSeconds={60} />
 * 
 * 参数说明： initialSeconds为倒计时开始时间    startTimerFinish开始的回调  endTimerFinish结束的回调
 */
const CountdownTimer = ({ initialSeconds, endTimerFinish, startTimerFinish }) => {
    const [seconds, setSeconds] = useState(null);
    useEffect(() => {
        const count = sessionStorage.getItem("countdown") || null;
        setSeconds(count);
    }, []);
    useEffect(() => {

        const interval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
                sessionStorage.setItem("countdown", seconds);
            } else {
                // 倒计时结束时调用父组件传入的回调函数
                if (endTimerFinish && seconds === 0) {
                    endTimerFinish();
                }
                sessionStorage.removeItem("countdown");
                clearInterval(interval);

            }
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds, endTimerFinish]);

    const setcountdown = () => {
        startTimerFinish()
        setSeconds(initialSeconds)
    }

    //组件卸载时重置倒计时

    useEffect(() => {
        return () => {
            setSeconds(null);
            sessionStorage.removeItem("countdown");
        };
    }, []);

    // 将秒数转换为分钟和秒钟
    //   const minutes = Math.floor(seconds / 60);
    //   const remainingSeconds = seconds % 60;

    return (
        <div>
            {/* <h1>倒计时</h1> */}
            {seconds > 0 ? (
                <Button style={{ color: "#ccc", fontSize: "14px" }}>{`${seconds}秒后重新发送`}</Button>
            ) : (<Button onClick={setcountdown}>发送验证码</Button>)}
        </div>
    );
};

export default CountdownTimer;
