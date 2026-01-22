'use client';

import { useState, useMemo, useCallback } from 'react';
import type { SquadMemberWithUser, SquadRole } from '@/types/squad';
import { SquadRoleBadge } from './SquadRoleBadge';
import { SquadRoleSelector } from './SquadRoleSelector';
import { TipModal } from './TipModal';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { UserAvatarWithValidator } from '@/components/users/UserAvatarWithValidator';

interface SquadMemberListProps {
  members: SquadMemberWithUser[];
  captainId: string;
  currentUserId: string;
  isCaptain: boolean;
  onRoleChange?: (memberId: string, role: SquadRole) => Promise<void>;
  onRemoveMember?: (memberId: string) => Promise<void>;
  onTransferCaptaincy?: (newCaptainId: string) => Promise<void>;
}

export function SquadMemberList({
  members,
  captainId,
  currentUserId,
  isCaptain,
  onRoleChange,
  onRemoveMember,
  onTransferCaptaincy,
}: SquadMemberListProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [selectedMemberForTip, setSelectedMemberForTip] = useState<SquadMemberWithUser | null>(null);
  const [showToast, setShowToast] = useState(false);

  const openTipModal = (member: SquadMemberWithUser) => {
    setSelectedMemberForTip(member);
    setTipModalOpen(true);
  };

  const handleTipSent = useCallback(() => {
    setShowToast(true);
  }, []);

  const handleToastClose = useCallback(() => {
    setShowToast(false);
  }, []);

  // Sort members: captain first, then by reputation score (descending)
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      // Captain always first
      if (a.userId === captainId) return -1;
      if (b.userId === captainId) return 1;
      // Then by reputation score (descending)
      return (b.user.ethosScore || 0) - (a.user.ethosScore || 0);
    });
  }, [members, captainId]);

  const handleRoleChange = async (memberId: string, role: SquadRole) => {
    if (!onRoleChange) return;
    setLoading(memberId);
    try {
      await onRoleChange(memberId, role);
      setEditingMember(null);
    } catch (error) {
      console.error('Failed to change role:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!onRemoveMember) return;
    if (!confirm('Are you sure you want to remove this member?')) return;
    setLoading(memberId);
    try {
      await onRemoveMember(memberId);
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleTransfer = async (newCaptainId: string) => {
    if (!onTransferCaptaincy) return;
    if (!confirm('Are you sure you want to transfer captaincy? This action cannot be undone.')) return;
    setLoading(newCaptainId);
    try {
      await onTransferCaptaincy(newCaptainId);
    } catch (error) {
      console.error('Failed to transfer captaincy:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {sortedMembers.map((member) => {
        const isMemberCaptain = member.userId === captainId;
        const isCurrentUser = member.userId === currentUserId;
        const canEdit = isCaptain && !isCurrentUser;

        return (
          <div
            key={member.id}
            className="flex items-center gap-4 p-4 bg-space-700 rounded-lg"
          >
            <div className="flex-shrink-0">
              <UserAvatarWithValidator
                src={member.user.ethosAvatarUrl}
                name={member.user.ethosDisplayName || member.user.ethosUsername}
                size="md"
                ethosProfileId={member.user.ethosProfileId}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-hull-100 truncate">
                  {member.user.ethosDisplayName || member.user.ethosUsername || 'Unknown'}
                </span>
                {isMemberCaptain && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400">
                    Captain
                  </span>
                )}
                {isCurrentUser && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400">
                    You
                  </span>
                )}
              </div>
              {member.user.ethosScore !== null && (
                <p className="text-sm text-hull-400">
                  Ethos Score: {member.user.ethosScore}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Tip button - visible for all members except yourself */}
              {!isCurrentUser && (
                <button
                  onClick={() => openTipModal(member)}
                  className="p-1 text-hull-400 hover:text-primary-400 transition-colors"
                  title="Send tip"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
              {editingMember === member.id ? (
                <div className="flex items-center gap-2">
                  <SquadRoleSelector
                    value={member.role}
                    onChange={(role) => handleRoleChange(member.id, role)}
                    disabled={loading === member.id}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingMember(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <SquadRoleBadge role={member.role} />
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingMember(member.id)}
                        className="p-1 text-hull-400 hover:text-hull-200"
                        title="Edit role"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {!isMemberCaptain && (
                        <>
                          <button
                            onClick={() => handleTransfer(member.userId)}
                            disabled={loading === member.userId}
                            className="p-1 text-hull-400 hover:text-yellow-400"
                            title="Make captain"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemove(member.id)}
                            disabled={loading === member.id}
                            className="p-1 text-hull-400 hover:text-red-500"
                            title="Remove member"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Tip Modal */}
      {selectedMemberForTip && (
        <TipModal
          isOpen={tipModalOpen}
          onClose={() => {
            setTipModalOpen(false);
            setSelectedMemberForTip(null);
          }}
          member={selectedMemberForTip}
          onTip={handleTipSent}
        />
      )}

      {/* Success Toast */}
      <Toast
        message="Tip sent!"
        isVisible={showToast}
        onClose={handleToastClose}
      />
    </div>
  );
}
