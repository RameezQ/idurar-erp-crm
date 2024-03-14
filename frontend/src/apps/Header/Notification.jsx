import { Avatar, Popover, Button, Flex } from 'antd';

// import Notifications from '@/components/Notification';

import { AppstoreOutlined, BellTwoTone } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';

import { useAppContext } from '@/context/appContext';
import NotificationList from './NotificationList';

export default function Notification() {
  const { state: stateApp, appContextAction } = useAppContext();
  const { app } = appContextAction;

  const translate = useLanguage();
  const Content = () => {
    return (
      <div
        className="pad20"
        style={{
          maxWidth: '220px',
          width: '100%',
          height: '400px',
        }}
      >
        <Flex gap="middle" vertical>
          {/* <NotificationList /> */}
        </Flex>
      </div>
    );
  };

  return (
    <Popover
      content={<Content />}
      trigger="click"
      placement="left"
      style={{
        marginRight: '20px',
      }}
    >
      <Avatar
        icon={<BellTwoTone />}
        style={{
          color: '#f56a00',
          backgroundColor: '#FFF',
          float: 'right',
          marginTop: '5px',
          cursor: 'pointer',
        }}
      />
    </Popover>
  );
}
