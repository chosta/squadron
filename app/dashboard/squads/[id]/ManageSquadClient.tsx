'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SquadWithMembers, SquadInviteWithDetails, SquadRole } from '@/types/squad';
import type { User } from '@/types';
import type { OpenPositionWithApplications, CreatePositionInput } from '@/types/position';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SquadMemberList } from '@/components/squads/SquadMemberList';
import { SquadRoleSelector } from '@/components/squads/SquadRoleSelector';
import { SquadRoleBadge } from '@/components/squads/SquadRoleBadge';
import { SquadReputation } from '@/components/squads/SquadReputation';
import { UserSearchInput } from '@/components/invites/UserSearchInput';
import { ChatRoom } from '@/components/chat';
import { PositionList } from '@/components/positions/PositionList';
import { PositionForm } from '@/components/positions/PositionForm';

interface ManageSquadClientProps {
  squad: SquadWithMembers;
  pendingInvites: SquadInviteWithDetails[];
  positions: OpenPositionWithApplications[];
  currentUserId: string;
  isCaptain: boolean;
}

export function ManageSquadClient({
  squad: initialSquad,
  pendingInvites: initialPendingInvites,
  positions: initialPositions,
  currentUserId,
  isCaptain,
}: ManageSquadClientProps) {
  const router = useRouter();
  const [squad, setSquad] = useState(initialSquad);
  const [pendingInvites, setPendingInvites] = useState(initialPendingInvites);
  const [positions, setPositions] = useState(initialPositions);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [inviteRole, setInviteRole] = useState<SquadRole>('DEGEN');
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingPosition, setDeletingPosition] = useState<string | null>(null);
  const [processingApplication, setProcessingApplication] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [remainingAvatarAttempts, setRemainingAvatarAttempts] = useState(
    3 - (initialSquad.avatarRegenerationCount || 0)
  );
  const [showDismantleModal, setShowDismantleModal] = useState(false);

  // Calculate cumulative reputation
  const cumulativeReputation = useMemo(() => {
    return squad.members.reduce((sum, member) => sum + (member.user.ethosScore || 0), 0);
  }, [squad.members]);

  const handleRoleChange = async (memberId: string, role: SquadRole) => {
    const response = await fetch(`/api/squads/${squad.id}/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    const result = await response.json();
    if (result.success) {
      setSquad((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m.id === memberId ? { ...m, role } : m
        ),
      }));
    } else {
      throw new Error(result.error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const response = await fetch(`/api/squads/${squad.id}/members/${memberId}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    if (result.success) {
      setSquad((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== memberId),
      }));
    } else {
      throw new Error(result.error);
    }
  };

  const handleTransferCaptaincy = async (newCaptainId: string) => {
    const response = await fetch(`/api/squads/${squad.id}/captain`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newCaptainId }),
    });

    const result = await response.json();
    if (result.success) {
      router.refresh();
    } else {
      throw new Error(result.error);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/squads/${squad.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteeId: selectedUser.id,
          role: inviteRole,
          message: inviteMessage || undefined,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPendingInvites((prev) => [result.data, ...prev]);
        setShowInviteForm(false);
        setSelectedUser(null);
        setInviteMessage('');
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Failed to send invite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    const response = await fetch(`/api/invites/${inviteId}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    if (result.success) {
      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    }
  };

  const handleLeaveSquad = async () => {
    if (!confirm('Are you sure you want to leave this squad?')) return;

    const response = await fetch(`/api/squads/${squad.id}/leave`, {
      method: 'POST',
    });

    const result = await response.json();
    if (result.success) {
      router.push('/dashboard/squads');
    } else {
      alert(result.error);
    }
  };

  const handleDismantleSquad = () => {
    setShowDismantleModal(true);
  };

  const confirmDismantleSquad = async () => {
    const response = await fetch(`/api/squads/${squad.id}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    if (result.success) {
      router.push('/dashboard/squads');
    } else {
      alert(result.error);
      setShowDismantleModal(false);
    }
  };

  const handleGenerateAvatar = async () => {
    if (remainingAvatarAttempts <= 0) {
      setAvatarError('Avatar regeneration limit reached');
      return;
    }

    setIsGeneratingAvatar(true);
    setAvatarError(null);

    try {
      const response = await fetch(`/api/squads/${squad.id}/avatar/generate`, {
        method: 'POST',
      });

      const result = await response.json();
      if (result.success) {
        setSquad((prev) => ({
          ...prev,
          avatarUrl: result.data.avatarUrl,
        }));
        if (typeof result.remainingAttempts === 'number') {
          setRemainingAvatarAttempts(result.remainingAttempts);
        } else {
          setRemainingAvatarAttempts((prev) => prev - 1);
        }
      } else {
        setAvatarError(result.error || 'Failed to generate avatar');
        if (result.remainingAttempts === 0) {
          setRemainingAvatarAttempts(0);
        }
      }
    } catch (error) {
      console.error('Failed to generate avatar:', error);
      setAvatarError('Failed to generate avatar. Please try again.');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const existingMemberIds = squad.members.map((m) => m.userId);
  const pendingInviteIds = pendingInvites.map((i) => i.inviteeId);
  const excludeUserIds = [...existingMemberIds, ...pendingInviteIds];

  // Position handlers
  const handleCreatePosition = async (input: CreatePositionInput) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/squads/${squad.id}/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh positions to get the full data with applications
        const positionsRes = await fetch(`/api/squads/${squad.id}/positions`);
        const positionsData = await positionsRes.json();
        if (positionsData.success) {
          setPositions(positionsData.data);
        }
        setShowPositionForm(false);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Failed to create position:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePosition = async (positionId: string) => {
    if (!confirm('Are you sure you want to delete this position? All pending applications will be rejected.')) return;

    setDeletingPosition(positionId);
    try {
      const response = await fetch(`/api/positions/${positionId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        setPositions((prev) => prev.filter((p) => p.id !== positionId));
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Failed to delete position:', error);
    } finally {
      setDeletingPosition(null);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    setProcessingApplication(applicationId);
    try {
      const response = await fetch(`/api/applications/${applicationId}/approve`, {
        method: 'POST',
      });

      const result = await response.json();
      if (result.success) {
        // Refresh the page to get updated data
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Failed to approve application:', error);
    } finally {
      setProcessingApplication(null);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    setProcessingApplication(applicationId);
    try {
      const response = await fetch(`/api/applications/${applicationId}/reject`, {
        method: 'POST',
      });

      const result = await response.json();
      if (result.success) {
        // Update local state
        setPositions((prev) =>
          prev.map((p) => ({
            ...p,
            applications: p.applications.map((a) =>
              a.id === applicationId ? { ...a, status: 'REJECTED' as const, respondedAt: new Date().toISOString() } : a
            ),
          }))
        );
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Failed to reject application:', error);
    } finally {
      setProcessingApplication(null);
    }
  };

  const openPositionsCount = positions.filter((p) => p.isOpen && new Date(p.expiresAt) > new Date()).length;
  const freeSlots = squad.maxSize - squad.members.length;
  const canCreatePosition = isCaptain && openPositionsCount < freeSlots;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/squads"
        className="inline-flex items-center gap-1 text-sm text-hull-400 hover:text-hull-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to My Squads
      </Link>

      {/* Header */}
      <div className="flex items-start gap-6">
        {/* Large Avatar */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          {squad.avatarUrl ? (
            <img
              src={squad.avatarUrl}
              alt={squad.name}
              className="w-[220px] h-[165px] rounded-xl object-cover"
            />
          ) : (
            <div className="w-[220px] h-[165px] rounded-xl bg-primary-100 flex items-center justify-center">
              <span className="text-7xl text-primary-600">
                {squad.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {isCaptain && (
            <button
              onClick={handleGenerateAvatar}
              disabled={isGeneratingAvatar || remainingAvatarAttempts <= 0}
              className="text-xs text-primary-600 hover:text-primary-700 disabled:text-hull-500 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isGeneratingAvatar ? (
                <>
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : remainingAvatarAttempts <= 0 ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Limit reached
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {squad.avatarUrl ? 'Regenerate' : 'Generate Avatar'} ({remainingAvatarAttempts} left)
                </>
              )}
            </button>
          )}
        </div>

        {/* Name & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-hull-100">{squad.name}</h1>
            {cumulativeReputation > 0 && (
              <SquadReputation score={cumulativeReputation} size="md" />
            )}
          </div>
          {squad.description && (
            <p className="mt-2 text-sm text-hull-400 line-clamp-3">{squad.description}</p>
          )}
          {avatarError && (
            <p className="mt-1 text-sm text-red-600">{avatarError}</p>
          )}
        </div>

        {/* Squad Info - Rows */}
        <div className="flex-shrink-0 text-sm space-y-2 bg-space-700 rounded-lg px-4 py-3">
          <div className="flex justify-between gap-4">
            <span className="text-hull-400">Size</span>
            <span className="text-hull-200 font-medium">
              {squad.minSize}-{squad.maxSize} members
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-hull-400">Fixed</span>
            <span className="text-hull-200 font-medium">{squad.isFixedSize ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-hull-400">Captain</span>
            <span className="text-hull-200 font-medium truncate max-w-[150px]">
              {squad.captain.ethosDisplayName || squad.captain.ethosUsername}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-hull-400">Created by</span>
            <span className="text-hull-200 font-medium truncate max-w-[150px]">
              {squad.creator.ethosDisplayName || squad.creator.ethosUsername}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex flex-col gap-2">
          {!isCaptain && (
            <Button variant="secondary" onClick={handleLeaveSquad}>
              Leave Squad
            </Button>
          )}
          {isCaptain && (
            <Button variant="danger" onClick={handleDismantleSquad}>
              Dismantle
            </Button>
          )}
        </div>
      </div>

      {/* Two Column Layout - 50/50 with flexbox */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Members & Positions */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Members ({squad.members.length}/{squad.maxSize})</CardTitle>
                {isCaptain && squad.members.length < squad.maxSize && (
                  <Button size="sm" onClick={() => setShowInviteForm(true)}>
                    Invite Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <SquadMemberList
                members={squad.members}
                captainId={squad.captainId}
                currentUserId={currentUserId}
                isCaptain={isCaptain}
                onRoleChange={isCaptain ? handleRoleChange : undefined}
                onRemoveMember={isCaptain ? handleRemoveMember : undefined}
                onTransferCaptaincy={isCaptain ? handleTransferCaptaincy : undefined}
              />
            </CardContent>
          </Card>

          {/* Open Positions Section (Captain only) */}
          {isCaptain && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Open Positions ({openPositionsCount})</CardTitle>
                  {canCreatePosition && (
                    <Button size="sm" onClick={() => setShowPositionForm(true)}>
                      Add Position
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showPositionForm ? (
                  <PositionForm
                    onSubmit={handleCreatePosition}
                    onCancel={() => setShowPositionForm(false)}
                    isSubmitting={loading}
                  />
                ) : (
                  <PositionList
                    positions={positions}
                    onDelete={handleDeletePosition}
                    onApprove={handleApproveApplication}
                    onReject={handleRejectApplication}
                    isDeleting={deletingPosition ?? undefined}
                    isProcessing={processingApplication ?? undefined}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {showInviteForm && isCaptain && (
            <Card>
              <CardHeader>
                <CardTitle>Invite New Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-hull-300 mb-1">
                    Search User
                  </label>
                  <UserSearchInput
                    onSelect={setSelectedUser}
                    excludeUserIds={excludeUserIds}
                    placeholder="Search by name or username..."
                  />
                </div>

                {selectedUser && (
                  <div className="flex items-center gap-3 p-3 bg-space-700 rounded-lg">
                    {selectedUser.ethosAvatarUrl ? (
                      <img
                        src={selectedUser.ethosAvatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-space-600 flex items-center justify-center">
                        <span className="text-hull-300 font-medium">
                          {(selectedUser.ethosDisplayName || selectedUser.ethosUsername || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-hull-100">
                        {selectedUser.ethosDisplayName || selectedUser.ethosUsername}
                      </p>
                      {selectedUser.ethosScore !== null && (
                        <p className="text-sm text-hull-400">Score: {selectedUser.ethosScore}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-hull-400 hover:text-hull-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-hull-300 mb-1">
                    Proposed Role
                  </label>
                  <SquadRoleSelector value={inviteRole} onChange={setInviteRole} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-hull-300 mb-1">
                    Message (optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Add a personal message to your invite..."
                    rows={2}
                    maxLength={200}
                    className="block w-full px-3 py-2 border border-space-600 rounded-lg text-sm bg-space-700 text-hull-100 placeholder:text-hull-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSendInvite}
                    disabled={!selectedUser}
                    loading={loading}
                    className="flex-1"
                  >
                    Send Invite
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowInviteForm(false);
                      setSelectedUser(null);
                      setInviteMessage('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Chat */}
        <div className="flex-1 space-y-6">
          {/* Chat Room */}
          <div className="h-[700px]">
            <ChatRoom
              squadId={squad.id}
              squadName={squad.name}
              isActive={squad.isActive}
            />
          </div>

          {isCaptain && pendingInvites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invites ({pendingInvites.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center gap-3 p-3 bg-space-700 rounded-lg"
                  >
                    {invite.invitee.ethosAvatarUrl ? (
                      <img
                        src={invite.invitee.ethosAvatarUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-space-600 flex items-center justify-center">
                        <span className="text-hull-300 text-xs font-medium">
                          {(invite.invitee.ethosDisplayName || invite.invitee.ethosUsername || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-hull-100 truncate">
                        {invite.invitee.ethosDisplayName || invite.invitee.ethosUsername}
                      </p>
                      <SquadRoleBadge role={invite.role} size="sm" />
                    </div>
                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="text-hull-400 hover:text-red-600"
                      title="Cancel invite"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dismantle Confirmation Modal */}
      {showDismantleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDismantleModal(false)}
          />
          <div className="relative bg-space-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-hull-100">Dismantle Squad</h3>
            </div>
            <div className="mb-6">
              <p className="text-hull-400 mb-3">
                Are you sure you want to dismantle <span className="font-semibold">{squad.name}</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <p className="font-medium mb-1">This action cannot be undone:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>The squad will be permanently deleted</li>
                  <li>All members will be removed</li>
                  <li>Chat history will be lost</li>
                  <li>Open positions and pending invites will be cancelled</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDismantleModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDismantleSquad}
              >
                Dismantle Squad
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
