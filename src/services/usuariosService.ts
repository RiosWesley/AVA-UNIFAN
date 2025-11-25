import api from "./api";

export type Role = "aluno" | "professor" | "coordenador" | "administrador";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  usuario?: string;
  telefone?: string;
  cpf?: string;
  role: Role;
  status: "Ativo" | "Inativo";
  createdAt?: string;
  updatedAt?: string;
}

export interface UsuarioDetalhes extends Usuario {
  dataCadastro: string;
  ultimoAcesso: string;
}

export interface CreateUsuarioDto {
  nome: string;
  email: string;
  usuario?: string;
  telefone?: string;
  cpf?: string;
  senha: string;
  confirmarSenha: string;
  role: Role;
  status: "Ativo" | "Inativo";
}

export interface UpdateUsuarioDto {
  nome?: string;
  email?: string;
  usuario?: string;
  telefone?: string;
  cpf?: string;
  senha?: string;
  role?: Role;
  status?: "Ativo" | "Inativo";
}

// Mapeamento entre roles do frontend e backend
const roleMapping: Record<Role, string> = {
  aluno: "student",
  professor: "teacher",
  coordenador: "coordinator",
  administrador: "admin",
};

const reverseRoleMapping: Record<string, Role> = {
  student: "aluno",
  teacher: "professor",
  coordinator: "coordenador",
  admin: "administrador",
};

// Interface para resposta da API do backend
interface BackendUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Array<{ id: string; name: string }>;
  usuario?: string;
  telefone?: string;
  cpf?: string;
}

// Interface para resposta paginada
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Converter usuário do backend para o formato do frontend
function mapBackendUserToFrontend(backendUser: BackendUser): Usuario {
  const primaryRole = backendUser.roles?.[0]?.name || "student";
  const role = reverseRoleMapping[primaryRole] || "aluno";

  return {
    id: backendUser.id,
    nome: backendUser.name,
    email: backendUser.email,
    usuario: backendUser.usuario,
    telefone: backendUser.telefone,
    cpf: backendUser.cpf,
    role,
    status: backendUser.isActive ? "Ativo" : "Inativo",
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
  };
}

// Converter dados do frontend para o formato do backend
function mapFrontendToBackend(data: CreateUsuarioDto | UpdateUsuarioDto) {
  const mapped: any = {};

  if ("nome" in data && data.nome) mapped.name = data.nome;
  if ("email" in data && data.email) mapped.email = data.email;
  if ("usuario" in data && data.usuario) mapped.usuario = data.usuario;
  if ("telefone" in data && data.telefone) mapped.telefone = data.telefone;
  if ("cpf" in data && data.cpf) mapped.cpf = data.cpf;
  if ("senha" in data && data.senha) mapped.password = data.senha;
  if ("status" in data && data.status) {
    mapped.isActive = data.status === "Ativo";
  }

  return mapped;
}

export const usuariosService = {
  // Listar usuários com paginação e filtros
  async listar(page: number = 1, limit: number = 10, role?: Role | "todos", search?: string): Promise<PaginatedResponse<Usuario>> {
    try {
      const params: any = { page, limit };
      
      // Converter role do frontend para backend
      if (role && role !== "todos") {
        params.role = roleMapping[role];
      }
      
      // Adicionar busca se fornecida
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get<PaginatedResponse<BackendUser>>("/users", {
        params,
      });
      return {
        data: response.data.data.map(mapBackendUserToFrontend),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      };
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      throw new Error("Não foi possível carregar os usuários.");
    }
  },

  // Buscar usuário por ID
  async buscarPorId(id: string): Promise<Usuario> {
    try {
      const response = await api.get<BackendUser>(`/users/${id}`);
      return mapBackendUserToFrontend(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      throw new Error("Não foi possível carregar o usuário.");
    }
  },

  // Criar novo usuário
  async criar(data: CreateUsuarioDto): Promise<Usuario> {
    try {
      // Validar senha
      if (data.senha !== data.confirmarSenha) {
        throw new Error("As senhas não coincidem.");
      }

      if (data.senha.length < 8) {
        throw new Error("A senha deve ter pelo menos 8 caracteres.");
      }

      // Validar CPF
      if (data.cpf) {
        const cpfDigits = data.cpf.replace(/\D/g, "");
        if (cpfDigits.length !== 11) {
          throw new Error("CPF deve conter 11 dígitos.");
        }
      }

      const backendData = mapFrontendToBackend(data);
      const response = await api.post<BackendUser>("/users", backendData);

      // Associar role ao usuário
      if (data.role) {
        const roleName = roleMapping[data.role];
        // Buscar role pelo nome
        const rolesResponse = await api.get<Array<{ id: string; name: string }>>("/roles");
        const role = rolesResponse.data.find((r) => r.name === roleName);
        
        if (role) {
          await api.post(`/users/${response.data.id}/roles`, { roleId: role.id });
        }
      }

      // Buscar usuário completo com roles
      const userResponse = await api.get<BackendUser>(`/users/${response.data.id}`);
      return mapBackendUserToFrontend(userResponse.data);
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      const message = error.response?.data?.message || error.message || "Não foi possível criar o usuário.";
      throw new Error(message);
    }
  },

  // Atualizar usuário
  async atualizar(id: string, data: UpdateUsuarioDto): Promise<Usuario> {
    try {
      const backendData = mapFrontendToBackend(data);
      await api.patch(`/users/${id}`, backendData);

      // Atualizar role se necessário
      if (data.role) {
        // Buscar usuário atual
        const currentUser = await api.get<BackendUser>(`/users/${id}`);
        const currentRoles = currentUser.data.roles || [];

        // Buscar todas as roles
        const rolesResponse = await api.get<Array<{ id: string; name: string }>>("/roles");
        const targetRole = rolesResponse.data.find((r) => r.name === roleMapping[data.role]);

        if (targetRole) {
          // Remover roles antigas
          for (const role of currentRoles) {
            await api.delete(`/users/${id}/roles/${role.id}`);
          }
          // Adicionar nova role
          await api.post(`/users/${id}/roles`, { roleId: targetRole.id });
        }
      }

      // Buscar usuário atualizado
      const userResponse = await api.get<BackendUser>(`/users/${id}`);
      return mapBackendUserToFrontend(userResponse.data);
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);
      const message = error.response?.data?.message || error.message || "Não foi possível atualizar o usuário.";
      throw new Error(message);
    }
  },

  // Inativar usuário
  async inativar(id: string): Promise<Usuario> {
    try {
      await api.patch(`/users/${id}`, { isActive: false });
      const userResponse = await api.get<BackendUser>(`/users/${id}`);
      return mapBackendUserToFrontend(userResponse.data);
    } catch (error: any) {
      console.error("Erro ao inativar usuário:", error);
      const message = error.response?.data?.message || error.message || "Não foi possível inativar o usuário.";
      throw new Error(message);
    }
  },

  // Buscar detalhes do usuário (com informações adicionais)
  async buscarDetalhes(id: string): Promise<UsuarioDetalhes> {
    try {
      const usuario = await this.buscarPorId(id);
      return {
        ...usuario,
        dataCadastro: usuario.createdAt
          ? new Date(usuario.createdAt).toLocaleDateString("pt-BR")
          : "Data não disponível",
        ultimoAcesso: "Não disponível", // TODO: Implementar quando houver tracking de último acesso
      };
    } catch (error) {
      console.error("Erro ao buscar detalhes do usuário:", error);
      throw new Error("Não foi possível carregar os detalhes do usuário.");
    }
  },

  // Verificar se um email já existe no sistema
  async verificarEmailExistente(email: string): Promise<boolean> {
    try {
      const response = await api.get<{ exists: boolean }>(`/users/check-email/${encodeURIComponent(email)}`);
      return response.data.exists;
    } catch (error: any) {
      console.error("Erro ao verificar email:", error);
      // Se o endpoint não existir ainda ou houver erro, retornar false para não bloquear
      // O backend validará de qualquer forma
      if (error.response?.status === 404) {
        return false;
      }
      throw new Error("Não foi possível verificar se o email já existe.");
    }
  },
};

