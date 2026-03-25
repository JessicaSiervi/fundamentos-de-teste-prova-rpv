import { validar } from "../framework-teste";

// ==================== INTERFACES ====================

interface IConta {
  id: number;
  titular: string;
  saldo: number;
  ativa: boolean;
  banco: string;
  extrato: IMovimentacao[];
}

interface IMovimentacao {
  tipo: "deposito" | "saque" | "transferencia";
  valor: number;
  data: Date;
  descricao: string;
}

interface IDepositar {
  conta: IConta;
  valor: number;
}

interface ISacar {
  conta: IConta;
  valor: number;
}

interface ITransferir {
  origem: IConta;
  destino: IConta;
  valor: number;
}

const LIMITE_TRANSFERENCIA = 5000;
const TAXA_TRANSFERENCIA = 2.5;

// ==================== FUNÇÕES ====================

function depositar(dados: IDepositar): boolean {
  const { conta, valor } = dados;

  if (!conta.ativa) return false;
  if (valor < 10) return false;

  conta.saldo += valor;

  conta.extrato.push({
    tipo: "deposito",
    valor,
    data: new Date(),
    descricao: "Depósito",
  });

  return true;
}

function sacar(dados: ISacar): boolean {
  const { conta, valor } = dados;

  if (!conta.ativa) return false;
  if (valor > conta.saldo) return false;

  conta.saldo -= valor;

  conta.extrato.push({
    tipo: "saque",
    valor,
    data: new Date(),
    descricao: "Saque",
  });

  return true;
}

function transferir(dados: ITransferir): boolean {
  const { origem, destino, valor } = dados;

  if (!origem.ativa || !destino.ativa) return false;
  if (valor > LIMITE_TRANSFERENCIA) return false;

  let taxa = 0;

  if (origem.banco !== destino.banco) {
    taxa = TAXA_TRANSFERENCIA;
  }

  const totalDebito = valor + taxa;

  if (origem.saldo < totalDebito) return false;

  origem.saldo -= totalDebito;
  destino.saldo += valor;

  origem.extrato.push({
    tipo: "transferencia",
    valor,
    data: new Date(),
    descricao: `Transferência para ${destino.titular}`,
  });

  destino.extrato.push({
    tipo: "transferencia",
    valor,
    data: new Date(),
    descricao: `Transferência de ${origem.titular}`,
  });

  return true;
}

// ==================== TESTES ====================

const conta1: IConta = {
  id: 1,
  titular: "Cliente A",
  saldo: 0,
  ativa: true,
  banco: "Banco A",
  extrato: [],
};

const conta2: IConta = {
  id: 2,
  titular: "Cliente B",
  saldo: 0,
  ativa: true,
  banco: "Banco A",
  extrato: [],
};

// 1
validar({
  descricao: "Depósito válido",
  atual: depositar({ conta: conta1, valor: 100 }),
  esperado: true,
});

// 2
validar({
  descricao: "Depósito inválido (abaixo do mínimo)",
  atual: depositar({ conta: conta1, valor: 5 }),
  esperado: false,
});

// 3
validar({
  descricao: "Saque válido",
  atual: sacar({ conta: conta1, valor: 50 }),
  esperado: true,
});

// 4
validar({
  descricao: "Saque acima do saldo",
  atual: sacar({ conta: conta1, valor: 999 }),
  esperado: false,
});

// 5
validar({
  descricao: "Transferência dentro do banco",
  atual: transferir({
    origem: conta1,
    destino: conta2,
    valor: 10,
  }),
  esperado: true,
});

// 6
const conta3: IConta = {
  id: 3,
  titular: "Cliente C",
  saldo: 1000,
  ativa: true,
  banco: "Banco B",
  extrato: [],
};

validar({
  descricao: "Transferência para outro banco com taxa",
  atual: transferir({
    origem: conta3,
    destino: conta1,
    valor: 100,
  }),
  esperado: true,
});

// 7
validar({
  descricao: "Transferência acima do limite",
  atual: transferir({
    origem: conta3,
    destino: conta1,
    valor: 6000,
  }),
  esperado: false,
});

// 8
const contaInativa: IConta = {
  id: 4,
  titular: "Inativo",
  saldo: 100,
  ativa: false,
  banco: "Banco A",
  extrato: [],
};

validar({
  descricao: "Operação em conta inativa",
  atual: depositar({ conta: contaInativa, valor: 50 }),
  esperado: false,
});

// 9
validar({
  descricao: "Saldo após operações",
  atual: conta1.saldo > 0,
  esperado: true,
});

// 10
validar({
  descricao: "Extrato registra movimentação",
  atual: conta1.extrato.length > 0,
  esperado: true,
});