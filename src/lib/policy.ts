// Aturan izin murni (tanpa I/O) agar mudah diuji. Dipakai oleh server actions.
export type R = "FOUNDER" | "ADMIN" | "USER";
export const canChangeRole = (actor: R, target: R, newRole: string) => actor === "FOUNDER" && target !== "FOUNDER" && (newRole === "ADMIN" || newRole === "USER");
export const canSetStatus = (actor: R, target: R) => target !== "FOUNDER" && (actor === "FOUNDER" || (actor === "ADMIN" && target === "USER"));
export const canDeleteAccount = (actor: R, target: R) => actor === "FOUNDER" && target !== "FOUNDER";
export const canViewAuditLogs = (actor: R) => actor === "FOUNDER";
export const canViewUserList = (actor: R) => actor === "FOUNDER" || actor === "ADMIN";
export const canViewFinancialData = (actorId: string, ownerId: string) => actorId === ownerId; // tidak ada pengecualian role
