// 滑块拼图验证组件
 
import SliderCaptcha from 'rc-slider-captcha';
import React, { useRef } from 'react'; //引入React和useRef钩子
import { sleep } from 'ut2'; //引入sleep函数，用于模拟延迟
import createPuzzle from 'create-puzzle'; //引入生成拼图的库
import { RubyOutlined, MehOutlined, SmileOutlined, RedoOutlined, LoadingOutlined } from '@ant-design/icons' //引入antd的图标组件
import styles from "../css/resetPwd.module.css" //引入自定义样式文件
 
// 这里是你要自己准备的图片
import pic from '../assets/2.png'
// 定义滑块拼图验证组件
const SoildCaptcha = (params) => {
    const offsetXRef = useRef(0); // 用于存储拼图块的正确位置
    // 查看是否在安全距离
    const verifyCaptcha = async (data) => {
        await sleep(); //模拟网络延迟请求
        // 判断用户拖动的位置是否在正确位置5px偏移量内
        if (data.x >= offsetXRef.current - 5 && data.x < offsetXRef.current + 5) {
            // 延迟1秒后调用成功回调函数
            setTimeout(() => {
                params.onSuccess() //调用父组件传递的成功回调函数
            }, 1000)
            return Promise.resolve(); //验证成功
        }
        return Promise.reject(); //验证失败
    };
    return (
        <div className={styles.box1}>
            <SliderCaptcha
                request={() =>
                    createPuzzle(pic, {
                        format: 'blob' //指定输出格式为二进制数据流
                    }).then((res) => {
                        offsetXRef.current = res.x //保存拼图块的正确位置
                        return {
                        // 背景图片
                            bgUrl: res.bgUrl, //背景图地址
                            // 核验区域
                            puzzleUrl: res.puzzleUrl
                        };
                    })
                }
                onVerify={(data) => {
                    return verifyCaptcha(data);
                }}
                // ！！！！这里是重点！！！！！
                // bgSize必须和原图片的尺寸一样！！！！！！！！！！！！！！！！！！
                bgSize={{ width: 500, height: 315 }}
                tipIcon={{
                    default: <RubyOutlined />,
                    loading: <LoadingOutlined />,
                    success: <SmileOutlined />,
                    error: <MehOutlined />,
                    refresh: <RedoOutlined />
                }}
                tipText={{
                    default: '向右👉拖动完成拼图',
                    loading: '👩🏻‍💻🧑‍💻努力中...',
                    moving: '向右拖动至拼图位置',
                    verifying: '验证中...',
                    error: '验证失败',
                    success:'验证成功'
                }}
            />
        </div>
    );
}
 
export default SoildCaptcha;