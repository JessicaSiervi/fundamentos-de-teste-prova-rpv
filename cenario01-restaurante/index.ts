import { validar } from "../framework-teste";

// ==================== INTERFACES ====================

interface IItemCardapio {
  id: number;
  nome: string;
  preco: number;
  categoria: "prato" | "bebida" | "sobremesa";
}

interface IItemPedido {
  itemId: number;
  quantidade: number;
}

interface IPedido {
  itens: IItemPedido[];
  gorjeta: boolean;
}

interface IResultadoPedido {
  subtotal: number;
  desconto: number;
  taxaEntrega: number;
  gorjeta: number;
  valorTotal: number;
  ehValido: boolean;
}

// ==================== DADOS ====================

const cardapio: IItemCardapio[] = [
  { id: 1, nome: "X-Burguer", preco: 32.0, categoria: "prato" },
  { id: 2, nome: "Batata Frita", preco: 18.0, categoria: "prato" },
  { id: 3, nome: "Refrigerante", preco: 8.0, categoria: "bebida" },
  { id: 4, nome: "Suco Natural", preco: 12.0, categoria: "bebida" },
  { id: 5, nome: "Pudim", preco: 15.0, categoria: "sobremesa" },
  { id: 6, nome: "Sorvete", preco: 10.0, categoria: "sobremesa" },
  { id: 7, nome: "Picanha", preco: 65.0, categoria: "prato" },
  { id: 8, nome: "Cerveja", preco: 14.0, categoria: "bebida" },
];

// ==================== FUNÇÃO ====================

function calcularPedido(pedido: IPedido): IResultadoPedido {
  if (!pedido.itens || pedido.itens.length === 0) {
    return {
      subtotal: 0,
      desconto: 0,
      taxaEntrega: 0,
      gorjeta: 0,
      valorTotal: 0,
      ehValido: false,
    };
  }

  let subtotal = 0;
  let totalItens = 0;

  let temPrato = false;
  let temBebida = false;
  let temSobremesa = false;

  for (const itemPedido of pedido.itens) {
    const item = cardapio.find((i) => i.id === itemPedido.itemId);
    if (!item) continue;

    subtotal += item.preco * itemPedido.quantidade;
    totalItens += itemPedido.quantidade;

    if (item.categoria === "prato") temPrato = true;
    if (item.categoria === "bebida") temBebida = true;
    if (item.categoria === "sobremesa") temSobremesa = true;
  }

  if (subtotal < 25 || totalItens > 20) {
    return {
      subtotal,
      desconto: 0,
      taxaEntrega: 0,
      gorjeta: 0,
      valorTotal: 0,
      ehValido: false,
    };
  }

  const gorjeta = pedido.gorjeta ? subtotal * 0.1 : 0;
  const temCombo = temPrato && temBebida && temSobremesa;
  const desconto = temCombo ? subtotal * 0.15 : 0;
  const taxaEntrega = subtotal > 100 ? 0 : 8;

  const valorTotal = subtotal - desconto + gorjeta + taxaEntrega;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    desconto: Number(desconto.toFixed(2)),
    taxaEntrega,
    gorjeta: Number(gorjeta.toFixed(2)),
    valorTotal: Number(valorTotal.toFixed(2)),
    ehValido: true,
  };
}

// ==================== TESTES ====================

// 1
const teste1 = calcularPedido({
  itens: [
    { itemId: 1, quantidade: 1 },
    { itemId: 3, quantidade: 1 },
  ],
  gorjeta: false,
});
validar({ descricao: "Teste 1", atual: teste1.valorTotal, esperado: 48 });

// 2
const teste2 = calcularPedido({
  itens: [
    { itemId: 1, quantidade: 2 },
    { itemId: 7, quantidade: 1 },
  ],
  gorjeta: false,
});
validar({ descricao: "Teste 2", atual: teste2.valorTotal, esperado: 129 });

// 3
const teste3 = calcularPedido({
  itens: [
    { itemId: 1, quantidade: 1 },
    { itemId: 3, quantidade: 1 },
    { itemId: 5, quantidade: 1 },
  ],
  gorjeta: false,
});
validar({ descricao: "Teste 3", atual: teste3.valorTotal, esperado: 54.75 });

// 4
const teste4 = calcularPedido({
  itens: [
    { itemId: 1, quantidade: 1 },
    { itemId: 3, quantidade: 1 },
    { itemId: 5, quantidade: 1 },
  ],
  gorjeta: true,
});
validar({ descricao: "Teste 4", atual: teste4.valorTotal, esperado: 60.25 });

// 5
const teste5 = calcularPedido({
  itens: [{ itemId: 3, quantidade: 1 }],
  gorjeta: false,
});
validar({ descricao: "Teste 5", atual: teste5.ehValido, esperado: false });

// 6
const teste6 = calcularPedido({
  itens: [],
  gorjeta: false,
});
validar({ descricao: "Teste 6", atual: teste6.ehValido, esperado: false });

// 7
const teste7 = calcularPedido({
  itens: [{ itemId: 3, quantidade: 21 }],
  gorjeta: false,
});
validar({ descricao: "Teste 7", atual: teste7.ehValido, esperado: false });

// 8
const teste8 = calcularPedido({
  itens: [
    { itemId: 7, quantidade: 1 },
    { itemId: 2, quantidade: 1 },
  ],
  gorjeta: true,
});
validar({ descricao: "Teste 8", atual: teste8.valorTotal, esperado: 99.3 });

// 9
const teste9 = calcularPedido({
  itens: [
    { itemId: 7, quantidade: 2 },
    { itemId: 8, quantidade: 1 },
    { itemId: 6, quantidade: 1 },
  ],
  gorjeta: true,
});
validar({ descricao: "Teste 9", atual: teste9.valorTotal, esperado: 146.3 });

// 10
const teste10 = calcularPedido({
  itens: [
    { itemId: 3, quantidade: 2 },
    { itemId: 4, quantidade: 1 },
  ],
  gorjeta: false,
});
validar({ descricao: "Teste 10", atual: teste10.valorTotal, esperado: 36 });