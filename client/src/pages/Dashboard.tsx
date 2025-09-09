import {
  Users,
  Clock,
  CheckCircle,
  Building,
  Plus,
  Star,
  BarChart,
  UserPlus,
  Sparkles,
  Target,
  Calendar,
  MessageSquare,
  Gift,
  Coffee,
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarDays,
  User,
  Send,
  MoreVertical,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { EvaluationChart } from "@/components/analytics/EvaluationChart";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import PendingEvaluationsNotification from "@/components/analytics/PendingEvaluationsNotification";
import { useHRData } from "@/hooks/use-hr-data";
import { useAuth } from "@/hooks/use-auth";
import { usePendingEvaluations } from "@/hooks/use-pending-evaluations";
import { useState, useEffect, useCallback } from "react";
import CustomCalendar from "@/components/calendar/CustomCalendar";

export default function Dashboard() {
  const { stats, activities, departments, getEmployeesWithDetails } =
    useHRData();
  const { authState } = useAuth();
  const { pendingEvaluations, loading, error } = usePendingEvaluations();
  const pendingCount = pendingEvaluations.length;
  const [activeTab, setActiveTab] = useState("timeline");
  const [visiblePosts, setVisiblePosts] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedComments, setExpandedComments] = useState<
    Record<number, boolean>
  >({});
  const [likesPopover, setLikesPopover] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  const employees = getEmployeesWithDetails();

  // Mock data para curtidas dos posts
  const postLikes: Record<
    number,
    Array<{ id: number; nome: string; avatar: string }>
  > = {
    1: [
      { id: 1, nome: "Carlos Oliveira", avatar: "CO" },
      { id: 2, nome: "Maria Santos", avatar: "MS" },
      { id: 3, nome: "João Silva", avatar: "JS" },
      { id: 4, nome: "Pedro Costa", avatar: "PC" },
      { id: 5, nome: "Ana Costa", avatar: "AC" },
      { id: 6, nome: "Rafael Mendes", avatar: "RM" },
      { id: 7, nome: "Lucia Fernandes", avatar: "LF" },
      { id: 8, nome: "Bruno Alves", avatar: "BA" },
      { id: 9, nome: "Amanda Torres", avatar: "AT" },
      { id: 10, nome: "Gustavo Rocha", avatar: "GR" },
      { id: 11, nome: "Isabela Martins", avatar: "IM" },
      { id: 12, nome: "Diego Souza", avatar: "DS" },
    ],
    23: [
      { id: 1, nome: "Ana Silva", avatar: "AS" },
      { id: 2, nome: "Carlos Oliveira", avatar: "CO" },
      { id: 3, nome: "Maria Santos", avatar: "MS" },
      { id: 4, nome: "João Silva", avatar: "JS" },
      { id: 5, nome: "Pedro Costa", avatar: "PC" },
      { id: 6, nome: "Rafael Mendes", avatar: "RM" },
      { id: 7, nome: "Lucia Fernandes", avatar: "LF" },
      { id: 8, nome: "Bruno Alves", avatar: "BA" },
    ],
    3: [
      { id: 1, nome: "Ana Silva", avatar: "AS" },
      { id: 2, nome: "Maria Santos", avatar: "MS" },
      { id: 3, nome: "João Silva", avatar: "JS" },
      { id: 4, nome: "Pedro Costa", avatar: "PC" },
      { id: 5, nome: "Rafael Mendes", avatar: "RM" },
    ],
    24: [
      { id: 1, nome: "Ana Silva", avatar: "AS" },
      { id: 2, nome: "Carlos Oliveira", avatar: "CO" },
      { id: 3, nome: "Maria Santos", avatar: "MS" },
      { id: 4, nome: "João Silva", avatar: "JS" },
      { id: 5, nome: "Pedro Costa", avatar: "PC" },
      { id: 6, nome: "Rafael Mendes", avatar: "RM" },
      { id: 7, nome: "Lucia Fernandes", avatar: "LF" },
      { id: 8, nome: "Bruno Alves", avatar: "BA" },
      { id: 9, nome: "Amanda Torres", avatar: "AT" },
      { id: 10, nome: "Gustavo Rocha", avatar: "GR" },
      { id: 11, nome: "Isabela Martins", avatar: "IM" },
      { id: 12, nome: "Diego Souza", avatar: "DS" },
      { id: 13, nome: "Camila Rodrigues", avatar: "CR" },
      { id: 14, nome: "Felipe Santos", avatar: "FS" },
      { id: 15, nome: "Thiago Lima", avatar: "TL" },
    ],
    25: [
      { id: 1, nome: "Ana Silva", avatar: "AS" },
      { id: 2, nome: "Carlos Oliveira", avatar: "CO" },
      { id: 3, nome: "Maria Santos", avatar: "MS" },
      { id: 4, nome: "João Silva", avatar: "JS" },
      { id: 5, nome: "Pedro Costa", avatar: "PC" },
    ],
  };

  // Mock data para comentários dos posts
  const postComments: Record<
    number,
    Array<{
      id: number;
      usuario: string;
      avatar: string;
      cargo: string;
      tempo: string;
      comentario: string;
    }>
  > = {
    1: [
      {
        id: 1,
        usuario: "Carlos Oliveira",
        avatar: "CO",
        cargo: "Gerente de Vendas",
        tempo: "1 hora atrás",
        comentario:
          "Parabéns Ana! Esse módulo vai ser muito útil para nossa equipe. 👏",
      },
      {
        id: 2,
        usuario: "Maria Santos",
        avatar: "MS",
        cargo: "Designer",
        tempo: "45 minutos atrás",
        comentario:
          "Incrível trabalho! Mal posso esperar para usar as novas funcionalidades.",
      },
      {
        id: 3,
        usuario: "João Silva",
        avatar: "JS",
        cargo: "Analista de RH",
        tempo: "30 minutos atrás",
        comentario:
          "Ana, você poderia fazer uma apresentação sobre as tecnologias usadas? Seria ótimo para o time!",
      },
    ],
    23: [
      {
        id: 1,
        usuario: "Pedro Costa",
        avatar: "PC",
        cargo: "Tech Lead",
        tempo: "2 horas atrás",
        comentario:
          "Já confirmei minha presença! Será muito bom para desenvolver habilidades de liderança.",
      },
      {
        id: 2,
        usuario: "Rafael Mendes",
        avatar: "RM",
        cargo: "Product Manager",
        tempo: "1 hora atrás",
        comentario: "Vocês sabem se haverá certificado? 🎓",
      },
    ],
    3: [
      {
        id: 1,
        usuario: "Ana Silva",
        avatar: "AS",
        cargo: "Desenvolvedora",
        tempo: "12 horas atrás",
        comentario: "Vocês merecem! Foi um trimestre incrível mesmo. 🎉",
      },
      {
        id: 2,
        usuario: "Maria Santos",
        avatar: "MS",
        cargo: "Designer",
        tempo: "10 horas atrás",
        comentario:
          "Parabéns a toda equipe de vendas! Inspirador ver esses resultados.",
      },
      {
        id: 3,
        usuario: "João Silva",
        avatar: "JS",
        cargo: "Analista de RH",
        tempo: "8 horas atrás",
        comentario: "Carlos, você e o time de vendas são incríveis! 💪",
      },
    ],
    24: [
      {
        id: 1,
        usuario: "Ana Silva",
        avatar: "AS",
        cargo: "Desenvolvedora",
        tempo: "4 horas atrás",
        comentario: "Mal posso esperar para ver as apresentações! 🚀",
      },
      {
        id: 2,
        usuario: "Carlos Oliveira",
        avatar: "CO",
        cargo: "Gerente de Vendas",
        tempo: "3 horas atrás",
        comentario:
          "Será uma ótima oportunidade para conhecer os projetos de outras equipes.",
      },
    ],
    25: [
      {
        id: 1,
        usuario: "João Silva",
        avatar: "JS",
        cargo: "Analista de RH",
        tempo: "18 horas atrás",
        comentario: "Adorei a iniciativa! Já me inscrevi. 🧘‍♀️",
      },
    ],
  };

  // Mock data para aniversariantes
  const aniversariantes = [
    {
      id: 1,
      nome: "Ana Silva",
      data: "Hoje",
      avatar: "AS",
      cargo: "Desenvolvedora",
    },
    {
      id: 2,
      nome: "Carlos Oliveira",
      data: "22 de agosto",
      avatar: "CO",
      cargo: "Gerente de Vendas",
    },
    {
      id: 3,
      nome: "Maria Santos",
      data: "24 de agosto",
      avatar: "MS",
      cargo: "Designer",
    },
    {
      id: 4,
      nome: "João Silva",
      data: "26 de agosto",
      avatar: "JS",
      cargo: "Analista de RH",
    },
  ];

  // Mock data para Timeline - Feed da empresa
  const allTimelineData = [
    {
      id: 1,
      tipo: "post",
      usuario: "Ana Silva",
      avatar: "AS",
      cargo: "Desenvolvedora",
      tempo: "2 horas atrás",
      conteudo:
        "Acabei de finalizar o novo módulo de relatórios! 🎉 Foi um desafio interessante trabalhar com as novas tecnologias. Obrigada ao time pelo apoio!",
      likes: 12,
      comentarios: 3,
      imagem: null,
    },
    {
      id: 23,
      tipo: "evento-agenda",
      usuario: "RH - Empresa",
      avatar: "RH",
      cargo: "Recursos Humanos",
      tempo: "3 horas atrás",
      conteudo: "📅 Lembrete importante sobre o evento de hoje!",
      likes: 8,
      comentarios: 2,
      imagem: null,
      eventoData: {
        titulo: "Workshop de Liderança",
        data: "23 de agosto, 2025",
        horario: "09:00 - 12:00",
        local: "Auditório principal",
        participantes: 25,
        tipo: "workshop",
        descricao:
          "Desenvolva suas habilidades de liderança com especialistas da área. Workshop interativo com casos práticos e dinâmicas em grupo.",
        organizador: "Time de RH",
        status: "confirmado",
      },
    },
    {
      id: 2,
      tipo: "anuncio",
      usuario: "RH - Empresa",
      avatar: "RH",
      cargo: "Recursos Humanos",
      tempo: "4 horas atrás",
      conteudo:
        "📢 Lembrando que hoje é o último dia para participar da pesquisa de clima organizacional. Sua opinião é muito importante para nós!",
      likes: 8,
      comentarios: 1,
      imagem: null,
    },
    {
      id: 24,
      tipo: "evento-agenda",
      usuario: "Sistema",
      avatar: "S",
      cargo: "Sistema",
      tempo: "6 horas atrás",
      conteudo: "🚀 Não perca o grande evento da semana!",
      likes: 15,
      comentarios: 7,
      imagem: null,
      eventoData: {
        titulo: "Demo Day - Apresentação de Projetos",
        data: "27 de agosto, 2025",
        horario: "14:00 - 17:00",
        local: "Auditório principal",
        participantes: 40,
        tipo: "apresentacao",
        descricao:
          "Venha conhecer os projetos incríveis que foram desenvolvidos neste trimestre. Apresentações de 15 minutos por equipe.",
        organizador: "Equipe de Desenvolvimento",
        status: "confirmado",
      },
    },
    {
      id: 3,
      tipo: "conquista",
      usuario: "Carlos Oliveira",
      avatar: "CO",
      cargo: "Gerente de Vendas",
      tempo: "1 dia atrás",
      conteudo:
        "🎯 Meta do trimestre batida! Parabéns a toda equipe de vendas pelo excelente trabalho. Vamos celebrar na sexta-feira!",
      likes: 25,
      comentarios: 8,
      imagem: null,
    },
    {
      id: 25,
      tipo: "evento-agenda",
      usuario: "Isabela Martins",
      avatar: "IM",
      cargo: "Psicóloga Organizacional",
      tempo: "1 dia atrás",
      conteudo: "🧘‍♀️ Uma oportunidade única de cuidar do seu bem-estar!",
      likes: 18,
      comentarios: 5,
      imagem: null,
      eventoData: {
        titulo: "Sessão de Mindfulness e Relaxamento",
        data: "30 de agosto, 2025",
        horario: "17:00 - 18:00",
        local: "Sala de bem-estar",
        participantes: 15,
        tipo: "wellness",
        descricao:
          "Sessão guiada de mindfulness para reduzir o estresse e melhorar o foco. Traga roupas confortáveis.",
        organizador: "Programa de Bem-estar",
        status: "vagas-limitadas",
      },
    },
    {
      id: 4,
      tipo: "boas-vindas",
      usuario: "Sistema",
      avatar: "S",
      cargo: "Sistema",
      tempo: "2 dias atrás",
      conteudo:
        "👋 Damos as boas-vindas à Maria Santos, que se juntou ao nosso time de Design! Estamos animados para trabalhar junto com você.",
      likes: 15,
      comentarios: 5,
      imagem: null,
    },
    {
      id: 5,
      tipo: "evento",
      usuario: "João Silva",
      avatar: "JS",
      cargo: "Analista de RH",
      tempo: "2 dias atrás",
      conteudo:
        "🗓️ Lembrete: amanhã teremos o workshop de liderança às 14h no auditório principal. Não esqueçam de confirmar presença!",
      likes: 18,
      comentarios: 4,
      imagem: null,
    },
    {
      id: 6,
      tipo: "reconhecimento",
      usuario: "Maria Santos",
      avatar: "MS",
      cargo: "Designer",
      tempo: "3 dias atrás",
      conteudo:
        "✨ Muito feliz em receber o feedback positivo do cliente sobre o novo design! Trabalho em equipe sempre rende os melhores frutos. 💪",
      likes: 22,
      comentarios: 7,
      imagem: null,
    },
    {
      id: 26,
      tipo: "evento-agenda",
      usuario: "Carlos Oliveira",
      avatar: "CO",
      cargo: "Gerente de Vendas",
      tempo: "3 dias atrás",
      conteudo: "🎯 Evento especial para celebrar nossa conquista!",
      likes: 32,
      comentarios: 12,
      imagem: null,
      eventoData: {
        titulo: "Celebração - Meta Q3 Alcançada",
        data: "30 de agosto, 2025",
        horario: "18:00 - 20:00",
        local: "Terraço da empresa",
        participantes: 60,
        tipo: "celebracao",
        descricao:
          "Vamos celebrar juntos o sucesso do terceiro trimestre! Haverá comida, bebidas e muita diversão.",
        organizador: "Equipe de Vendas",
        status: "confirmado",
      },
    },
    {
      id: 7,
      tipo: "dica",
      usuario: "Pedro Costa",
      avatar: "PC",
      cargo: "Tech Lead",
      tempo: "3 dias atrás",
      conteudo:
        "💡 Dica do dia: sempre façam code review com carinho! É uma oportunidade de aprender e ensinar ao mesmo tempo. #DevLife",
      likes: 14,
      comentarios: 6,
      imagem: null,
    },
    {
      id: 8,
      tipo: "aniversario",
      usuario: "Sistema",
      avatar: "S",
      cargo: "Sistema",
      tempo: "4 dias atrás",
      conteudo:
        "🎂 Hoje é aniversário da nossa querida Fernanda Lima! Desejamos muito sucesso e felicidades. Parabéns! 🎉",
      likes: 31,
      comentarios: 12,
      imagem: null,
    },
    {
      id: 9,
      tipo: "inovacao",
      usuario: "Rafael Mendes",
      avatar: "RM",
      cargo: "Product Manager",
      tempo: "4 dias atrás",
      conteudo:
        "🚀 Lançamos a nova funcionalidade de integração com APIs externas! Os usuários já estão adorando. Obrigado a todos os envolvidos!",
      likes: 19,
      comentarios: 5,
      imagem: null,
    },
    {
      id: 10,
      tipo: "formacao",
      usuario: "Lucia Fernandes",
      avatar: "LF",
      cargo: "Coordenadora de Treinamento",
      tempo: "5 dias atrás",
      conteudo:
        "📚 Inscrições abertas para o curso de Excel Avançado! Vagas limitadas. Interessados podem se inscrever até sexta-feira.",
      likes: 16,
      comentarios: 9,
      imagem: null,
    },
    {
      id: 11,
      tipo: "sustentabilidade",
      usuario: "Bruno Alves",
      avatar: "BA",
      cargo: "Analista Ambiental",
      tempo: "5 dias atrás",
      conteudo:
        "🌱 Nossa empresa plantou mais 100 árvores este mês! Juntos estamos construindo um futuro mais sustentável. #MeioAmbiente",
      likes: 27,
      comentarios: 8,
      imagem: null,
    },
    {
      id: 12,
      tipo: "tecnologia",
      usuario: "Amanda Torres",
      avatar: "AT",
      cargo: "DevOps Engineer",
      tempo: "6 dias atrás",
      conteudo:
        "⚡ Deploy automático implementado com sucesso! Agora os releases são 3x mais rápidos. Produtividade em alta! 🔥",
      likes: 21,
      comentarios: 4,
      imagem: null,
    },
    {
      id: 13,
      tipo: "cliente",
      usuario: "Gustavo Rocha",
      avatar: "GR",
      cargo: "Account Manager",
      tempo: "6 dias atrás",
      conteudo:
        "🤝 Fechamos mais um contrato importante! Cliente super satisfeito com nosso atendimento. Equipe de vendas arrasando!",
      likes: 24,
      comentarios: 6,
      imagem: null,
    },
    {
      id: 14,
      tipo: "wellness",
      usuario: "Isabela Martins",
      avatar: "IM",
      cargo: "Psicóloga Organizacional",
      tempo: "1 semana atrás",
      conteudo:
        "🧘‍♀️ Lembrete: cuidar da saúde mental é essencial! Nossa sala de relaxamento está sempre disponível para vocês.",
      likes: 20,
      comentarios: 11,
      imagem: null,
    },
    {
      id: 15,
      tipo: "colaboracao",
      usuario: "Diego Souza",
      avatar: "DS",
      cargo: "Scrum Master",
      tempo: "1 semana atrás",
      conteudo:
        "🎯 Sprint finalizada com 100% das tasks concluídas! Parabéns time, vocês são incríveis. Próxima planning na segunda!",
      likes: 17,
      comentarios: 3,
      imagem: null,
    },
    {
      id: 16,
      tipo: "networking",
      usuario: "Camila Rodrigues",
      avatar: "CR",
      cargo: "Marketing Manager",
      tempo: "1 semana atrás",
      conteudo:
        "📈 Participamos do maior evento de tecnologia do ano! Muitos contatos interessantes e oportunidades de parcerias.",
      likes: 23,
      comentarios: 7,
      imagem: null,
    },
    {
      id: 17,
      tipo: "processo",
      usuario: "Felipe Santos",
      avatar: "FS",
      cargo: "Analista de Qualidade",
      tempo: "1 semana atrás",
      conteudo:
        "✅ Implementamos o novo processo de QA! Diminuímos os bugs em produção em 40%. Qualidade em primeiro lugar!",
      likes: 19,
      comentarios: 5,
      imagem: null,
    },
    {
      id: 18,
      tipo: "diversidade",
      usuario: "RH - Empresa",
      avatar: "RH",
      cargo: "Recursos Humanos",
      tempo: "1 semana atrás",
      conteudo:
        "🌈 Orgulhosos de ser uma empresa diversa e inclusiva! 45% do nosso time é composto por mulheres. Vamos continuar crescendo juntos!",
      likes: 35,
      comentarios: 14,
      imagem: null,
    },
    {
      id: 19,
      tipo: "aprendizado",
      usuario: "Thiago Lima",
      avatar: "TL",
      cargo: "Senior Developer",
      tempo: "1 semana atrás",
      conteudo:
        "🎓 Finalizei mais uma certificação! Aprender nunca é demais. Quem mais está estudando algo novo? Vamos trocar conhecimentos!",
      likes: 18,
      comentarios: 8,
      imagem: null,
    },
    {
      id: 20,
      tipo: "motivacao",
      usuario: "Sandra Oliveira",
      avatar: "SO",
      cargo: "CEO",
      tempo: "2 semanas atrás",
      conteudo:
        "💪 Começamos o mês com energia total! Grandes projetos pela frente e tenho certeza que vamos superar todas as expectativas. Juntos somos mais fortes!",
      likes: 42,
      comentarios: 16,
      imagem: null,
    },
    {
      id: 21,
      tipo: "conquista",
      usuario: "Eduardo Pereira",
      avatar: "EP",
      cargo: "Financial Analyst",
      tempo: "2 semanas atrás",
      conteudo:
        "📊 Relatório mensal finalizado! Crescimento de 15% em relação ao mês anterior. Números que motivam a continuar trabalhando duro!",
      likes: 26,
      comentarios: 5,
      imagem: null,
    },
    {
      id: 22,
      tipo: "cultura",
      usuario: "Patrícia Costa",
      avatar: "PT",
      cargo: "Culture Manager",
      tempo: "2 semanas atrás",
      conteudo:
        "🎪 Que tal um happy hour virtual na sexta? Vamos relaxar e nos conectar! Quem topa? Link será enviado por email.",
      likes: 29,
      comentarios: 13,
      imagem: null,
    },
  ];

  // Mock data para eventos do calendário
  const calendarEvents = [
    {
      id: 1,
      title: "1:1 com João",
      date: new Date(2025, 7, 21), // 21 de agosto
      time: "14:00 - 15:00",
      type: "meeting" as const,
      location: "Sala de reuniões 1",
      attendees: 2,
      description: "Revisão de performance e objetivos do trimestre",
    },
    {
      id: 2,
      title: "Review de Performance",
      date: new Date(2025, 7, 21), // 21 de agosto
      time: "15:30 - 16:30",
      type: "evaluation" as const,
      location: "Sala de reuniões 2",
      attendees: 3,
      description: "Avaliação semestral da equipe",
    },
    {
      id: 3,
      title: "Entrevista - Pedro Costa",
      date: new Date(2025, 7, 21), // 21 de agosto
      time: "17:00 - 18:00",
      type: "interview" as const,
      location: "RH",
      attendees: 3,
      description: "Entrevista para vaga de desenvolvedor",
    },
    {
      id: 4,
      title: "Aniversário - Carlos Oliveira",
      date: new Date(2025, 7, 22), // 22 de agosto
      time: "Todo o dia",
      type: "birthday" as const,
      description: "Parabéns ao nosso gerente de vendas!",
    },
    {
      id: 5,
      title: "Workshop de Liderança",
      date: new Date(2025, 7, 23), // 23 de agosto
      time: "09:00 - 12:00",
      type: "event" as const,
      location: "Auditório principal",
      attendees: 25,
      description: "Treinamento em liderança para gestores",
    },
    {
      id: 6,
      title: "Aniversário - Maria Santos",
      date: new Date(2025, 7, 24), // 24 de agosto
      time: "Todo o dia",
      type: "birthday" as const,
      description: "Parabéns à nossa designer!",
    },
    {
      id: 7,
      title: "Reunião All-Hands",
      date: new Date(2025, 7, 25), // 25 de agosto
      time: "10:00 - 11:00",
      type: "meeting" as const,
      location: "Auditório principal",
      attendees: 50,
      description: "Reunião geral da empresa com atualizações importantes",
    },
    {
      id: 8,
      title: "Aniversário - João Silva",
      date: new Date(2025, 7, 26), // 26 de agosto
      time: "Todo o dia",
      type: "birthday" as const,
      description: "Parabéns ao nosso analista de RH!",
    },
    {
      id: 9,
      title: "Demo Day",
      date: new Date(2025, 7, 27), // 27 de agosto
      time: "14:00 - 17:00",
      type: "event" as const,
      location: "Auditório principal",
      attendees: 40,
      description: "Apresentação dos projetos finalizados no trimestre",
    },
    {
      id: 10,
      title: "Retrospectiva do Time",
      date: new Date(2025, 7, 28), // 28 de agosto
      time: "16:00 - 17:00",
      type: "meeting" as const,
      location: "Sala de reuniões 3",
      attendees: 8,
      description: "Retrospectiva da sprint e planejamento",
    },
    {
      id: 11,
      title: "Treinamento de Segurança",
      date: new Date(2025, 7, 29), // 29 de agosto
      time: "09:00 - 10:30",
      type: "event" as const,
      location: "Sala de treinamento",
      attendees: 15,
      description: "Treinamento obrigatório sobre segurança da informação",
    },
    {
      id: 12,
      title: "Happy Hour da Empresa",
      date: new Date(2025, 7, 30), // 30 de agosto
      time: "18:00 - 20:00",
      type: "event" as const,
      location: "Terraço",
      attendees: 60,
      description: "Confraternização mensal da empresa",
    },
    {
      id: 13,
      title: "Entrevista - Ana Costa",
      date: new Date(2025, 7, 19), // 19 de agosto (passado)
      time: "10:00 - 11:00",
      type: "interview" as const,
      location: "RH",
      attendees: 2,
      description: "Entrevista para vaga de analista",
    },
    {
      id: 14,
      title: "Reunião de Orçamento",
      date: new Date(2025, 8, 2), // 2 de setembro
      time: "14:00 - 16:00",
      type: "meeting" as const,
      location: "Sala da diretoria",
      attendees: 6,
      description: "Planejamento orçamentário para Q4",
    },
  ];

  // Mock data para Enquetes
  const enquetesData = [
    {
      id: 1,
      titulo: "Satisfação com o ambiente de trabalho",
      descricao: "Pesquisa sobre clima organizacional",
      status: "ativa",
      participantes: 45,
      total: 67,
    },
    {
      id: 2,
      titulo: "Feedback sobre benefícios",
      descricao: "Avaliação dos benefícios oferecidos",
      status: "finalizada",
      participantes: 67,
      total: 67,
    },
  ];

  // Calcular enquetes ativas
  const enquetesAtivas = enquetesData.filter(
    (enquete) => enquete.status === "ativa"
  ).length;

  // Função para carregar mais posts
  const loadMorePosts = () => {
    setIsLoading(true);
    // Simula um delay de carregamento
    setTimeout(() => {
      setVisiblePosts((prev) => Math.min(prev + 5, allTimelineData.length));
      setIsLoading(false);
    }, 800);
  };

  // Posts visíveis atualmente
  const currentPosts = allTimelineData.slice(0, visiblePosts);
  const hasMorePosts = visiblePosts < allTimelineData.length;

  // Hook para detectar scroll e carregar mais posts automaticamente
  const handleScroll = useCallback(() => {
    if (activeTab !== "timeline" || isLoading || !hasMorePosts) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 1000; // Carrega quando está a 1000px do final

    if (scrollPosition >= threshold) {
      loadMorePosts();
    }
  }, [activeTab, isLoading, hasMorePosts]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Reset posts quando muda de aba
  useEffect(() => {
    if (activeTab === "timeline") {
      setVisiblePosts(5);
    }
  }, [activeTab]);

  // Função para alternar exibição de comentários
  const toggleComments = (postId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Função para mostrar popover de curtidas no hover
  const showLikesPopover = (postId: number) => {
    setLikesPopover(postId);
  };

  // Função para esconder popover de curtidas
  const hideLikesPopover = () => {
    setLikesPopover(null);
  };

  // Função para curtir/descurtir post
  const toggleLike = (postId: number) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Componente para renderizar comentários
  const renderComments = (postId: number) => {
    const comments = postComments[postId] || [];

    if (!expandedComments[postId]) return null;

    return (
      <div className="border-t border-gray-100 pt-4 mt-4">
        {/* Lista de comentários */}
        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {comment.avatar}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-medium text-gray-900 text-sm">
                      {comment.usuario}
                    </h5>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      {comment.cargo}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{comment.comentario}</p>
                </div>
                <div className="flex items-center space-x-4 mt-1 px-3">
                  <span className="text-xs text-gray-500">{comment.tempo}</span>
                  <button className="text-xs text-gray-500 hover:text-purple-600 font-medium">
                    Curtir
                  </button>
                  <button className="text-xs text-gray-500 hover:text-purple-600 font-medium">
                    Responder
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Campo para novo comentário */}
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-medium">EU</span>
          </div>
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:border-purple-300">
              <input
                type="text"
                placeholder="Escreva um comentário..."
                className="w-full bg-transparent text-sm outline-none placeholder-gray-500"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Pressione Enter para enviar</span>
              </div>
              <button className="p-1 text-purple-600 hover:bg-purple-50 rounded">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente para popover de curtidas
  const renderLikesPopover = (postId: number) => {
    const likes = postLikes[postId] || [];

    if (likesPopover !== postId) return null;

    return (
      <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 min-w-[250px]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 text-sm">
            Curtidas ({likes.length})
          </h4>
          <button
            onClick={() => setLikesPopover(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {likes.map((like) => (
            <div key={like.id} className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {like.avatar}
                </span>
              </div>
              <span className="text-sm text-gray-700">{like.nome}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Função para renderizar post de evento com layout especial
  const renderEventPost = (item: any) => {
    const { eventoData } = item;

    const getEventTypeIcon = (tipo: string) => {
      switch (tipo) {
        case "workshop":
          return "🎓";
        case "apresentacao":
          return "🚀";
        case "wellness":
          return "🧘‍♀️";
        case "reuniao":
          return "👥";
        case "celebracao":
          return "🎉";
        default:
          return "📅";
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "confirmado":
          return "bg-green-100 text-green-600 border-green-200";
        case "vagas-limitadas":
          return "bg-orange-100 text-orange-600 border-orange-200";
        case "cancelado":
          return "bg-red-100 text-red-600 border-red-200";
        default:
          return "bg-blue-100 text-blue-600 border-blue-200";
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case "confirmado":
          return "Confirmado";
        case "vagas-limitadas":
          return "Vagas Limitadas";
        case "cancelado":
          return "Cancelado";
        default:
          return "Agendado";
      }
    };

    return (
      <div
        key={item.id}
        className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6"
      >
        {/* Header do Post */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {item.avatar}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{item.usuario}</h4>
            <p className="text-xs text-gray-500">
              {item.cargo} • {item.tempo}
            </p>
          </div>
          <div className="text-2xl">{getEventTypeIcon(eventoData.tipo)}</div>
        </div>

        {/* Conteúdo do Post */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed mb-4">{item.conteudo}</p>
        </div>

        {/* Card do Evento */}
        <div className="bg-white rounded-lg border border-purple-200 p-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {eventoData.titulo}
              </h3>
              <p className="text-sm text-gray-600">{eventoData.descricao}</p>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                eventoData.status
              )}`}
            >
              {getStatusText(eventoData.status)}
            </div>
          </div>

          {/* Detalhes do Evento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4 text-purple-500" />
              <span>{eventoData.data}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>{eventoData.horario}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span>{eventoData.local}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-purple-500" />
              <span>{eventoData.participantes} participantes</span>
            </div>
          </div>

          {/* Organizador */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>Organizado por {eventoData.organizador}</span>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
              {eventoData.status === "vagas-limitadas"
                ? "Garantir Vaga"
                : "Participar"}
            </button>
          </div>
        </div>

        {/* Ações do Post */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-100">
          <div className="flex items-center space-x-4">
            <div
              className="relative likes-popover-container"
              onMouseEnter={() => showLikesPopover(item.id)}
              onMouseLeave={hideLikesPopover}
            >
              <button
                onClick={() => toggleLike(item.id)}
                className={`flex items-center space-x-1 transition-colors ${
                  likedPosts[item.id]
                    ? "text-red-500"
                    : "text-gray-500 hover:text-red-500"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    likedPosts[item.id] ? "fill-current" : ""
                  }`}
                />
                <span className="text-sm">
                  {item.likes + (likedPosts[item.id] ? 1 : 0)}
                </span>
              </button>
              {renderLikesPopover(item.id)}
            </div>
            <button
              onClick={() => toggleComments(item.id)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">{item.comentarios}</span>
            </button>
          </div>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Compartilhar Evento
          </button>
        </div>

        {/* Seção de comentários */}
        {renderComments(item.id)}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "timeline":
        return (
          <div className="space-y-6">
            {/* Notificação de Avaliações Pendentes */}
            <PendingEvaluationsNotification />

            {currentPosts.map((item) => {
              // Se for um post de evento, usar layout especial
              if (item.tipo === "evento-agenda") {
                return renderEventPost(item);
              }

              // Layout padrão para outros tipos de post
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  {/* Header do Post */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {item.avatar}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.usuario}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.cargo} • {item.tempo}
                      </p>
                    </div>
                  </div>

                  {/* Conteúdo do Post */}
                  <div className="mb-4">
                    <p className="text-gray-800 leading-relaxed">
                      {item.conteudo}
                    </p>
                  </div>

                  {/* Ações do Post */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div
                        className="relative likes-popover-container"
                        onMouseEnter={() => showLikesPopover(item.id)}
                        onMouseLeave={hideLikesPopover}
                      >
                        <button
                          onClick={() => toggleLike(item.id)}
                          className={`flex items-center space-x-1 transition-colors ${
                            likedPosts[item.id]
                              ? "text-red-500"
                              : "text-gray-500 hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              likedPosts[item.id] ? "fill-current" : ""
                            }`}
                          />
                          <span className="text-sm">
                            {item.likes + (likedPosts[item.id] ? 1 : 0)}
                          </span>
                        </button>
                        {renderLikesPopover(item.id)}
                      </div>
                      <button
                        onClick={() => toggleComments(item.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">{item.comentarios}</span>
                      </button>
                    </div>
                  </div>

                  {/* Seção de comentários */}
                  {renderComments(item.id)}
                </div>
              );
            })}

            {/* Botão Carregar Mais */}
            {hasMorePosts && (
              <div className="text-center py-6">
                <button
                  onClick={loadMorePosts}
                  disabled={isLoading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Carregando...</span>
                    </div>
                  ) : (
                    "Carregar mais posts"
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Mostrando {visiblePosts} de {allTimelineData.length} posts •
                  Role para baixo para carregar automaticamente
                </p>
              </div>
            )}

            {/* Loading indicator para carregamento automático */}
            {isLoading && hasMorePosts && (
              <div className="text-center py-4">
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Carregando mais posts...</span>
                </div>
              </div>
            )}

            {/* Mensagem quando todos os posts foram carregados */}
            {!hasMorePosts && allTimelineData.length > 5 && (
              <div className="text-center py-6">
                <p className="text-gray-500">Você viu todos os posts! 🎉</p>
              </div>
            )}
          </div>
        );
      case "agenda":
        return (
          <div className="space-y-6">
            <CustomCalendar events={calendarEvents} selectedDate={new Date()} />
          </div>
        );
      case "enquetes":
        return (
          <div className="space-y-4">
            {enquetesData.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{item.titulo}</h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.status === "ativa"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.descricao}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>
                    {item.participantes}/{item.total} participantes
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <h1
                  className="text-xl sm:text-2xl font-bold text-slate-900"
                  data-testid="dashboard-title"
                >
                  Módulo Início
                </h1>
                <p className="text-slate-600 text-sm sm:text-base">
                  Seu Feed de informações e interações
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Content - 3 columns */}
              <div className="lg:col-span-3">
                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                      <button
                        onClick={() => setActiveTab("timeline")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "timeline"
                            ? "border-purple-500 text-purple-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Timeline
                      </button>
                      <button
                        onClick={() => setActiveTab("agenda")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "agenda"
                            ? "border-purple-500 text-purple-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Agenda
                      </button>
                      <button
                        onClick={() => setActiveTab("enquetes")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "enquetes"
                            ? "border-purple-500 text-purple-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Enquetes ({enquetesAtivas})
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === "timeline" && currentPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Coffee className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">
                          Nenhuma publicação foi feita
                        </p>
                      </div>
                    ) : (
                      renderTabContent()
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - 1 column */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-6 h-6 bg-red-500 rounded"></div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Aniversariantes
                    </h3>
                  </div>

                  {aniversariantes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma aniversariante ativa
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {aniversariantes.map((pessoa) => (
                        <div
                          key={pessoa.id}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {pessoa.avatar}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {pessoa.nome}
                            </p>
                            <p className="text-xs text-gray-500">
                              {pessoa.cargo}
                            </p>
                            <p className="text-xs text-purple-600 font-medium">
                              {pessoa.data}
                            </p>
                          </div>
                          {pessoa.data === "Hoje" && (
                            <Gift className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
