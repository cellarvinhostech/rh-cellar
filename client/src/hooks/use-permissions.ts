import { useAuth } from "@/components/auth/AuthProvider";
import type { UserRole } from "@/types/auth";

export type { UserRole };

export interface Permission {
    resource: string;
    actions: string[];
}

export interface Permissions {
    canViewSettings: boolean;
    canManageUsers: boolean;
    canManageForms: boolean;
    canManageEvaluations: boolean;
    canViewEmployees: boolean;
    canEditEmployees: boolean;
    canViewOwnEvaluations: boolean;
    canViewDashboard: boolean;
    canViewFeed: boolean;
    canManageDepartments: boolean;
    canManagePositions: boolean;
    canManageHierarchy: boolean;
    canManageDirectorates: boolean;
    canManageShifts: boolean;
    canManageUnits: boolean;
}

export function usePermissions(): {
    permissions: Permissions;
    userRole: UserRole | null;
    isAdmin: boolean;
    isUser: boolean;
    hasPermission: (resource: string, action: string) => boolean;
} {
    const { authState } = useAuth();

    const userRole = authState.user?.role as UserRole | null;
    const isAdmin = userRole === 'admin';
    const isUser = userRole === 'user';

    const permissions: Permissions = {
        // Configurações da plataforma - apenas admin
        canViewSettings: isAdmin,

        // Gestão de usuários - apenas admin
        canManageUsers: isAdmin,

        // Gestão de formulários - apenas admin
        canManageForms: isAdmin,

        // Gestão de avaliações - apenas admin
        canManageEvaluations: isAdmin,

        // Visualização de funcionários - ambos, mas com diferentes níveis
        canViewEmployees: isAdmin || isUser,

        // Edição de funcionários - apenas admin
        canEditEmployees: isAdmin,

        // Visualização das próprias avaliações - ambos
        canViewOwnEvaluations: isAdmin || isUser,

        // Dashboard - ambos
        canViewDashboard: isAdmin || isUser,

        // Feed - ambos (módulo futuro)
        canViewFeed: isAdmin || isUser,

        // Módulos de configuração - apenas admin
        canManageDepartments: isAdmin,
        canManagePositions: isAdmin,
        canManageHierarchy: isAdmin,
        canManageDirectorates: isAdmin,
        canManageShifts: isAdmin,
        canManageUnits: isAdmin,
    };

    const hasPermission = (resource: string, action: string): boolean => {
        // Mapeamento de recursos e ações para permissões específicas
        const permissionMap: Record<string, Record<string, keyof Permissions>> = {
            dashboard: {
                view: 'canViewDashboard'
            },
            settings: {
                view: 'canViewSettings',
                manage: 'canViewSettings'
            },
            users: {
                view: 'canManageUsers',
                create: 'canManageUsers',
                edit: 'canManageUsers',
                delete: 'canManageUsers'
            },
            forms: {
                view: 'canManageForms',
                create: 'canManageForms',
                edit: 'canManageForms',
                delete: 'canManageForms'
            },
            evaluations: {
                view: 'canViewOwnEvaluations',
                create: 'canManageEvaluations',
                edit: 'canManageEvaluations',
                delete: 'canManageEvaluations',
                manage: 'canManageEvaluations'
            },
            employees: {
                view: 'canViewEmployees',
                create: 'canEditEmployees',
                edit: 'canEditEmployees',
                delete: 'canEditEmployees'
            },
            departments: {
                view: 'canManageDepartments',
                create: 'canManageDepartments',
                edit: 'canManageDepartments',
                delete: 'canManageDepartments'
            },
            positions: {
                view: 'canManagePositions',
                create: 'canManagePositions',
                edit: 'canManagePositions',
                delete: 'canManagePositions'
            },
            hierarchy: {
                view: 'canManageHierarchy',
                create: 'canManageHierarchy',
                edit: 'canManageHierarchy',
                delete: 'canManageHierarchy'
            },
            directorates: {
                view: 'canManageDirectorates',
                create: 'canManageDirectorates',
                edit: 'canManageDirectorates',
                delete: 'canManageDirectorates'
            },
            shifts: {
                view: 'canManageShifts',
                create: 'canManageShifts',
                edit: 'canManageShifts',
                delete: 'canManageShifts'
            },
            units: {
                view: 'canManageUnits',
                create: 'canManageUnits',
                edit: 'canManageUnits',
                delete: 'canManageUnits'
            }
        };

        const permissionKey = permissionMap[resource]?.[action];
        return permissionKey ? permissions[permissionKey] : false;
    };

    return {
        permissions,
        userRole,
        isAdmin,
        isUser,
        hasPermission
    };
}
