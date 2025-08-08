import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLogout } from "@/hooks/use-logout";
import { Loader2, ShieldCheck, Users, CheckCircle2, XCircle, LogOut, FileText, UserPlus, Edit, Trash2 } from "lucide-react";
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";

type AppRole = "super_admin" | "admin" | "mentor" | "candidate";

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: AppRole;
}

interface OnboardingRequest {
  id: string;
  user_id: string;
  data: any;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  type?: "mentor" | "candidate"; // Added for unified view
}

const roleColors: Record<AppRole, "secondary" | "default" | "destructive" | "outline" | "" | "" | any> = {
  super_admin: "destructive",
  admin: "secondary",
  mentor: "default",
  candidate: "outline",
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { logout } = useLogout();
  
  // Dialog states
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Auth + role gate
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }
      // Defer further supabase calls to avoid deadlocks
      setTimeout(async () => {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        if (error) {
          setIsAuthorized(false);
        } else {
          setIsAuthorized((data || []).some((r) => r.role === "super_admin"));
        }
        setCheckingAuth(false);
      }, 0);
    });

    // Initial session check
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setIsAuthorized(false);
        setCheckingAuth(false);
        return;
      }
      try {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        setIsAuthorized((roles || []).some((r) => r.role === "super_admin"));
      } catch {
        setIsAuthorized(false);
      } finally {
        setCheckingAuth(false);
      }
    })();

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.title = "Admin Dashboard | User Management & Onboarding";
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = `${window.location.origin}/admin`;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Data queries
  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,display_name,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
    enabled: isAuthorized,
  });

  const rolesQuery = useQuery({
    queryKey: ["user_roles"],
    queryFn: async (): Promise<UserRole[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id,role");
      if (error) throw error;
      return data as UserRole[];
    },
    enabled: isAuthorized,
  });

  const mentorReqsQuery = useQuery({
    queryKey: ["mentor_requests", "pending"],
    queryFn: async (): Promise<OnboardingRequest[]> => {
      const { data, error } = await supabase
        .from("mentor_onboarding_requests")
        .select("id,user_id,data,status,created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as OnboardingRequest[];
    },
    enabled: isAuthorized,
  });

  const candidateReqsQuery = useQuery({
    queryKey: ["candidate_requests", "pending"],
    queryFn: async (): Promise<OnboardingRequest[]> => {
      const { data, error } = await supabase
        .from("candidate_onboarding_requests")
        .select("id,user_id,data,status,created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as OnboardingRequest[];
    },
    enabled: isAuthorized,
  });

  // New query for all onboarding requests (both mentor and candidate)
  const allOnboardingReqsQuery = useQuery({
    queryKey: ["all_onboarding_requests"],
    queryFn: async (): Promise<OnboardingRequest[]> => {
      const [mentorRes, candidateRes] = await Promise.all([
        supabase
          .from("mentor_onboarding_requests")
          .select("id,user_id,data,status,created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("candidate_onboarding_requests")
          .select("id,user_id,data,status,created_at")
          .order("created_at", { ascending: false }),
      ]);

      if (mentorRes.error) throw mentorRes.error;
      if (candidateRes.error) throw candidateRes.error;

      const mentorRequests = (mentorRes.data || []).map(req => ({ ...req, type: "mentor" as const }));
      const candidateRequests = (candidateRes.data || []).map(req => ({ ...req, type: "candidate" as const }));

      // Combine and sort by creation date
      return [...mentorRequests, ...candidateRequests].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: isAuthorized,
  });

  const rolesByUser = useMemo(() => {
    const map = new Map<string, AppRole[]>();
    (rolesQuery.data || []).forEach(({ user_id, role }) => {
      const arr = map.get(user_id) ?? [];
      if (!arr.includes(role)) arr.push(role);
      map.set(user_id, arr);
    });
    return map;
  }, [rolesQuery.data]);

  const profilesById = useMemo(() => {
    const map = new Map<string, Profile>();
    (profilesQuery.data || []).forEach((p) => map.set(p.id, p));
    return map;
  }, [profilesQuery.data]);

  // Actions
  const assignRole = async (uid: string, role: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: uid, role })
      .select()
      .single();
    if (error) {
      toast({ title: "Failed to assign role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role assigned", description: `${role} added` });
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
    }
  };

  const removeRole = async (uid: string, role: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", uid)
      .eq("role", role);
    if (error) {
      toast({ title: "Failed to remove role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role removed", description: `${role} removed` });
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
    }
  };

  const decideRequest = async (
    type: "mentor" | "candidate",
    id: string,
    decision: "approved" | "rejected"
  ) => {
    const table = type === "mentor" ? "mentor_onboarding_requests" : "candidate_onboarding_requests";
    const { error } = await supabase
      .from(table)
      .update({ status: decision })
      .eq("id", id);
    if (error) {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Request ${decision}` });
      queryClient.invalidateQueries({ queryKey: [type === "mentor" ? "mentor_requests" : "candidate_requests", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["all_onboarding_requests"] });
    }
  };

  // User management actions
  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setEditUserDialogOpen(true);
  };

  const handleDeleteUser = (user: Profile) => {
    setSelectedUser(user);
    setDeleteUserDialogOpen(true);
  };

  if (checkingAuth) {
    return (
      <main className="container py-10">
        <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Checking access…</div>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="container py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldCheck className="h-5 w-5"/>
              Access denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You must be a Super Admin to view this page.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and approve onboarding requests.</p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </header>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2"><Users className="h-4 w-4"/> Users</TabsTrigger>
          <TabsTrigger value="all-requests" className="flex items-center gap-2"><FileText className="h-4 w-4"/> All Requests</TabsTrigger>
          <TabsTrigger value="mentor">Mentor Requests</TabsTrigger>
          <TabsTrigger value="candidate">Candidate Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>User Management</CardTitle>
              <Button onClick={() => setAddUserDialogOpen(true)} className="ml-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[400px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(profilesQuery.data || []).map((p) => {
                      const roles = rolesByUser.get(p.id) || [];
                      const available: AppRole[] = ["admin","mentor","candidate"]; // super_admin managed manually
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.email}</TableCell>
                          <TableCell>{p.display_name || "—"}</TableCell>
                          <TableCell className="space-x-2">
                            {roles.length === 0 && <span className="text-muted-foreground">No roles</span>}
                            {roles.map((r) => (
                              <Badge key={r} variant={roleColors[r]}>{r}</Badge>
                            ))}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="space-x-2">
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleEditUser(p)}
                                className="h-8"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              {p.id !== userId && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDeleteUser(p)}
                                  className="h-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {available.map((r) => (
                                  roles.includes(r) ? (
                                    <Button key={r} size="sm" variant="outline" onClick={() => removeRole(p.id, r)} className="h-8 text-xs">
                                      Remove {r}
                                    </Button>
                                  ) : (
                                    <Button key={r} size="sm" onClick={() => assignRole(p.id, r)} className="h-8 text-xs">
                                      Make {r}
                                    </Button>
                                  )
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Onboarding Requests</CardTitle>
              <p className="text-sm text-muted-foreground">
                All registration onboarding requests from mentors and candidates
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-[220px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(allOnboardingReqsQuery.data || []).map((req) => {
                      const prof = profilesById.get(req.user_id);
                      const statusColor = req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary";
                      return (
                        <TableRow key={`${req.type}-${req.id}`}>
                          <TableCell>
                            <Badge variant={req.type === "mentor" ? "default" : "outline"}>
                              {req.type === "mentor" ? "Mentor" : "Candidate"}
                            </Badge>
                          </TableCell>
                          <TableCell>{prof?.email || req.user_id}</TableCell>
                          <TableCell>
                            <Badge variant={statusColor}>{req.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <pre className="text-xs text-muted-foreground max-w-md whitespace-pre-wrap break-words">
                              {JSON.stringify(req.data, null, 2)}
                            </pre>
                          </TableCell>
                          <TableCell className="space-x-2">
                            {req.status === "pending" && (
                              <>
                                <Button size="sm" onClick={() => decideRequest(req.type!, req.id, "approved")}>
                                  <CheckCircle2 className="h-4 w-4 mr-1"/> Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => decideRequest(req.type!, req.id, "rejected")}>
                                  <XCircle className="h-4 w-4 mr-1"/> Reject
                                </Button>
                              </>
                            )}
                            {req.status !== "pending" && (
                              <span className="text-sm text-muted-foreground">
                                {req.status === "approved" ? "Approved" : "Rejected"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentor" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Onboarding Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-[220px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(mentorReqsQuery.data || []).map((req) => {
                      const prof = profilesById.get(req.user_id);
                      return (
                        <TableRow key={req.id}>
                          <TableCell>{prof?.email || req.user_id}</TableCell>
                          <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <pre className="text-xs text-muted-foreground max-w-md whitespace-pre-wrap break-words">{JSON.stringify(req.data, null, 2)}</pre>
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button size="sm" onClick={() => decideRequest("mentor", req.id, "approved")}>
                              <CheckCircle2 className="h-4 w-4 mr-1"/> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => decideRequest("mentor", req.id, "rejected")}>
                              <XCircle className="h-4 w-4 mr-1"/> Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Onboarding Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-[220px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(candidateReqsQuery.data || []).map((req) => {
                      const prof = profilesById.get(req.user_id);
                      return (
                        <TableRow key={req.id}>
                          <TableCell>{prof?.email || req.user_id}</TableCell>
                          <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <pre className="text-xs text-muted-foreground max-w-md whitespace-pre-wrap break-words">{JSON.stringify(req.data, null, 2)}</pre>
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button size="sm" onClick={() => decideRequest("candidate", req.id, "approved")}>
                              <CheckCircle2 className="h-4 w-4 mr-1"/> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => decideRequest("candidate", req.id, "rejected")}>
                              <XCircle className="h-4 w-4 mr-1"/> Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Management Dialogs */}
      <AddUserDialog 
        open={addUserDialogOpen} 
        onOpenChange={setAddUserDialogOpen} 
      />
      
      <EditUserDialog 
        open={editUserDialogOpen} 
        onOpenChange={setEditUserDialogOpen}
        user={selectedUser}
      />
      
      <DeleteUserDialog 
        open={deleteUserDialogOpen} 
        onOpenChange={setDeleteUserDialogOpen}
        user={selectedUser}
      />
    </main>
  );
}
