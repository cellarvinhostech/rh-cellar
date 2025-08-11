import { useState } from "react";
import { User, Mail, Phone, Building, Calendar, Clock, Camera, Lock, Save, X } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import type { UpdateProfileData, ChangePasswordData } from "@/types/auth";

export default function Profile() {
  const { authState, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    name: authState.user?.name || "",
    email: authState.user?.email || "",
    phone: authState.user?.phone || "",
    avatar: authState.user?.avatar || ""
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar perfil.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    try {
      await changePassword(passwordData);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao alterar senha.",
        variant: "destructive",
      });
    }
  };

  if (!authState.user) return null;

  return (
    <MainLayout>
      <div className="h-full flex flex-col" data-testid="profile-page">
        {/* Header */}
        <header className="bg-white px-6 py-6 border-b border-slate-200">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900" data-testid="profile-title">
              Meu Perfil
            </h1>
            <p className="text-slate-600">Gerencie suas informações pessoais e configurações de segurança</p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={authState.user.avatar}
                    alt={authState.user.name}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-100"
                    data-testid="user-avatar-large"
                  />
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-purple-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900" data-testid="user-name-large">
                    {authState.user.name}
                  </h2>
                  <p className="text-slate-600" data-testid="user-role-large">{authState.user.role}</p>
                  <p className="text-sm text-slate-500">{authState.user.department}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">Último acesso</p>
                  <p className="text-sm font-medium text-slate-900">
                    {authState.user.lastLogin ? new Date(authState.user.lastLogin).toLocaleDateString("pt-BR") : "Nunca"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="border-b border-slate-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "profile"
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    data-testid="tab-profile"
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Informações Pessoais
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "security"
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    data-testid="tab-security"
                  >
                    <Lock className="w-4 h-4 inline mr-2" />
                    Segurança
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "profile" ? (
                  <div data-testid="profile-tab-content">
                    {isEditing ? (
                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Nome completo
                            </label>
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              data-testid="input-name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              E-mail
                            </label>
                            <input
                              type="email"
                              value={profileData.email}
                              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              data-testid="input-email-edit"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Telefone
                            </label>
                            <input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              data-testid="input-phone"
                            />
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={authState.isLoading}
                            className="btn-primary disabled:opacity-50"
                            data-testid="button-save-profile"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {authState.isLoading ? "Salvando..." : "Salvar alterações"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setProfileData({
                                name: authState.user?.name || "",
                                email: authState.user?.email || "",
                                phone: authState.user?.phone || "",
                                avatar: authState.user?.avatar || ""
                              });
                            }}
                            className="btn-secondary"
                            data-testid="button-cancel-edit"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-500">E-mail</p>
                              <p className="font-medium text-slate-900" data-testid="display-email">
                                {authState.user.email}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-500">Telefone</p>
                              <p className="font-medium text-slate-900" data-testid="display-phone">
                                {authState.user.phone || "Não informado"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Building className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-500">Departamento</p>
                              <p className="font-medium text-slate-900" data-testid="display-department">
                                {authState.user.department}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-sm text-slate-500">Data de entrada</p>
                              <p className="font-medium text-slate-900" data-testid="display-join-date">
                                {new Date(authState.user.joinDate).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsEditing(true)}
                          className="btn-primary"
                          data-testid="button-edit-profile"
                        >
                          Editar informações
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div data-testid="security-tab-content">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Alterar senha</h3>
                    
                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Senha atual
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                          data-testid="input-current-password"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Nova senha
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                          data-testid="input-new-password"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Confirmar nova senha
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                          data-testid="input-confirm-password"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={authState.isLoading}
                        className="btn-primary disabled:opacity-50"
                        data-testid="button-change-password"
                      >
                        {authState.isLoading ? "Alterando..." : "Alterar senha"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}