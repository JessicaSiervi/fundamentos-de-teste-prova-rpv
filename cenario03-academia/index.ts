import { validar } from "../framework-teste";

// ==================== INTERFACES ====================

interface IAluno {
  id: number;
  nome: string;
  plano: "mensal" | "trimestral" | "anual";
  dataInicio: Date;
  personal: boolean;
  ativo: boolean;
  vencimento: Date;
}

interface ICheckin {
  alunoId: number;
  horario: Date;
}

interface IRegistroCheckin {
  alunoId: number;
  data: string;
}

interface IResultadoPlano {
  valorMensal: number;
  valorTotal: number;
  ehValido: boolean;
}

interface IResultadoCheckin {
  permitido: boolean;
  mensagem: string;
}

interface IResultadoCancelamento {
  multa: number;
  ehValido: boolean;
}

// ==================== DADOS ====================

const alunos: IAluno[] = [
  {
    id: 1,
    nome: "Carlos Silva",
    plano: "mensal",
    dataInicio: new Date("2026-03-01"),
    personal: false,
    ativo: true,
    vencimento: new Date("2026-04-01"),
  },
  {
    id: 2,
    nome: "Ana Souza",
    plano: "trimestral",
    dataInicio: new Date("2026-01-15"),
    personal: true,
    ativo: true,
    vencimento: new Date("2026-04-15"),
  },
  {
    id: 3,
    nome: "Pedro Lima",
    plano: "anual",
    dataInicio: new Date("2025-06-01"),
    personal: false,
    ativo: true,
    vencimento: new Date("2026-06-01"),
  },
  {
    id: 4,
    nome: "Julia Santos",
    plano: "mensal",
    dataInicio: new Date("2026-02-01"),
    personal: false,
    ativo: true,
    vencimento: new Date("2026-03-01"),
  },
  {
    id: 5,
    nome: "Roberto Dias",
    plano: "trimestral",
    dataInicio: new Date("2026-01-01"),
    personal: true,
    ativo: false,
    vencimento: new Date("2026-04-01"),
  },
];

const checkIns: IRegistroCheckin[] = [];

// ==================== FUNÇÕES ====================

function calcularPlano(plano: string, personal: boolean): IResultadoPlano {
  let valorBase = 0;
  let meses = 0;

  if (plano === "mensal") {
    valorBase = 99.9;
    meses = 1;
  } else if (plano === "trimestral") {
    valorBase = 249.9;
    meses = 3;
  } else if (plano === "anual") {
    valorBase = 899.9;
    meses = 12;
  } else {
    return { valorMensal: 0, valorTotal: 0, ehValido: false };
  }

  let valorMensal = valorBase / meses;

  if (personal) {
    valorMensal += 50;
  }

  const valorTotal = valorMensal * meses;

  return {
    valorMensal: Number(valorMensal.toFixed(2)),
    valorTotal: Number(valorTotal.toFixed(2)),
    ehValido: true,
  };
}

function realizarCheckin(checkin: ICheckin): IResultadoCheckin {
  const aluno = alunos.find((a) => a.id === checkin.alunoId);

  if (!aluno) return { permitido: false, mensagem: "Aluno não encontrado" };

  if (!aluno.ativo) return { permitido: false, mensagem: "Aluno inativo" };

  if (aluno.vencimento < checkin.horario) {
    return { permitido: false, mensagem: "Mensalidade vencida" };
  }

  const hora = checkin.horario.getHours();

  if (hora < 6 || hora > 23) {
    return { permitido: false, mensagem: "Fora do horário" };
  }

  const data = checkin.horario.toISOString().split("T")[0];

  const jaFez = checkIns.some((c) => c.alunoId === aluno.id && c.data === data);

  if (jaFez) {
    return { permitido: false, mensagem: "Check-in duplicado" };
  }

  checkIns.push({
    alunoId: aluno.id,
    data,
  });

  return { permitido: true, mensagem: "OK" };
}

function cancelarPlano(alunoId: number): IResultadoCancelamento {
  const aluno = alunos.find((a) => a.id === alunoId);

  if (!aluno || !aluno.ativo) {
    return { multa: 0, ehValido: false };
  }

  const hoje = new Date("2026-03-20");

  const diffMs = aluno.vencimento.getTime() - hoje.getTime();

  if (diffMs <= 0) {
    return { multa: 0, ehValido: true };
  }

  const dias = diffMs / (1000 * 60 * 60 * 24);
  const mesesRestantes = Math.ceil(dias / 30);

  let valorMensal = 0;

  if (aluno.plano === "mensal") valorMensal = 99.9;
  if (aluno.plano === "trimestral") valorMensal = 249.9 / 3;
  if (aluno.plano === "anual") valorMensal = 899.9 / 12;

  if (aluno.personal) {
    valorMensal += 50;
  }

  const valorRestante = mesesRestantes * valorMensal;
  const multa = valorRestante * 0.2;

  return {
    multa: Number(multa.toFixed(2)),
    ehValido: true,
  };
}

// ==================== TESTES ====================

const teste1 = calcularPlano("mensal", false);
validar({ descricao: "Teste 1", atual: teste1.valorMensal, esperado: 99.9 });

const teste2 = calcularPlano("anual", false);
validar({ descricao: "Teste 2", atual: teste2.valorTotal, esperado: 899.9 });

const teste3 = realizarCheckin({
  alunoId: 1,
  horario: new Date("2026-03-20T10:00:00"),
});
validar({ descricao: "Teste 3", atual: teste3.permitido, esperado: true });

const teste4 = realizarCheckin({
  alunoId: 1,
  horario: new Date("2026-03-20T18:00:00"),
});
validar({ descricao: "Teste 4", atual: teste4.permitido, esperado: false });

const teste5 = realizarCheckin({
  alunoId: 2,
  horario: new Date("2026-03-20T05:00:00"),
});
validar({ descricao: "Teste 5", atual: teste5.permitido, esperado: false });

const teste6 = cancelarPlano(2);
validar({ descricao: "Teste 6", atual: teste6.ehValido, esperado: true });

const teste7 = realizarCheckin({
  alunoId: 4,
  horario: new Date("2026-03-20T10:00:00"),
});
validar({ descricao: "Teste 7", atual: teste7.permitido, esperado: false });

const teste8 = calcularPlano("mensal", true);
validar({ descricao: "Teste 8", atual: teste8.valorMensal, esperado: 149.9 });

const teste9 = calcularPlano("anual", true);
validar({ descricao: "Teste 9", atual: teste9.valorTotal, esperado: 1499.9 });

const teste10 = calcularPlano("semanal", false);
validar({ descricao: "Teste 10", atual: teste10.ehValido, esperado: false });