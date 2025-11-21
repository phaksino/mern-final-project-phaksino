import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon
} from 'react-share';
import { Share2, Link, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SocialShare = ({ event, buttonStyle = "icon", onClose }) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/events/${event.id}`
    : '';

  const shareTitle = `Check out "${event.title}" on Lesotho Events Calendar`;
  const shareHashtags = ['LesothoEvents', 'EventsInLesotho'];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Event link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareButtons = (
    <div className="flex items-center space-x-2">
      <FacebookShareButton url={shareUrl} quote={shareTitle}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>

      <TwitterShareButton url={shareUrl} title={shareTitle} hashtags={shareHashtags}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>

      <WhatsappShareButton url={shareUrl} title={shareTitle}>
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>

      <EmailShareButton url={shareUrl} subject={shareTitle} body={`Check out this event: ${shareTitle}`}>
        <EmailIcon size={32} round />
      </EmailShareButton>

      <button
        onClick={copyToClipboard}
        className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        title="Copy link"
      >
        {copied ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <Link className="h-4 w-4 text-gray-600" />
        )}
      </button>
    </div>
  );

  if (buttonStyle === "icon") {
    return (
      <div className="relative group">
        <button className="text-gray-500 hover:text-lesotho-blue transition-colors">
          <Share2 className="h-5 w-5" />
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <p className="text-sm font-medium text-gray-900 mb-2">Share this event</p>
          {shareButtons}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Share this event</h4>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>
      {shareButtons}
    </div>
  );
};

export default SocialShare;