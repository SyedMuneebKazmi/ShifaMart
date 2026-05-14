import clsx from 'clsx';
import { Bot, User, AlertTriangle, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const MessageList = ({ messages, onActionClick }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((msg, index) => (
        <div
          key={msg.id || index}
          className={clsx(
            'flex gap-3 max-w-[85%]',
            msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
          )}
        >
          {/* Avatar */}
          <div
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              msg.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-accent-100 text-accent-600'
            )}
          >
            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <div
              className={clsx(
                'p-3 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-tr-none'
                  : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none shadow-sm'
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>

            {/* Structured Actions (AI only) */}
            {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {msg.actions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => onActionClick(action)}
                    leftIcon={action.icon}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
            
            {/* Metadata/Timestamp */}
            <div className={clsx('text-xs text-neutral-400', msg.role === 'user' ? 'text-right' : '')}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
