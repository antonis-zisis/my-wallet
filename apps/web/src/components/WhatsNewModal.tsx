import { whatsNew, WhatsNewItem } from '../content/whatsNew';
import { formatDate } from '../utils/formatDate';
import { Modal } from './ui';

type WhatsNewModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type WhatsNewSectionProps = {
  heading: string;
  items: Array<WhatsNewItem>;
};

function WhatsNewSection({ heading, items }: WhatsNewSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-text-secondary mb-2 text-xs font-semibold tracking-wide uppercase">
        {heading}
      </h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.title}>
            <p className="text-text-primary text-sm font-medium">
              {item.title}
            </p>
            {item.description && (
              <p className="text-text-secondary text-sm">{item.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
  const release = whatsNew[0];

  if (!release) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="What's New">
      <div className="space-y-5">
        <div className="flex items-baseline gap-2">
          <span className="text-text-primary text-sm font-semibold">
            v{release.version}
          </span>
          <span className="text-text-tertiary text-xs">
            {formatDate(release.date)}
          </span>
        </div>

        <WhatsNewSection heading="New features" items={release.highlights} />

        {release.improvements && (
          <WhatsNewSection
            heading="Improvements"
            items={release.improvements}
          />
        )}
      </div>
    </Modal>
  );
}
