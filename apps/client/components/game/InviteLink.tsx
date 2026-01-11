'use client';

import { useState } from 'react';
import { Copy, Check, Share2, Link } from 'lucide-react';

interface InviteLinkProps {
  inviteCode: string;
  inviteLink: string;
  gameId: number;
}

export default function InviteLink({ inviteCode, inviteLink, gameId }: InviteLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chess Game Invite',
          text: 'Join my chess game!',
          url: inviteLink,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Link className="w-4 h-4 text-green-400" />
        <h3 className="font-medium text-white">Invite Link</h3>
      </div>

      <p className="text-sm text-zinc-400 mb-3">
        Share this link with your friend to start the game
      </p>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 truncate">
          {inviteLink}
        </div>
        <button
          onClick={handleCopy}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          title="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-zinc-400" />
          )}
        </button>
        <button
          onClick={handleShare}
          className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          title="Share"
        >
          <Share2 className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Game ID: {gameId}</span>
        <span>Code: {inviteCode}</span>
      </div>
    </div>
  );
}


