import { Tag, Button, Typography } from 'antd';
import { FiClock, FiZap, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface ComingSoonCardProps {
  title: string;
  description: string;
  badge?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export const ComingSoonCard = ({
  title,
  description,
  badge = 'Coming Soon',
  icon: Icon = FiZap,
}: ComingSoonCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-1 items-center justify-center p-6">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-primary/40">
        {/* Ambient Gradient Glows */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Icon Container */}
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-inner">
            <Icon size={32} />
          </div>

          {/* Status Tag */}
          <Tag
            icon={<FiClock className="mr-1 inline" size={12} />}
            className="mb-4 rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            {badge}
          </Tag>

          {/* Title */}
          <Title
            level={3}
            className="m-0! mb-2! text-foreground!"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </Title>

          {/* Description */}
          <Paragraph className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {description}
          </Paragraph>

          {/* Action Button */}
          <div className="mt-6 flex items-center gap-3">
            <Button
              type="primary"
              className="flex items-center gap-2 rounded-lg bg-primary px-5 font-medium hover:bg-primary/90"
              onClick={() => navigate('/')}
            >
              <FiArrowLeft size={16} />
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
