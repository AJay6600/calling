import { Card, Typography, Flex } from 'antd';
import { FiPhoneOutgoing } from 'react-icons/fi';
import { CallNowForm } from '../features/calls/CallNowForm';

const { Title, Paragraph } = Typography;

export const SingleCallPage = () => {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 0' }}>
      <Card>
        <Flex vertical gap="middle" style={{ width: '100%' }}>
          <Flex align="center" gap="small">
            <FiPhoneOutgoing style={{ fontSize: 24, color: '#1890ff' }} />
            <Title level={3} style={{ margin: 0 }}>
              Single Instant Call
            </Title>
          </Flex>
          <Paragraph type="secondary">
            Trigger an instant, Zitadel-authenticated AI call via Bolna to a specified contact number in E.164 format.
          </Paragraph>
          <CallNowForm />
        </Flex>
      </Card>
    </div>
  );
};

