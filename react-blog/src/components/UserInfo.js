import { Modal, Descriptions } from "antd";

const UserInfo = (props) => {
    const { open, onCancel, items } = props;
    return (
        <Modal
            title="用户详情"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={{
                xs: '80%',
                sm: '80%',
                md: '70%',
                lg: '60%',
                xl: '50%',
                xxl: '40%',
            }}>
            <Descriptions bordered items={items} />
        </Modal>
    )
}
export default UserInfo;