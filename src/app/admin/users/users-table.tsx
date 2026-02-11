'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Plus,
    Edit,
    Ban,
    UserCheck,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role?: string;
    banned?: boolean;
    banReason?: string;
    createdAt: string;
    updatedAt: string;
}

export function UsersTable() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const limit = 100;
    const totalPages = Math.ceil(totalUsers / limit);

    const fetchUsers = async (page = 0, search = "") => {
        try {
            setLoading(true);
            setError(null);

            const response = await authClient.admin.listUsers({
                query: {
                    limit: limit.toString(),
                    offset: (page * limit).toString(),
                    searchValue: search,
                    searchField: "email",
                    sortBy: "createdAt",
                    sortDirection: "desc",
                },
            });

            if (response.error) {
                throw new Error(response.error.message || "Failed to fetch users");
            }

            setUsers((response.data?.users as User[]) || []);
            setTotalUsers(response.data?.total || 0);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(0);
        fetchUsers(0, value);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchUsers(page, searchTerm);
    };

    const handleRowClick = (userId: string) => {
        router.push(`/admin/users/${userId}`);
    };

    const handleBanUser = async (e: React.MouseEvent, userId: string, ban: boolean) => {
        e.stopPropagation();
        try {
            setActionLoading(userId);

            if (ban) {
                const response = await authClient.admin.banUser({
                    userId,
                    banReason: "Banned by admin",
                    banExpiresIn: undefined,
                });

                if (response.error) {
                    throw new Error(response.error.message || "Failed to ban user");
                }
            } else {
                const response = await authClient.admin.unbanUser({
                    userId,
                });

                if (response.error) {
                    throw new Error(response.error.message || "Failed to unban user");
                }
            }

            await fetchUsers(currentPage, searchTerm);
        } catch (err) {
            console.error("Error updating user ban status:", err);
            setError(err instanceof Error ? err.message : "Failed to update user");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return;
        }

        try {
            setActionLoading(userId);

            const response = await authClient.admin.removeUser({
                userId,
            });

            if (response.error) {
                throw new Error(response.error.message || "Failed to delete user");
            }

            await fetchUsers(currentPage, searchTerm);
        } catch (err) {
            console.error("Error deleting user:", err);
            setError(err instanceof Error ? err.message : "Failed to delete user");
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by email..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8 w-64"
                        />
                    </div>
                </div>
                <Button asChild>
                    <Link href="/admin/users/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create User
                    </Link>
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="rounded-lg border bg-card">
                <div className="px-4 py-3 border-b">
                    <h2 className="text-lg font-semibold">Users ({totalUsers})</h2>
                    <p className="text-sm text-muted-foreground">
                        Click a row to edit. Use the buttons for quick actions.
                    </p>
                </div>
                {loading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="h-12 bg-muted/50 rounded animate-pulse"
                                style={{ width: i === 2 ? "70%" : "100%" }}
                            />
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No users found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50 text-left text-sm font-medium text-muted-foreground">
                                    <th className="h-10 px-4 py-2 font-medium">User</th>
                                    <th className="h-10 px-4 py-2 font-medium">Status</th>
                                    <th className="h-10 px-4 py-2 font-medium">Created</th>
                                    <th className="h-10 px-4 py-2 font-medium w-[1%] text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        onClick={() => handleRowClick(user.id)}
                                        className="border-b transition-colors hover:bg-muted/50 cursor-pointer last:border-b-0"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-sm font-medium">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                <Badge
                                                    variant={
                                                        user.emailVerified ? "default" : "secondary"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {user.emailVerified ? "Verified" : "Unverified"}
                                                </Badge>
                                                {user.banned && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Banned
                                                    </Badge>
                                                )}
                                                {user.role && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {user.role}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div
                                                className="flex items-center justify-end gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/users/${user.id}`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">
                                                        <p>Edit user</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="inline-flex">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                disabled={actionLoading === user.id}
                                                                onClick={(e) =>
                                                                    handleBanUser(e, user.id, !user.banned)
                                                                }
                                                            >
                                                                {actionLoading === user.id ? (
                                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                ) : user.banned ? (
                                                                    <UserCheck className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <Ban className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">
                                                        <p>{user.banned ? "Unban user" : "Ban user"}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="inline-flex">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                disabled={actionLoading === user.id}
                                                                onClick={(e) => handleDeleteUser(e, user.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">
                                                        <p>Delete user</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing {currentPage * limit + 1} to{" "}
                            {Math.min((currentPage + 1) * limit, totalUsers)} of {totalUsers} users
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
