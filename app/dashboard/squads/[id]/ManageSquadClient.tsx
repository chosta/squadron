'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SquadWithMembers, SquadInviteWithDetails, SquadRole } from '@/types/squad';
import type { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SquadMemberList } from '@/components/squads/SquadMemberList';
import { SquadRoleSelector } from '@/components/squads/SquadRoleSelector';
import { SquadRoleBadge } from '@/components/squads/SquadRoleBadge';
import { UserSearchInput } from '@/components/invites/UserSearchInput';
import { ChatRoom } from '@/components/chat';

interface ManageSquadClientProps {
  squad: SquadWithMembers;
  pendingInvites: SquadInviteWithDetails[];
  currentUserId: string;
  isCaptain: boolean;
}

export function ManageSquadClient({
  squad: initialSquad,
  pendingInvites: initialPendingInvites,
  currentUserId,
  isCaptain,
}: ManageSquadClientProps) {
  const router = useRouter();
  const [squad, setSquad] = useState(initialSquad);
  const [pendingInvites, setPendingInvites] = useState(initialPendingInvites);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteRole, setInviteRole] = useState<SquadRole>('DEGEN');
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleDismantleSquad = async () => {
    if (!confirm('Are you sure you want to dismantle this squad? This action cannot be undone.')) return;

    const response = await fetch(`/api/squads/${squad.id}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    if (result.success) {
      router.push('/dashboard/squads');
    } else {
      alert(result.error);
    }
  };

  const existingMemberIds = squad.members.map((m) => m.userId);
  const pendingInviteIds = pendingInvites.map((i) => i.inviteeId);
  const excludeUserIds = [...existingMemberIds, ...pendingInviteIds];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {squad.avatarUrl ? (
            <img
              src={squad.avatarUrl}
              alt={squad.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center">
              <span className="text-3xl text-primary-600">
                {squad.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{squad.name}</h1>
              {squad.isActive ? (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  Inactive
                </span>
              )}
            </div>
            {squad.description && (
              <p className="mt-1 text-gray-600">{squad.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
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

          {showInviteForm && isCaptain && (
            <Card>
              <CardHeader>
                <CardTitle>Invite New Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search User
                  </label>
                  <UserSearchInput
                    onSelect={setSelectedUser}
                    excludeUserIds={excludeUserIds}
                    placeholder="Search by name or username..."
                  />
                </div>

                {selectedUser && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {selectedUser.ethosAvatarUrl ? (
                      <img
                        src={selectedUser.ethosAvatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {(selectedUser.ethosDisplayName || selectedUser.ethosUsername || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {selectedUser.ethosDisplayName || selectedUser.ethosUsername}
                      </p>
                      {selectedUser.ethosScore !== null && (
                        <p className="text-sm text-gray-500">Score: {selectedUser.ethosScore}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proposed Role
                  </label>
                  <SquadRoleSelector value={inviteRole} onChange={setInviteRole} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Add a personal message to your invite..."
                    rows={2}
                    maxLength={200}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

        <div className="space-y-6">
          {/* Chat Room */}
          <div className="h-[700px] w-full">
            <ChatRoom
              squadId={squad.id}
              squadName={squad.name}
              isActive={squad.isActive}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Squad Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Size Limit</span>
                <span className="font-medium">
                  {squad.minSize}-{squad.maxSize} members
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fixed Size</span>
                <span className="font-medium">{squad.isFixedSize ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Captain</span>
                <span className="font-medium">
                  {squad.captain.ethosDisplayName || squad.captain.ethosUsername}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created by</span>
                <span className="font-medium">
                  {squad.creator.ethosDisplayName || squad.creator.ethosUsername}
                </span>
              </div>
            </CardContent>
          </Card>

          {isCaptain && pendingInvites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invites ({pendingInvites.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {invite.invitee.ethosAvatarUrl ? (
                      <img
                        src={invite.invitee.ethosAvatarUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-medium">
                          {(invite.invitee.ethosDisplayName || invite.invitee.ethosUsername || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {invite.invitee.ethosDisplayName || invite.invitee.ethosUsername}
                      </p>
                      <SquadRoleBadge role={invite.role} size="sm" />
                    </div>
                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="text-gray-400 hover:text-red-600"
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
    </div>
  );
}
